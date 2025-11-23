const queue = require("../queue");

module.exports = function FindMatch(io, socket) {
  socket.on("find_match", async () => {
    //obtain playerId(socket id)
    const playerId = socket.id;

    //add player to queue for match making

    queue.enqueue(playerId);

    //attempt a match making
    attemptMatch(io);
  });

  socket.on("disconnect", () => {
    // Remove the player if they were at front
    if (queue.front() === socket.id) {
      queue.dequeue();
    }
  });
};

const attemptMatch = (io) => {
  if (queue.size() >= 2) {
    const player1 = queue.dequeue();
    const player2 = queue.dequeue();

    const s1 = io.sockets.sockets.get(player1);
    const s2 = io.sockets.sockets.get(player2);

    if (!s1 || !s2) return;

    console.log("Matched:", player1, player2);

    io.to(player1).emit("match_found", { opponent: player2 });
    io.to(player2).emit("match_found", { opponent: player1 });

    let readyCount = 0;

    const handleReady = () => {
      readyCount++;
      if (readyCount === 2) {
        const roomManager = require("./roomManager");
        roomManager(io, player1, player2);
      }
    };
    //checking if both plaers are ready
    s1.once("ready_for_game", handleReady);
    s2.once("ready_for_game", handleReady);
  }
};
