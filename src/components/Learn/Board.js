import React from "react";

import { i18n } from "../../i18n/index";

import "./Learn.styles.css";

import blackDefeat from "./sfx/Black_Defeat.mp3";
import capture from "./sfx/Capture.mp3";
import checkFlash from "./sfx/Check_Flash.mp3";
import check from "./sfx/Check.mp3";
import move from "./sfx/Move.mp3";
import stalemate from "./sfx/Stalemate.mp3";
import whiteDefeat from "./sfx/White_Defeat.mp3";
import {
    initializeBoard, clear_highlight, clear_possible_highlight,
    highlight_mate, calc_squareColor, clear_check_highlight,
    can_move_there
} from './until/helper';

import {
    Queen, Pawn, King, Bishop, Knight, Rook, filler_piece
} from './pieces/pieces';

// import low-lavel bot
import {execute_bot} from './until/bot';

// return labels for axes of the board
function Label(props) {
    return <button className={"label"}> {props.value} </button>;
}

// Get Piece Icon
function IconAdapter(props) {
    return <img src={props.icon} className="piece"></img>
}

// helper function to help generate arrays of pieces captured by a player
export function Collected(props) {
    return <button className={"collected"}> {
        <IconAdapter icon={props.value.icon} />
    } </button>;
}

// return a square with the chess piece
function Square(props) {
    if (props.value != null) {
        return (
            <button
                className={"square " + props.color + props.corner + props.cursor}
                onClick={props.onClick}
            >
                <IconAdapter icon={props.value.icon} />
            </button>
        );
    } else {
        return (
            <button
                className={"square " + props.color + props.corner + props.cursor}
                onClick={props.onClick}
            >
                {" "}
            </button>
        );
    }
}

export default class Board extends React.Component {
    // initialize the board
    constructor() {
        super();
        this.state = {
            squares: initializeBoard(),
            source: -1,
            turn: "w",
            true_turn: "w",
            turn_num: 0,
            first_pos: null,
            second_pos: null,
            repetition: 0,
            white_king_has_moved: 0,
            black_king_has_moved: 0,
            left_black_rook_has_moved: 0,
            right_black_rook_has_moved: 0,
            left_white_rook_has_moved: 0,
            right_white_rook_has_moved: 0,
            passant_pos: 65,
            bot_running: 0,
            pieces_collected_by_white: [],
            pieces_collected_by_black: [],
            history: [initializeBoard()],
            history_num: 1,
            history_h1: [null],
            history_h2: [null],
            history_h3: [null],
            history_h4: [null],
            history_white_collection: [null],
            history_black_collection: [null],
            mated: false,
            move_made: false,
            capture_made: false,
            check_flash: false,
            viewing_history: false,
            just_clicked: false,
        };
    }

    // reset the board
    reset() {
        if (
            this.state.history_num - 1 === this.state.turn_num &&
            this.state.turn === "b" &&
            !this.state.mated
        )
            return "cannot reset";
        this.setState({
            squares: initializeBoard(),
            source: -1,
            turn: "w",
            true_turn: "w",
            turn_num: 0,
            first_pos: null,
            second_pos: null,
            repetition: 0,
            white_king_has_moved: 0,
            black_king_has_moved: 0,
            left_black_rook_has_moved: 0,
            right_black_rook_has_moved: 0,
            left_white_rook_has_moved: 0,
            right_white_rook_has_moved: 0,
            passant_pos: 65,
            bot_running: 0,
            pieces_collected_by_white: [],
            pieces_collected_by_black: [],
            history: [initializeBoard()],
            history_num: 1,
            history_h1: [0],
            history_h2: [0],
            history_h3: [null],
            history_h4: [null],
            history_white_collection: [null],
            history_black_collection: [null],
            mated: false,
            move_made: false,
            capture_made: false,
            check_flash: false,
            viewing_history: false,
            just_clicked: false,
        });
    }

