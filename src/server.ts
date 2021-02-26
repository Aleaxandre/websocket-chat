import express from "express";
import * as dotenv from "dotenv";
import { Server, Socket } from "socket.io";
import * as http from "http";
import { v4 as uuidv4 } from 'uuid';
import { IUser } from "./user";

dotenv.config();

// app.use(helmet());
// app.use(cors());
// app.use(express.json());

const app = express();

const server = new http.Server(app);
const io = new Server(server);

let userIndex = 0;
const connectedUsers: IUser[] = [];

io.on("connection", (socket: Socket) => {
  console.log("a user connected");
  userIndex += 1;
  const user = { username: `Anonymous${userIndex}`, uuid: uuidv4() } as IUser;
  socket.emit("salutations", { text: `Hello ${user.username} !`, uuid: user.uuid, isServerMsg: true });
  connectedUsers.push(user);

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    io.emit('chat message', { username: user.username, uuid: user.uuid, text: msg, isServerMsg: false });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.get("/", (request: express.Request, response: express.Response) => {
  response.sendFile(__dirname + "/index.html");
});

server.listen(process.env.SERVER_PORT, () => {
  console.log(
    `[server]: Server is running at https://localhost:${process.env.SERVER_PORT}`
  );
});
