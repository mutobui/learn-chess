import {
  Queen, Pawn, King, Bishop, Knight, Rook, filler_piece
} from '../pieces/pieces';

// Helper Function for Board Constructor =================
// initialize the chess board
export function initializeBoard() {
  const squares = Array(64).fill(null);
  // black pawns
  for (let i = 8; i < 16; i++) {
    squares[i] = new Pawn("b");
  }
  // white pawns
  for (let i = 8 * 6; i < 8 * 6 + 8; i++) {
    squares[i] = new Pawn("w");
  }
  // black knights
  squares[1] = new Knight("b");
  squares[6] = new Knight("b");
  // white knights
  squares[56 + 1] = new Knight("w");
  squares[56 + 6] = new Knight("w");
  // black bishops
  squares[2] = new Bishop("b");
  squares[5] = new Bishop("b");
  // white bishops
  squares[56 + 2] = new Bishop("w");
  squares[56 + 5] = new Bishop("w");
  // black rooks
  squares[0] = new Rook("b");
  squares[7] = new Rook("b");
  // white rooks
  squares[56 + 0] = new Rook("w");
  squares[56 + 7] = new Rook("w");
  // black queen & king
  squares[3] = new Queen("b");
  squares[4] = new King("b");
  // white queen & king
  squares[56 + 3] = new Queen("w");
  squares[56 + 4] = new King("w");

  for (let i = 0; i < 64; i++) {
    if (squares[i] == null) squares[i] = new filler_piece(null);
  }

  console.log("squares: ", squares);

  return squares;
}