    // full function for executing a move
    execute_move(player, squares, start, end) {
        let copy_squares = squares.slice();

        // clear highlights
        copy_squares = clear_highlight(copy_squares).slice();
        if (player === "w") {
            copy_squares = clear_possible_highlight(copy_squares).slice();
            for (let j = 0; j < 64; j++) {
                // user has heeded warning
                if (copy_squares[j].ascii === "k") {
                    copy_squares[j].in_check = 0;
                    break;
                }
            }
        }

        // note if king or rook has moved (castling not allowed if these have moved)
        if (copy_squares[start].ascii === (player === "w" ? "k" : "K")) {
            if (player === "w") {
                this.setState({
                    white_king_has_moved: 1,
                });
            } else {
                this.setState({
                    black_king_has_moved: 1,
                });
            }
        }
        if (copy_squares[start].ascii === (player === "w" ? "r" : "R")) {
            if (start === (player === "w" ? 56 : 0)) {
                if (player === "w") {
                    this.setState({
                        left_white_rook_has_moved: 1,
                    });
                } else {
                    this.setState({
                        left_black_rook_has_moved: 1,
                    });
                }
            } else if (start === (player === "w" ? 63 : 7)) {
                if (player === "w") {
                    this.setState({
                        right_white_rook_has_moved: 1,
                    });
                } else {
                    this.setState({
                        right_black_rook_has_moved: 1,
                    });
                }
            }
        }

        // add captured pieces to collection
        const collection =
            player === "w"
                ? this.state.pieces_collected_by_white.slice()
                : this.state.pieces_collected_by_black.slice();
        if (copy_squares[end].ascii != null) {
            collection.push(<Collected value={copy_squares[end]} />);
            this.setState({
                capture_made: true,
            });
        }
        if (copy_squares[start].ascii === (player === "w" ? "p" : "P")) {
            if (end - start === (player === "w" ? -9 : 7)) {
                // black going down to the left OR white going up to the left
                if (start - 1 === this.state.passant_pos)
                    collection.push(<Collected value={copy_squares[start - 1]} />);
            } else if (end - start === (player === "w" ? -7 : 9)) {
                // black going down to the right OR white going up to the right
                if (start + 1 === this.state.passant_pos)
                    collection.push(<Collected value={copy_squares[start + 1]} />);
            }
        }

        // make the move
        copy_squares = this.make_move(copy_squares, start, end).slice();

        // en passant helper
        var passant_true =
            player === "w"
                ? copy_squares[end].ascii === "p" &&
                start >= 48 &&
                start <= 55 &&
                end - start === -16
                : copy_squares[end].ascii === "P" &&
                start >= 8 &&
                start <= 15 &&
                end - start === 16;
        let passant = passant_true ? end : 65;

        // highlight mate
        if (player === "w") {
            copy_squares = highlight_mate(
                "b",
                copy_squares,
                this.checkmate("b", copy_squares),
                this.stalemate("b", copy_squares)
            ).slice();
        } else {
            copy_squares = highlight_mate(
                "w",
                copy_squares,
                this.checkmate("w", copy_squares),
                this.stalemate("w", copy_squares)
            ).slice();
        }

        // adding state to history array
        const copy_history = this.state.history.slice();
        const copy_history_h1 = this.state.history_h1.slice();
        const copy_history_h2 = this.state.history_h2.slice();
        const copy_history_h3 = this.state.history_h3.slice();
        const copy_history_h4 = this.state.history_h4.slice();
        const copy_white_collection = this.state.history_white_collection.slice();
        const copy_black_collection = this.state.history_black_collection.slice();
        copy_history.push(copy_squares);
        copy_history_h1.push(start);
        copy_history_h2.push(end);
        copy_white_collection.push(
            player === "w" ? collection : this.state.pieces_collected_by_white
        );
        copy_black_collection.push(
            player === "b" ? collection : this.state.pieces_collected_by_black
        );

        var isKing =
            copy_squares[end].ascii === "k" || copy_squares[end].ascii === "K";
        if (isKing && Math.abs(end - start) === 2) {
            if (end === (copy_squares[end].ascii === "k" ? 62 : 6)) {
                copy_history_h3.push(end - 1);
                copy_history_h4.push(end + 1);
            } else if (end === (copy_squares[end].ascii === "k" ? 58 : 2)) {
                copy_history_h3.push(end + 1);
                copy_history_h4.push(end - 2);
            }
        } else {
            copy_history_h3.push(null);
            copy_history_h4.push(null);
        }

        let check_mated =
            this.checkmate("w", copy_squares) || this.checkmate("b", copy_squares);
        let stale_mated =
            (this.stalemate("w", copy_squares) && player === "b") ||
            (this.stalemate("b", copy_squares) && player === "w");

        this.setState({
            passant_pos: passant,
            history: copy_history,
            history_num: this.state.history_num + 1,
            history_h1: copy_history_h1,
            history_h2: copy_history_h2,
            history_h3: copy_history_h3,
            history_h4: copy_history_h4,
            history_white_collection: copy_white_collection,
            history_black_collection: copy_black_collection,
            squares: copy_squares,
            source: -1,
            turn_num: this.state.turn_num + 1,
            mated: check_mated || stale_mated ? true : false,
            turn: player === "b" ? "w" : "b",
            true_turn: player === "b" ? "w" : "b",
            bot_running: player === "b" ? 0 : 1,
            move_made: true,
        });

        // set state
        if (player === "b") {
            this.setState({
                first_pos: start,
                second_pos: end,
                pieces_collected_by_black: collection,
            });
        } else {
            this.setState({
                pieces_collected_by_white: collection,
            });
        }
    }

