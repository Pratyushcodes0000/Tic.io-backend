const startGame = require("./startGame");

module.exports = function roomManager(io, player1, player2) {
  const roomId = `room_${player1}_${player2}`;

  const socketP1 = io.sockets.sockets.get(player1);
  const socketP2 = io.sockets.sockets.get(player2);

  if (!socketP1 || !socketP2) return;

  socketP1.join(roomId);
  socketP2.join(roomId);

  console.log("Room created", roomId);

  socketP1.roomId = roomId;
  socketP2.roomId = roomId;

  // Notify both clients that they joined a room
  io.to(roomId).emit("joined_room", {
    roomId,
    players: [player1, player2],
  });

  startGame(io, socketP1, socketP2, player1, player2, roomId);

  // ---- DISCONNECT HANDLERS ----
  socketP1.once("disconnect", () => {
    io.to(roomId).emit("opponent_disconnected", { winner: player2 });
  });

  socketP2.once("disconnect", () => {
    io.to(roomId).emit("opponent_disconnected", { winner: player1 });
  });
};
