module.exports = function moves(
  io,
  roomId,
  socketP1,
  socketP2,
  player1,
  player2,
) {
  try {
    const initialBoard = ["", "", "", "", "", "", "", "", ""];
    let board = [...initialBoard];
    let turn = "X";

    const checkWinner = (board) => {
      // All possible winning combinations
      const winPatterns = [
        [0, 1, 2], // rows
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6], // columns
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8], // diagonals
        [2, 4, 6],
      ];

      for (let pattern of winPatterns) {
        const [a, b, c] = pattern;

        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return board[a]; // returns 'X' or 'O'
        }
      }

      // Check draw: If no empty cell remains
      if (!board.includes("")) return "draw";

      // Continue game
      return null;
    };

    const handleMove = ({ index, symbol }) => {
      console.log(`move received for ${symbol} on ${index}`);
      if (symbol !== turn || board[index] !== "") return;

      board[index] = symbol;
      turn = turn === "X" ? "O" : "X";

      console.log("Board status", board);
      console.log("Turn", turn);

      let result = checkWinner(board);

      if (result === "X" || result === "O") {
        console.log(result, " won!");
        io.to(roomId).emit("game:end", {
          result,
          board,
        });
        return;
      } else if (result === "draw") {
        console.log("Match Draw!");
        io.to(roomId).emit("game:end", {
          result: "draw",
          board,
        });
        return;
      } else {
        console.log("Continue playing...");
        io.to(roomId).emit("move:done", {
          board,
          turn,
        });
      }
    };

    socketP1.on("move", handleMove);
    socketP2.on("move", handleMove);
  } catch (error) {
    console.error("error making move", error);
  }
};