    // return true if player is in stalemate
    stalemate(player, squares) {
        if (this.in_check(player, squares)) return false;

        // if there is even only 1 way to move her piece,
        // the player is not in stalemate
        for (let i = 0; i < 64; i++) {
            if (squares[i].player === player) {
                for (let j = 0; j < 64; j++) {
                    if (can_move_there(i, j, squares)) return false;
                }
            }
        }
        return true;
    }

    // return true if player is in checkmate
    checkmate(player, squares) {
        if (!this.in_check(player, squares)) return false;
        // if there is even only 1 way to move her piece,
        // the player is not in checkmate
        for (let i = 0; i < 64; i++) {
            if (squares[i].player === player) {
                for (let j = 0; j < 64; j++) {
                    if (can_move_there(i, j, squares)) return false;
                }
            }
        }
        return true;
    }

    // handle user action of clicking square on board
    handleClick(i) {
        let copy_squares = this.state.squares.slice();

        if (this.state.history_num - 1 !== this.state.turn_num) {
            return "currently viewing history";
        }

        if (this.state.mated) return "game-over";

        // first click
        if (this.state.source === -1 && this.state.bot_running === 0) {
            // no source has been selected yet
            // can only pick a piece that is your own
            if (copy_squares[i].player !== this.state.turn) return -1;

            //can only pick a piece that is not a blank square
            if (copy_squares[i].player != null) {
                this.setState({
                    check_flash: false,
                    just_clicked: false,
                    move_made: false,
                    capture_made: false,
                    viewing_history: false,
                });

                copy_squares = clear_check_highlight(copy_squares, "w").slice();
                copy_squares[i].highlight = 1; // highlight selected piece

                // highlight legal moves
                for (let j = 0; j < 64; j++) {
                    if (can_move_there(i, j, copy_squares))
                        copy_squares[j].possible = 1;
                }

                this.setState({
                    source: i, // set the source to the first click
                    squares: copy_squares,
                });
            }
        }

        // second click (to move piece from the source to destination)
        if (this.state.source > -1) {
            var cannibalism = copy_squares[i].player === this.state.turn;
            /* if user is trying to select one of her other pieces,
             * change highlight to the new selection, but do not move any pieces
             */
            if (cannibalism === true && this.state.source !== i) {
                copy_squares[i].highlight = 1;
                copy_squares[this.state.source].highlight = 0;
                copy_squares = clear_possible_highlight(copy_squares).slice();
                for (let j = 0; j < 64; j++) {
                    if (can_move_there(i, j, copy_squares))
                        copy_squares[j].possible = 1;
                }
                this.setState({
                    source: i, // set source to the new clicks
                    squares: copy_squares,
                });
            } else {
                // user is trying to move her piece to empty space or to capture opponent's piece
                if (!can_move_there(this.state.source, i, copy_squares)) {
                    // un-highlight selection if invalid move was attempted
                    copy_squares[this.state.source].highlight = 0;
                    copy_squares = clear_possible_highlight(copy_squares).slice();
                    // if user is in check, highlight king in red if user tries a move that doesn't get her
                    // out of check
                    if (
                        i !== this.state.source &&
                        this.in_check("w", copy_squares) === true
                    ) {
                        for (let j = 0; j < 64; j++) {
                            if (copy_squares[j].ascii === "k") {
                                copy_squares[j].in_check = 1;
                                break;
                            }
                        }
                        this.setState({
                            check_flash: true,
                        });
                    }
                    this.setState({
                        source: -1,
                        squares: copy_squares,
                    });
                    return "invalid move";
                }

                this.execute_move("w", copy_squares, this.state.source, i);

                setTimeout(() => {
                    this.setState({
                        move_made: false,
                        capture_made: false,
                    });
                }, 200);

                // chess bot for black player
                let search_depth = 3;
                setTimeout(() => {
                    execute_bot(search_depth, this.state.squares);
                }, 700);
            }
        }
    }

