import { Server } from "socket.io";

const socketMain = (io: Server) => {
  io.on("connection", (socket) => {
    const auth = socket.handshake.auth
    if (auth.token === '123') {
      socket.join('reactClient')
    } else {
      socket.disconnect()
      console.log('Invalid token')
    }
    console.log(`Worker ${process.pid} received connection`);

    socket.on("water", (data) => {
      console.log(`Message from water: ${data.id} - ${data.status}`);
      if (data.status === 'ON') {
        socket.emit("water-ON", "ON from server");
        console.log(`Message from server: ${data.id} - ${data.status}`);
      }
      else if (data.status === 'OFF') {
        socket.emit("water-OFF", "OFF from server");
        console.log(`Message from server: ${data.id} - ${data.status}`);
      }
    })
    socket.on("disconnect", () => {
      io.to('reactClient').emit('connectedOrNot', {isAlive: false})
    });
  });
}

export default socketMain;