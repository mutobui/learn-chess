import {can_move_there, make_move} from '../until/helper';

// Fisher-Yates shuffle
export function shuffle(passed_in_array) {
    const array = passed_in_array.slice();
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
        [array[i], array[j]] = [array[j], array[i]]; // swap elements
    }
    return array;
}

// function to reverse an array
function reverseArray(array) {
    return array.slice().reverse();
}

// return value of a piece
function get_piece_value(piece, position) {
    let pieceValue = 0;
    if (piece.ascii == null) return 0;

    // these arrays help adjust the piece's value
    // depending on where the piece is on the board
    var pawnEvalWhite = [
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
        [1.0, 1.0, 2.0, 3.0, 3.0, 2.0, 1.0, 1.0],
        [0.5, 0.5, 1.0, 2.5, 2.5, 1.0, 0.5, 0.5],
        [0.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 0.0],
        [0.5, -0.5, -1.0, 0.0, 0.0, -1.0, -0.5, 0.5],
        [0.5, 1.0, 1.0, -2.0, -2.0, 1.0, 1.0, 0.5],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    ];
    var pawnEvalBlack = reverseArray(pawnEvalWhite);

    var knightEval = [
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
        [-4.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -4.0],
        [-3.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -3.0],
        [-3.0, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, -3.0],
        [-3.0, 0.0, 1.5, 2.0, 2.0, 1.5, 0.0, -3.0],
        [-3.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -3.0],
        [-4.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -4.0],
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
    ];

    var bishopEvalWhite = [
        [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
        [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
        [-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
        [-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
        [-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
        [-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
        [-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
        [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    ];
    var bishopEvalBlack = reverseArray(bishopEvalWhite);

    var rookEvalWhite = [
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        [0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
        [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
        [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
        [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
        [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
        [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
        [0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0],
    ];
    var rookEvalBlack = reverseArray(rookEvalWhite);

    var evalQueen = [
        [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
        [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
        [-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
        [-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
        [0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
        [-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
        [-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
        [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    ];

    var kingEvalWhite = [
        [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
        [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
        [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
        [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
        [-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
        [-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
        [2.0, 2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 2.0],
        [2.0, 3.0, 1.0, 0.0, 0.0, 1.0, 3.0, 2.0],
    ];
    var kingEvalBlack = reverseArray(kingEvalWhite);

    let x = Math.floor(position / 8);
    let y = position % 8;

    switch (piece.ascii.toLowerCase()) {
        case "p":
            pieceValue =
                100 +
                10 * (piece.ascii === "p" ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x]);
            break;
        case "r":
            pieceValue =
                525 +
                10 * (piece.ascii === "r" ? rookEvalWhite[y][x] : rookEvalBlack[y][x]);
            break;
        case "n":
            pieceValue = 350 + 10 * knightEval[y][x];
            break;
        case "b":
            pieceValue =
                350 +
                10 *
                (piece.ascii === "b" ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x]);
            break;
        case "q":
            pieceValue = 1000 + 10 * evalQueen[y][x];
            break;
        case "k":
            pieceValue =
                10000 +
                10 * (piece.ascii === "k" ? kingEvalWhite[y][x] : kingEvalBlack[y][x]);
            break;
        default:
            pieceValue = 0;
            break;
    }
    return piece.player === "b" ? pieceValue : -pieceValue;
}

// helper function for minimax: calculate black's status using piece values
function evaluate_black(squares) {
    let total_eval = 0;
    for (let i = 0; i < 64; i++) total_eval += get_piece_value(squares[i], i);
    return total_eval;
}

// helper function for execute_bot: minimax algorithm for chess bot
function minimax(
    depth,
    is_black_player,
    alpha,
    beta,
    squares,
    RA_of_starts,
    RA_of_ends,
    passant_pos
) {
    const copy_squares = squares.slice();
    if (depth === 0) {
        return evaluate_black(copy_squares);
    }

    let best_value = is_black_player ? -9999 : 9999;
    // iterate through the possible start positions
    for (let i = 0; i < 64; i++) {
        let start = RA_of_starts[i];
        let isPlayerPiece =
            copy_squares[start].ascii != null &&
            copy_squares[start].player === (is_black_player ? "b" : "w");

        // start should be the position of a piece owned by the player
        if (isPlayerPiece) {
            /* iterate through the possible end positions for each possible start position
             * and use recursion to see what the value of each possible move will be a few moves
             * down the road. if the move being analyzed is black's turn, the value will maximize
             * best_value; but if the move being analyzed is white's turn, the value will minimize
             * best_value
             */
            for (let j = 0; j < 64; j++) {
                let end = RA_of_ends[j];
                if (
                    can_move_there(start, end, copy_squares, passant_pos) === true
                ) {
                    const test_squares = squares.slice();
                    // make the move on test board
                    const test_squares_2 = make_move(
                        test_squares,
                        start,
                        end,
                        passant_pos
                    ).slice();
                    // en passant helper
                    var passant = 65;
                    if (
                        test_squares[end].ascii === (is_black_player ? "P" : "p") &&
                        start >= (is_black_player ? 8 : 48) &&
                        start <= (is_black_player ? 15 : 55) &&
                        end - start === (is_black_player ? 16 : -16)
                    ) {
                        passant = end;
                    }

                    // black player maximizes value, white player minimizes value
                    let value = minimax(
                        depth - 1,
                        !is_black_player,
                        alpha,
                        beta,
                        test_squares_2,
                        RA_of_starts,
                        RA_of_ends,
                        passant
                    );
                    if (is_black_player) {
                        if (value > best_value) best_value = value;
                        alpha = Math.max(alpha, best_value); //alpha-beta pruning
                        if (best_value >= beta) return best_value;
                    } else {
                        if (value < best_value) best_value = value;
                        beta = Math.min(beta, best_value); //alpha-beta pruning
                        if (best_value <= alpha) return best_value;
                    }
                }
            }
        }
    }

    return best_value;
}


// Chess bot for black player
export function execute_bot(depth, passed_in_squares, state, setState) {
    if (state.mated) return "bot cannot run";
    const copy_squares = passed_in_squares.slice();
    let rand_start = 100;
    let rand_end = 100;
    let RA_of_starts = [];
    let RA_of_ends = [];
    for (let i = 0; i < 64; i++) {
      RA_of_starts.push(i);
      RA_of_ends.push(i);
    }
    RA_of_starts = shuffle(RA_of_starts);
    RA_of_ends = shuffle(RA_of_ends);

    // create array of possible moves
    let moves = [];
    for (let i = 0; i < 64; i++) {
      let start = RA_of_starts[i];
      let isBlackPiece =
        copy_squares[start].ascii != null && copy_squares[start].player === "b";
      if (isBlackPiece) {
        for (let j = 0; j < 64; j++) {
          let end = RA_of_ends[j];
          if (can_move_there(start, end, copy_squares) === true) {
            moves.push(start);
            moves.push(end);
          }
        }
      }
    }

    let best_value = -9999;
    /* iterate through the possible movements and choose the movement from start to end that results in the best
     * position for black in terms of value calculated by evaluate_black; minimax algo lets bot look ahead a few
     * moves and thereby pick the move that results in the best value in the long run
     */
    for (let i = 0; i < moves.length; i += 2) {
      let start = moves[i];
      let end = moves[i + 1];
      // 3-fold repetiton by bot NOT ALLOWED if there are other move options
      if (
        moves.length > 2 &&
        state.repetition >= 2 &&
        start === state.second_pos &&
        end === state.first_pos
      ) {
        setState({
          repetition: 0,
        });
      } else {
        const test_squares = passed_in_squares.slice();
        // make the move
        const test_squares_2 = make_move(test_squares, start, end).slice();
        // en passant helper
        var passant_pos = 65;
        if (
          test_squares[start].ascii === "P" &&
          start >= 8 &&
          start <= 15 &&
          end - start === 16
        )
          passant_pos = end;

        // board evaluation using mini_max algorithm by looking at future turns
        let board_eval = minimax(
          depth - 1,
          false,
          -1000,
          1000,
          test_squares_2,
          RA_of_starts,
          RA_of_ends,
          passant_pos
        );
        if (board_eval >= best_value) {
          best_value = board_eval;
          rand_start = start;
          rand_end = end;
        }
      }
    }

    if (rand_end !== 100) {
      // rand_end == 100 indicates that black is in checkmate/stalemate
      // increment state.repetition if black keeps moving a piece back and forth consecutively
      if (
        rand_start === state.second_pos &&
        rand_end === state.first_pos
      ) {
        let reps = state.repetition + 1;
        setState({
          repetition: reps,
        });
      } else {
        setState({
          repetition: 0,
        });
      }

      execute_move("b", copy_squares, rand_start, rand_end);
    }
  }