    // Render the page
    render() {
        const row_nums = [];
        for (let i = 8; i > 0; i--) {
            row_nums.push(<Label key={i} value={i} />);
        }
        const col_nums = [];
        for (let i = 1; i < 9; i++) {
            let letter;
            switch (i) {
                case 1:
                    letter = "A";
                    break;
                case 2:
                    letter = "B";
                    break;
                case 3:
                    letter = "C";
                    break;
                case 4:
                    letter = "D";
                    break;
                case 5:
                    letter = "E";
                    break;
                case 6:
                    letter = "F";
                    break;
                case 7:
                    letter = "G";
                    break;
                case 8:
                    letter = "H";
                    break;
            }
            col_nums.push(<Label key={letter} value={letter} />);
        }

        const board = [];
        for (let i = 0; i < 8; i++) {
            const squareRows = [];
            for (let j = 0; j < 8; j++) {
                let square_corner = null;
                if (i === 0 && j === 0) {
                    square_corner = " top_left_square ";
                } else if (i === 0 && j === 7) {
                    square_corner = " top_right_square ";
                } else if (i === 7 && j === 0) {
                    square_corner = " bottom_left_square ";
                } else if (i === 7 && j === 7) {
                    square_corner = " bottom_right_square ";
                } else {
                    square_corner = " ";
                }

                const copy_squares = this.state.squares.slice();
                let square_color = calc_squareColor(i, j, copy_squares);
                let square_cursor = "pointer";
                if (copy_squares[i * 8 + j].player !== "w") square_cursor = "default";
                if (this.state.bot_running === 1 && !this.state.mated)
                    square_cursor = "bot_running";
                if (this.state.mated) square_cursor = "default";
                if (this.state.history_num - 1 !== this.state.turn_num)
                    square_cursor = "not_allowed";

                squareRows.push(
                    <Square
                        key={i * 8 + j}
                        value={copy_squares[i * 8 + j]}
                        color={square_color}
                        corner={square_corner}
                        cursor={square_cursor}
                        onClick={() => this.handleClick(i * 8 + j)}
                    />
                );
            }
            board.push(<div key={i}>{squareRows}</div>);
        }

        let black_mated = this.checkmate("b", this.state.squares);
        let white_mated = this.checkmate("w", this.state.squares);
        let not_history =
            !(this.state.history_num - 1 !== this.state.turn_num) &&
            !this.state.viewing_history;
        let stale =
            (this.stalemate("w", this.state.squares) && this.state.turn === "w") ||
            (this.stalemate("b", this.state.squares) && this.state.turn === "b");

        return (
            <div>
                {this.state.move_made && !this.state.capture_made && (
                    <div>
                        <audio ref="audio_tag" src={move} controls autoPlay hidden />{" "}
                    </div>
                )}
                {this.state.capture_made && not_history && (
                    <div>
                        <audio ref="audio_tag" src={capture} controls autoPlay hidden />{" "}
                    </div>
                )}
                {black_mated && not_history && (
                    <div>
                        <audio ref="audio_tag" src={blackDefeat} controls autoPlay hidden />{" "}
                    </div>
                )}
                {white_mated && not_history && (
                    <div>
                        <audio ref="audio_tag" src={whiteDefeat} controls autoPlay hidden />{" "}
                    </div>
                )}
                {stale && not_history && (
                    <div>
                        <audio ref="audio_tag" src={stalemate} controls autoPlay hidden />{" "}
                    </div>
                )}
                {this.state.check_flash &&
                    !(this.state.history_num - 1 !== this.state.turn_num) &&
                    !this.state.just_clicked && (
                        <div>
                            {" "}
                            <audio
                                ref="audio_tag"
                                src={checkFlash}
                                controls
                                autoPlay
                                hidden
                            />{" "}
                        </div>
                    )}

                <div className="bounceInDown">
                    <div className="left_screen bounceInDown">
                        <div className="side_box">
                            <div className="wrapper">
                                <div className="player_box">
                                    <span className="medium_font"> {i18n.t("game.white")}</span>
                                    {this.state.pieces_collected_by_white}
                                </div>
                                <div className="player_box black_player_color">
                                    <span className="medium_font">{i18n.t("game.black")}</span>
                                    {this.state.pieces_collected_by_black}
                                </div>
                            </div>
                            <div className="wrapper">
                                {this.state.turn === "w" ? (
                                    <div className="highlight_box"></div>
                                ) : (
                                    <div className="highlight_box transparent"></div>
                                )}
                                {this.state.turn === "b" ? (
                                    <div className="highlight_box"></div>
                                ) : (
                                    <div className="highlight_box transparent"></div>
                                )}
                            </div>

                            <div className="button_wrapper">
                                <button
                                    className="reset_button history"
                                    onClick={() => this.viewHistory("back_atw")}
                                >
                                    <span className="button_font">&lt;&lt;</span>
                                </button>
                                <button
                                    className="reset_button history"
                                    onClick={() => this.viewHistory("back")}
                                >
                                    <span className="button_font">&lt;</span>
                                </button>
                                <button className="reset_button" onClick={() => this.reset()}>
                                    <span className="button_font">{i18n.t("game.restart")}</span>
                                </button>
                                <button
                                    className="reset_button history"
                                    onClick={() => this.viewHistory("next")}
                                >
                                    <span className="button_font">&gt;</span>
                                </button>
                                <button
                                    className="reset_button history"
                                    onClick={() => this.viewHistory("next_atw")}
                                >
                                    <span className="button_font">&gt;&gt;</span>
                                </button>
                            </div>

                            <div className="mate_wrapper">
                                <p className="small_font">
                                    {this.in_check("w", this.state.squares) &&
                                        !this.checkmate("w", this.state.squares) === true
                                        ? i18n.t("game.check")
                                        : ""}
                                </p>
                                <p className="small_font">
                                    {this.in_check("b", this.state.squares) &&
                                        !this.checkmate("b", this.state.squares) === true
                                        ? i18n.t("game.check")
                                        : ""}
                                </p>
                                <p className="small_font">
                                    {this.checkmate("w", this.state.squares) === true
                                        ? i18n.t("game.lost")
                                        : ""}
                                </p>
                                <p className="small_font">
                                    {this.checkmate("b", this.state.squares) === true
                                        ? i18n.t("game.won")
                                        : ""}
                                </p>
                                <p className="small_font">
                                    {(this.stalemate("w", this.state.squares) &&
                                        this.state.turn === "w") === true
                                        ? i18n.t("game.stalemate")
                                        : ""}
                                </p>
                                <p className="small_font">
                                    {(this.stalemate("b", this.state.squares) &&
                                        this.state.turn === "b") === true
                                        ? i18n.t("game.stalemate")
                                        : ""}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="right_screen bounceInDown">
                        <div className="row_label"> {row_nums} </div>
                        <div className="table"> {board} </div>
                        <div className="col_label"> {col_nums} </div>
                    </div>
                </div>
            </div>
        );
    }

