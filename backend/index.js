const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const mysql = require("mysql");
const { Server } = require("socket.io");
app.use(cors());
app.use(function(req,res,next){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-control-Allow-Methods', 'GET,POSt');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

const db = mysql.createConnection({
  host: "sql6.freemysqlhosting.net",
  user: "sql6524414",
  password: "AhLBp5RM39",
  database: "sql6524414",
});
db.connect(function (error) {
})

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);

  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
    db.query("INSERT INTO chat_app (sender,reciever,message) VALUES ('"+data.room+"','"+data.author+"',' " + data.message + " ')");
    console.log(data.room, data)
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(process.env.PORT || 5000, function(){
  console.log("Express server listening on port 5000", this.address().port, app.settings.env);
});