// Helper Functions for Render ===========================
// return the color of a square for the chess board
export function calc_squareColor(i, j, squares) {
  let square_color =
    (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
      ? "white_square"
      : "black_square";
  if (squares[i * 8 + j].highlight === 1) {
    square_color =
      (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
        ? "selected_white_square"
        : "selected_black_square";
  }
  if (squares[i * 8 + j].possible === 1) {
    square_color =
      (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
        ? "highlighted_white_square"
        : "highlighted_black_square";
  }
  if (
    squares[i * 8 + j].ascii != null &&
    squares[i * 8 + j].ascii.toLowerCase() === "k"
  ) {
    if (squares[i * 8 + j].in_check === 1) {
      square_color =
        (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))
          ? "in_check_square_white"
          : "in_check_square_black";
    }
    if (squares[i * 8 + j].checked >= 1) {
      square_color =
        squares[i * 8 + j].checked === 1 ? "checked_square" : "stale_square";
    }
  }
  return square_color;
}

// Helper Functions to Handle Square Highlighting ========
// highlight king if in checkmate/stalemate
export function highlight_mate(player, squares, check_mated, stale_mated) {
  const copy_squares = squares.slice();
  if (check_mated || stale_mated) {
    for (let j = 0; j < 64; j++) {
      if (copy_squares[j].ascii === (player === "w" ? "k" : "K")) {
        copy_squares[j].checked = check_mated === true ? 1 : 2;
        break;
      }
    }
  }
  return copy_squares;
}

// clear highlights for squares that are selected
export function clear_highlight(squares) {
  const copy_squares = squares.slice();
  for (let j = 0; j < 64; j++) {
    if (copy_squares[j].highlight === 1) copy_squares[j].highlight = 0;
  }
  return copy_squares;
}

// clear highlights for possible destination squares
export function clear_possible_highlight(squares) {
  const copy_squares = squares.slice();
  for (let j = 0; j < 64; j++) {
    if (copy_squares[j].possible === 1) copy_squares[j].possible = 0;
  }
  return copy_squares;
}

// clear the red higlight for checked king
export function clear_check_highlight(squares, player) {
  const copy_squares = squares.slice();
  for (let j = 0; j < 64; j++) {
    if (copy_squares[j].ascii === (player === "w" ? "k" : "K")) {
      copy_squares[j].in_check = 0; // user has heeded warning
      break;
    }
  }
  return copy_squares;
}

// Miscellaneous Functions ===============================
// return if value is even
function isEven(value) {
  return value % 2;
}

// returns true if castling is allowed
export function castling_allowed(start, end, squares, state) {
  const copy_squares = squares.slice();
  var player = copy_squares[start].player;
  var delta_pos = end - start;
  if (start !== (player === "w" ? 60 : 4)) return false;
  if (
    (delta_pos === 2
      ? copy_squares[end + 1].ascii
      : copy_squares[end - 2].ascii) !== (player === "w" ? "r" : "R")
  )
    return false;
  if (
    (player === "w"
      ? state.white_king_has_moved
      : state.black_king_has_moved) !== 0
  )
    return false;
  if (player === "w") {
    if (
      (delta_pos === 2
        ? state.right_white_rook_has_moved
        : state.left_white_rook_has_moved) !== 0
    )
      return false;
  } else if (player === "b") {
    if (
      (delta_pos === 2
        ? state.right_black_rook_has_moved
        : state.left_black_rook_has_moved) !== 0
    )
      return false;
  }

  return true;
}

// return true if pawn is not breaking any of its rules
export function good_pawn(start, end, squares, state_passant_pos, passant_pos) {
  var passant = passant_pos == null ? state_passant_pos : passant_pos;
  var start_row = 8 - Math.floor(start / 8);
  var start_col = (start % 8) + 1;
  var end_row = 8 - Math.floor(end / 8);
  var end_col = (end % 8) + 1;
  var row_diff = end_row - start_row;
  var col_diff = end_col - start_col;
  const copy_squares = squares.slice();

  // only allow 2 space move if the pawn is in the start position
  if (row_diff === 2 || row_diff === -2) {
    if (copy_squares[start].player === "w" && (start < 48 || start > 55))
      return false;
    if (copy_squares[start].player === "b" && (start < 8 || start > 15))
      return false;
  }
  // cannot move up/down if there is a piece
  if (copy_squares[end].ascii != null) {
    if (col_diff === 0) return false;
  }
  // cannot move diagonally if there is no piece to capture UNLESS it's en passant
  if (row_diff === 1 && col_diff === 1) {
    // white going up and right
    if (copy_squares[end].ascii == null) {
      if (copy_squares[start + 1].ascii !== "P" || passant !== start + 1)
        return false;
    }
  } else if (row_diff === 1 && col_diff === -1) {
    // white going up and left
    if (copy_squares[end].ascii == null) {
      if (copy_squares[start - 1].ascii !== "P" || passant !== start - 1)
        return false;
    }
  } else if (row_diff === -1 && col_diff === 1) {
    // black going down and right
    if (copy_squares[end].ascii == null) {
      if (copy_squares[start + 1].ascii !== "p" || passant !== start + 1)
        return false;
    }
  } else if (row_diff === -1 && col_diff === -1) {
    // black going down and left
    if (copy_squares[end].ascii == null) {
      if (copy_squares[start - 1].ascii !== "p" || passant !== start - 1)
        return false;
    }
  }

  return true;
}

// return true if move from start to end is illegal
export function invalid_move(start, end, squares, passant_pos) {
  const copy_squares = squares.slice();
  // if the piece is a bishop, queen, rook, or pawn,
  // it cannot skip over pieces
  var bqrpk =
    copy_squares[start].ascii.toLowerCase() === "r" ||
    copy_squares[start].ascii.toLowerCase() === "q" ||
    copy_squares[start].ascii.toLowerCase() === "b" ||
    copy_squares[start].ascii.toLowerCase() === "p" ||
    copy_squares[start].ascii.toLowerCase() === "k";
  let invalid =
    bqrpk === true && blockers_exist(start, end, copy_squares) === true;
  if (invalid) return invalid;
  // checking for certain rules regarding the pawn
  var pawn = copy_squares[start].ascii.toLowerCase() === "p";
  invalid =
    pawn === true &&
    good_pawn(start, end, copy_squares, passant_pos) === false;
  if (invalid) return invalid;
  // checking for if castling is allowed
  var king = copy_squares[start].ascii.toLowerCase() === "k";
  if (king && Math.abs(end - start) === 2)
    invalid = castling_allowed(start, end, copy_squares) === false;

  return invalid;
}

// returns true if a piece is trying to skip over another piece
export function blockers_exist(start, end, squares) {
  var start_row = 8 - Math.floor(start / 8);
  var start_col = (start % 8) + 1;
  var end_row = 8 - Math.floor(end / 8);
  var end_col = (end % 8) + 1;
  let row_diff = end_row - start_row;
  let col_diff = end_col - start_col;
  let row_ctr = 0;
  let col_ctr = 0;
  const copy_squares = squares.slice();

  // return true if the piece in question is skipping over a piece
  while (col_ctr !== col_diff || row_ctr !== row_diff) {
    let position =
      64 - start_row * 8 + -8 * row_ctr + (start_col - 1 + col_ctr);
    if (
      copy_squares[position].ascii != null &&
      copy_squares[position] !== copy_squares[start]
    )
      return true;
    if (col_ctr !== col_diff) {
      if (col_diff > 0) {
        ++col_ctr;
      } else {
        --col_ctr;
      }
    }
    if (row_ctr !== row_diff) {
      if (row_diff > 0) {
        ++row_ctr;
      } else {
        --row_ctr;
      }
    }
  }
  return false;
}

// returns true if player is in check
export function in_check(player, squares) {
  let king = player === "w" ? "k" : "K";
  let position_of_king = null;
  const copy_squares = squares.slice();
  for (let i = 0; i < 64; i++) {
    if (copy_squares[i].ascii === king) {
      position_of_king = i;
      break;
    }
  }

  // traverse through the board and determine
  // any of the opponent's pieces can legally take the player's king
  for (let i = 0; i < 64; i++) {
    if (copy_squares[i].player !== player) {
      if (
        copy_squares[i].can_move(i, position_of_king) === true &&
        invalid_move(i, position_of_king, copy_squares) === false
      )
        return true;
    }
  }
  return false;
}

// returns true if there are any possible moves
export function can_move_there(start, end, squares, passant_pos) {
  const copy_squares = squares.slice();
  if (start === end)
    // cannot move to the position you're already sitting in
    return false;

  // player cannot capture her own piece
  // and piece must be able to physically move from start to end
  var player = copy_squares[start].player;
  if (
    player === copy_squares[end].player ||
    copy_squares[start].can_move(start, end) === false
  )
    return false;
  // player cannot make an invalid move
  if (invalid_move(start, end, copy_squares, passant_pos) === true)
    return false;

  // cannot castle if in check
  var cant_castle =
    copy_squares[start].ascii === (player === "w" ? "k" : "K") &&
    Math.abs(end - start) === 2 &&
    in_check(player, copy_squares);
  if (cant_castle) return false;

  // king cannot castle through check
  if (
    copy_squares[start].ascii === (player === "w" ? "k" : "K") &&
    Math.abs(end - start) === 2
  ) {
    var delta_pos = end - start;
    const test_squares = squares.slice();
    test_squares[start + (delta_pos === 2 ? 1 : -1)] = test_squares[start];
    test_squares[start] = new filler_piece(null);
    if (in_check(player, test_squares)) return false;
  }

  // player cannot put or keep herself in check
  const check_squares = squares.slice();
  check_squares[end] = check_squares[start];
  check_squares[start] = new filler_piece(null);
  if (check_squares[end].ascii === "p" && end >= 0 && end <= 7) {
    check_squares[end] = new Queen("w");
  } else if (check_squares[end].ascii === "P" && end >= 56 && end <= 63) {
    check_squares[end] = new Queen("b");
  }
  if (in_check(player, check_squares) === true) return false;

  return true;
}

 // make a move
 export function make_move(squares, start, end, state_passant_pos, passant_pos) {
  const copy_squares = squares.slice();
  // castling
  var isKing =
      copy_squares[start].ascii === "k" || copy_squares[start].ascii === "K";
  if (isKing && Math.abs(end - start) === 2) {
      if (end === (copy_squares[start].ascii === "k" ? 62 : 6)) {
          copy_squares[end - 1] = copy_squares[end + 1];
          copy_squares[end - 1].highlight = 1;
          copy_squares[end + 1] = new filler_piece(null);
          copy_squares[end + 1].highlight = 1;
      } else if (end === (copy_squares[start].ascii === "k" ? 58 : 2)) {
          copy_squares[end + 1] = copy_squares[end - 2];
          copy_squares[end + 1].highlight = 1;
          copy_squares[end - 2] = new filler_piece(null);
          copy_squares[end - 2].highlight = 1;
      }
  }

  // en passant
  var passant = passant_pos == null ? state_passant_pos : passant_pos;
  if (copy_squares[start].ascii.toLowerCase() === "p") {
      if (end - start === -7 || end - start === 9) {
          // white going up to the right
          if (start + 1 === passant)
              copy_squares[start + 1] = new filler_piece(null);
      } else if (end - start === -9 || end - start === 7) {
          // white going up to the left
          if (start - 1 === passant)
              copy_squares[start - 1] = new filler_piece(null);
      }
  }

  // make the move
  copy_squares[end] = copy_squares[start];
  copy_squares[end].highlight = 1;
  copy_squares[start] = new filler_piece(null);
  copy_squares[start].highlight = 1;

  // pawn promotion
  if (copy_squares[end].ascii === "p" && end >= 0 && end <= 7) {
      copy_squares[end] = new Queen("w");
      copy_squares[end].highlight = 1;
  }
  if (copy_squares[end].ascii === "P" && end >= 56 && end <= 63) {
      copy_squares[end] = new Queen("b");
      copy_squares[end].highlight = 1;
  }

  return copy_squares;
}