    // view previous turns in the game
    viewHistory(direction) {
        if (
            this.state.history_num - 1 === this.state.turn_num &&
            this.state.turn === "b" &&
            !this.state.mated
        ) {
            return "not allowed to view history";
        }

        let copy_squares = null;
        let copy_white_collection = null;
        let copy_black_collection = null;

        if (direction === "back_atw") {
            copy_squares = this.state.history[0].slice();
            copy_white_collection = [];
            copy_black_collection = [];
        } else if (
            direction === "next_atw" &&
            this.state.history_num < this.state.turn_num + 1
        ) {
            copy_squares = this.state.history[this.state.turn_num].slice();
            copy_white_collection =
                this.state.history_white_collection[this.state.turn_num];
            copy_black_collection =
                this.state.history_black_collection[this.state.turn_num];
        } else if (direction === "back" && this.state.history_num - 2 >= 0) {
            copy_squares = this.state.history[this.state.history_num - 2].slice();
            copy_white_collection =
                this.state.history_white_collection[this.state.history_num - 2];
            copy_black_collection =
                this.state.history_black_collection[this.state.history_num - 2];
        } else if (
            direction === "next" &&
            this.state.history_num <= this.state.turn_num
        ) {
            copy_squares = this.state.history[this.state.history_num].slice();
            copy_white_collection =
                this.state.history_white_collection[this.state.history_num];
            copy_black_collection =
                this.state.history_black_collection[this.state.history_num];
        } else {
            return "no more history";
        }

        copy_squares = clear_possible_highlight(copy_squares).slice();
        copy_squares = clear_highlight(copy_squares).slice();
        for (let j = 0; j < 64; j++) {
            if (copy_squares[j].ascii === (this.state.turn === "w" ? "k" : "K")) {
                copy_squares[j].in_check = 0;
                copy_squares[j].checked = 0;
                break;
            }
        }

        var stale =
            this.stalemate(this.state.true_turn, copy_squares) &&
            this.state.turn !== this.state.true_turn;
        copy_squares = highlight_mate(
            this.state.true_turn,
            copy_squares,
            this.checkmate(this.state.true_turn, copy_squares),
            stale
        ).slice();

        var index = null;
        if (direction === "back") index = this.state.history_num - 2;
        else if (direction === "next") index = this.state.history_num;
        else if (direction === "next_atw") index = this.state.turn_num;

        if (index !== 0 && index != null) {
            if (this.state.history_h1[index] != null) {
                copy_squares[this.state.history_h1[index]].highlight = 1;
                copy_squares[this.state.history_h2[index]].highlight = 1;
            }
            if (this.state.history_h3[index] != null) {
                copy_squares[this.state.history_h3[index]].highlight = 1;
                copy_squares[this.state.history_h4[index]].highlight = 1;
            }
        }

        let new_history_num =
            direction === "back"
                ? this.state.history_num - 1
                : this.state.history_num + 1;
        if (direction === "back_atw") new_history_num = 1;
        if (direction === "next_atw") new_history_num = this.state.turn_num + 1;

        this.setState({
            viewing_history: true,
            just_clicked: true,
            squares: copy_squares,
            history_num: new_history_num,
            turn: this.state.turn === "w" ? "b" : "w",
            pieces_collected_by_white:
                copy_white_collection != null
                    ? copy_white_collection
                    : this.state.pieces_collected_by_white,
            pieces_collected_by_black:
                copy_black_collection != null
                    ? copy_black_collection
                    : this.state.pieces_collected_by_black,
        });

        if (direction === "back_atw" || direction === "next_atw") {
            this.setState({
                turn: direction === "back_atw" ? "w" : this.state.true_turn,
            });
        }
    }
}
