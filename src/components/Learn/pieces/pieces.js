import whiteKing from "../../../images/white_king.png";
import whiteBishop from "../../../images/white_bishop.png";
import whiteKnight from "../../../images/white_knight.png";
import whitePawn from "../../../images/white_pawn.png";
import whiteQueen from "../../../images/white_queen.png";
import whiteRock from "../../../images/white_rook.png";
import blackKing from "../../../images/black_king.png";
import blackBishop from "../../../images/black_bishop.png";
import blackKnight from "../../../images/black_knight.png";
import blackPawn from "../../../images/black_pawn.png";
import blackQueen from "../../../images/black_queen.png";
import blackRock from "../../../images/black_rook.png";

// Piece Classes ========================================
export class King {
    constructor(player) {
        this.player = player;
        this.highlight = 0;
        this.possible = 0;
        this.checked = 0;
        this.in_check = 0;
        this.icon = player === "w" ? whiteKing : blackKing;
        this.ascii = player === "w" ? "k" : "K";
    }

    // function that defines piece's valid move shape
    can_move(start, end) {
        var start_row = 8 - Math.floor(start / 8);
        var start_col = (start % 8) + 1;
        var end_row = 8 - Math.floor(end / 8);
        var end_col = (end % 8) + 1;

        var row_diff = end_row - start_row;
        var col_diff = end_col - start_col;

        if (row_diff === 1 && col_diff === -1) {
            return true;
        } else if (row_diff === 1 && col_diff === 0) {
            return true;
        } else if (row_diff === 1 && col_diff === 1) {
            return true;
        } else if (row_diff === 0 && col_diff === 1) {
            return true;
        } else if (row_diff === -1 && col_diff === 1) {
            return true;
        } else if (row_diff === -1 && col_diff === 0) {
            return true;
        } else if (row_diff === -1 && col_diff === -1) {
            return true;
        } else if (row_diff === 0 && col_diff === -1) {
            return true;
        } else if (row_diff === 0 && col_diff === 2) {
            return true;
        } else if (row_diff === 0 && col_diff === -2) {
            return true;
        }
        return false;
    }
}

export class Queen {
    constructor(player) {
        this.player = player;
        this.highlight = 0;
        this.possible = 0;
        this.icon = player === "w" ? whiteQueen : blackQueen;
        this.ascii = player === "w" ? "q" : "Q";
    }

    // function that defines piece's valid move shape
    can_move(start, end) {
        var start_row = 8 - Math.floor(start / 8);
        var start_col = (start % 8) + 1;
        var end_row = 8 - Math.floor(end / 8);
        var end_col = (end % 8) + 1;

        var row_diff = end_row - start_row;
        var col_diff = end_col - start_col;

        if (row_diff > 0 && col_diff === 0) {
            return true;
        } else if (row_diff === 0 && col_diff > 0) {
            return true;
        } else if (row_diff < 0 && col_diff === 0) {
            return true;
        } else if (row_diff === 0 && col_diff < 0) {
            return true;
        } else if (row_diff === col_diff) {
            return true;
        } else if (row_diff === -col_diff) {
            return true;
        }
        return false;
    }
}

export class Knight {
    constructor(player) {
        this.player = player;
        this.highlight = 0;
        this.possible = 0;
        this.icon = player === "w" ? whiteKnight : blackKnight;
        this.ascii = player === "w" ? "n" : "N";
    }

    // function that defines piece's valid move shape
    can_move(start, end) {
        var start_row = 8 - Math.floor(start / 8);
        var start_col = (start % 8) + 1;
        var end_row = 8 - Math.floor(end / 8);
        var end_col = (end % 8) + 1;

        var row_diff = end_row - start_row;
        var col_diff = end_col - start_col;

        if (row_diff === 1 && col_diff === -2) {
            return true;
        } else if (row_diff === 2 && col_diff === -1) {
            return true;
        } else if (row_diff === 2 && col_diff === 1) {
            return true;
        } else if (row_diff === 1 && col_diff === 2) {
            return true;
        } else if (row_diff === -1 && col_diff === 2) {
            return true;
        } else if (row_diff === -2 && col_diff === 1) {
            return true;
        } else if (row_diff === -2 && col_diff === -1) {
            return true;
        } else if (row_diff === -1 && col_diff === -2) {
            return true;
        }
        return false;
    }
}

export class Bishop {
    constructor(player) {
        this.player = player;
        this.highlight = 0;
        this.possible = 0;
        this.icon = player === "w" ? whiteBishop : blackBishop;
        this.ascii = player === "w" ? "b" : "B";
    }

    // function that defines piece's valid move shape
    can_move(start, end) {
        var start_row = 8 - Math.floor(start / 8);
        var start_col = (start % 8) + 1;
        var end_row = 8 - Math.floor(end / 8);
        var end_col = (end % 8) + 1;

        var row_diff = end_row - start_row;
        var col_diff = end_col - start_col;

        if (row_diff === col_diff) {
            return true;
        } else if (row_diff === -col_diff) {
            return true;
        }
        return false;
    }
}

export class Pawn {
    constructor(player) {
        this.player = player;
        this.highlight = 0;
        this.possible = 0;
        this.icon = player === "w" ? whitePawn : blackPawn;
        this.ascii = player === "w" ? "p" : "P";
    }

    // function that defines piece's valid move shape
    can_move(start, end) {
        var start_row = 8 - Math.floor(start / 8);
        var start_col = (start % 8) + 1;
        var end_row = 8 - Math.floor(end / 8);
        var end_col = (end % 8) + 1;

        var row_diff = end_row - start_row;
        var col_diff = end_col - start_col;

        if (this.player === "w") {
            if (col_diff === 0) {
                if (row_diff === 1 || row_diff === 2) return true;
            } else if (col_diff === -1 || col_diff === 1) {
                if (row_diff === 1) return true;
            }
        } else {
            if (col_diff === 0) {
                if (row_diff === -2 || row_diff === -1) return true;
            } else if (col_diff === -1 || col_diff === 1) {
                if (row_diff === -1) return true;
            }
        }
        return false;
    }
}

export class Rook {
    constructor(player) {
        this.player = player;
        this.highlight = 0;
        this.possible = 0;
        this.icon = player === "w" ? whiteRock : blackRock;
        this.ascii = player === "w" ? "r" : "R";
    }

    // function that defines piece's valid move shape
    can_move(start, end) {
        var start_row = 8 - Math.floor(start / 8);
        var start_col = (start % 8) + 1;
        var end_row = 8 - Math.floor(end / 8);
        var end_col = (end % 8) + 1;

        var row_diff = end_row - start_row;
        var col_diff = end_col - start_col;

        if (row_diff > 0 && col_diff === 0) {
            return true;
        } else if (row_diff === 0 && col_diff > 0) {
            return true;
        } else if (row_diff < 0 && col_diff === 0) {
            return true;
        } else if (row_diff === 0 && col_diff < 0) {
            return true;
        }
        return false;
    }
}

export class filler_piece {
    constructor(player) {
        this.player = player;
        this.highlight = 0;
        this.possible = 0;
        this.icon = null;
        this.ascii = null;
    }

    // function that defines piece's valid move shape
    can_move(start, end) {
        return false;
    }
}