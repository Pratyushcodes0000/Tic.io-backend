const move = require("./move");

module.exports = function startGame(
  io,
  socketP1,
  socketP2,
  player1,
  player2,
  roomId,
) {
  try {
    const players = {
      [player1.id]: "X",
      [player2.id]: "O",
    };
    //game state
    const gameState = {
      roomId,
      board: ["", "", "", "", "", "", "", "", ""],
      turn: "X",
      players,
      move: 0,
      winner: null,
      status: "playing",
    };

    io.to(roomId).emit("game:start", {
      roomId,
      board: gameState.board,
      turn: gameState.turn,
      players: gameState.players,
      move: gameState.move,
      status: gameState.status,
    });

    socketP1.emit("symbol", { symbol: "X", opponent: "O" });
    socketP2.emit("symbol", { symbol: "O", opponent: "X" });

    console.log("Emitted symbol to:", socketP1.id, socketP2.id);

    console.log("Game started", gameState); //deleting later

    move(io, roomId, socketP1, socketP2, player1, player2); // handles player moves and ending
  } catch (error) {
    console.error("Error starting game", error);
  }
};
