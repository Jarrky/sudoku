
/* TODO
 * Add hints (solver)
 * Add generator (solver)
 */

var numberSelected = null;
var tileSelected = null;

// starting board
var defaultBoard = [["0", "0", "7", "4", "9", "1", "6", "0", "5"],
    ["2","0","0","0","6","0","3","0","9"],
    ["0","0","0","0","0","7","0","1","0"],
    ["0","5","8","6","0","0","0","0","4"],
    ["0","0","3","0","0","0","0","9","0"],
    ["0","0","6","2","0","0","1","8","7"],
    ["9","0","4","0","7","0","0","0","2"],
    ["6","7","0","8","3","0","0","0","0"],
    ["8","1","0","0","4","5","0","0","0"]
];
var defaultSolution = [["3", "8", "7", "4", "9", "1", "6", "2", "5"],
["2", "4", "1", "5", "6", "8", "3", "7", "9"],
["5", "6", "9", "3", "2", "7", "4", "1", "8"],
["7", "5", "8", "6", "1", "9", "2", "3", "4"],
["1", "2", "3", "7", "8", "4", "5", "9", "6"],
["4", "9", "6", "2", "5", "3", "1", "8", "7"],
["9", "3", "4", "1", "7", "6", "8", "5", "2"],
["6", "7", "5", "8", "3", "2", "9", "4", "1"],
["8", "1", "2", "9", "4", "5", "7", "6", "3"]
];
var board = "";
var solution = "";


window.onload = function () {
    setGame();
}

// function getNewBoard() gets a random board from the 1200 located in the examples.js file
function getNewBoard() {
    var range = 1200;
    // random even number between 0 and 2000
    var randomIndex = Math.floor(Math.random() * range / 2) * 2;
    // get random board from even index
    var randomBoard = examples[randomIndex];
    // get corresponding solution (next index)
    var randomSolution = examples[randomIndex + 1];
    // return the new board and solution
    return [randomBoard, randomSolution];
}

// function creates the title buttons under the title
function createTitleButton(name, text) {
    let button = document.createElement("div");
    button.id = name;
    button.innerText = text;
    button.classList.add(name);
    document.getElementById("buttons").appendChild(button);
    return button;
}

// function saves the board and solution to local storage. JSON required to store arrays
function saveToLocalStorage(board, solution) {
    window.localStorage.setItem("board", JSON.stringify(board));
    window.localStorage.setItem("solution", JSON.stringify(solution));
}

// function loads board and solution from local storage. JSON required to convert back to array
function loadFromLocalStorage() {
    let loadedBoard = window.localStorage.getItem("board");
    let loadedSolution = window.localStorage.getItem("solution");
    return [JSON.parse(loadedBoard), JSON.parse(loadedSolution)];
}

// function to setup the game
function setGame() {
    // window.localStorage.clear();

    /* Digits 1-9 */
    for (i = 1; i <= 9; i++) {
        //<div id="i"></div>
        let number = document.createElement("div");
        number.id = i;
        number.innerText = i;
        number.classList.add("number");
        document.getElementById("digits").appendChild(number);

        // added event for a click of each digit
        number.addEventListener("click", selectNumber);
    }

    /* TITLE BUTTONS*/
    // submit button
    submit = createTitleButton("submit", "Submit");
    submit.addEventListener("click", checkSolution);

    // new game button
    newGame = createTitleButton("newGame", "New");
    newGame.addEventListener("click", createNewGame);

    // tips button
    tips = createTitleButton("tips", "Tips");
    // anonymous function required to pass parameters
    tips.addEventListener("click", function () { on('tipsOverlay'); });

    // hint button
    hint = createTitleButton("hint", "Hint");
    hint.addEventListener("click", revealHint);

    // clear buttons
    let clear = document.getElementById("clear");
    clear.innerText = "Clear";
    clear.classList.add("clear");
    clear.addEventListener("click", clearTile);

    /* LOCAL STORAGE CHECK */
    // local storage check for default board
    if (window.localStorage.getItem("board") != null) {
        loadedBoardAndSolution = loadFromLocalStorage();
        board = loadedBoardAndSolution[0];
        solution = loadedBoardAndSolution[1];
    }
    else {
        // use the default board if no storage found
        board = defaultBoard;
        solution = defaultSolution;
    }

    // has the user already input a digit?
    if (window.localStorage.getItem("currentBoard") != null) {
        currentBoard = JSON.parse(window.localStorage.getItem("currentBoard"));
    }
    else {
        // if no local storage is found, the current board is just the base board
        currentBoard = board;
    }


    /* 9x9 BOARD CREATION */
    for (r = 0; r < 9; r++) {
        for (c = 0; c < 9; c++) {
            // create the elements
            let tile = document.createElement("div");
            tile.id = r.toString() + c.toString();

            // if the base board doesn't match the current board, fill in the user input, but don't change the class colour
            if (currentBoard[r][c] != board[r][c]) {
                tile.innerText = currentBoard[r][c];
            }
            // if the base board is not a 0, fill in the number and change the colour to a starting tile, to distinguish from user inputs
            if (board[r][c] != "0") {
                tile.innerText = board[r][c];
                tile.classList.add("tile-start");
            }
            // horizontal lines
            if (r == 2 || r == 5) {
                tile.classList.add("horizontal-line")
            }
            // vertical lines
            if (c == 2 || c == 5) {
                tile.classList.add("vertical-line")
            }
            tile.classList.add("tile");
            document.getElementById("board").appendChild(tile);
            // add event for a click of each tile
            tile.addEventListener("click", selectTile);

            // if two digits in tile, split back into the corners. This is just for previous user input
            if (tile.innerText.length > 1) {
                splitTile(r, c, tile.innerText[1], tile.innerText[0]);
            }
        }
    }
}


// function: clear the current tile
function clearTile() {
    if (tileSelected) {
        // if the selected tile is a starting tile, break without changing the value
        if (tileSelected.classList.contains("tile-start")) {
            return;
        }
        tileSelected.innerText = "";
    }
}


// function: reveal a hint with an overlay
function revealHint() {
    if (confirm("Are you sure you want a clue?")) { 
        on('hintOverlay');
    }
}


// function: on click of a bottom number
function selectNumber() {
    // only if a tile has been selected before the number
    if (tileSelected) {
        // get the row and column of the tile
        r = tileSelected.id[0];
        c = tileSelected.id[1];

        // if the selected tile is a starting tile, break without changing the value
        if (tileSelected.classList.contains("tile-start")) {
            return;
        }
        // if the tile already contains a single digit (user input)
        if (tileSelected.innerText != "" && tileSelected.innerText.length == 1) {
            // update the current board by adding both digits into it
            currentBoard[r][c] = this.id + tileSelected.innerText;
            // split the tile into two digits
            splitTile(r, c, tileSelected.innerText, this.id);
        }
        else {
            // change the value in the tile
            tileSelected.innerText = this.id;
            // save user inputs into current board
            currentBoard[r][c] = this.id;
        }
        // store the current board situation in local storage (JSON to convert from array again)
        window.localStorage.setItem("currentBoard", JSON.stringify(currentBoard));
    }
}


// function: when a tile is clicked
function selectTile() {
    // if a tile is already selected, remove the colour of that first
    if (tileSelected != null) {
        tileSelected.classList.remove("tile-selected");
    }
    // update the selected tile, then change the colour
    tileSelected = this;
    tileSelected.classList.add("tile-selected");
}


// function: create a new game with new board
function createNewGame() {
    if (confirm("Are you sure?")) {
        // clear the storage of the previous board and user inputs
        window.localStorage.clear();

        // create new board with solution and set to variables
        var newBoardAndSolution = getNewBoard();
        var newBoard = newBoardAndSolution[0];
        var newSolution = newBoardAndSolution[1];

        // build the new board
        for (r = 0; r < 9; r++) {
            for (c = 0; c < 9; c++) {
                let tile = document.getElementById(r.toString() + c.toString());
                // if the digit is not 0, add to the board and change to starting colour class
                if (newBoard[r][c] != "0") {
                    tile.innerText = newBoard[r][c];
                    tile.classList.add("tile-start");
                }
                // otherwise, remove the text and colour if relevant
                else {
                    tile.innerText = "";
                    tile.classList.remove("tile-start");
                }
            }
        }
        // update the solution, currentBoard, and board, and store new board and solution in local storage
        solution = newSolution;
        saveToLocalStorage(newBoard, newSolution);
        currentBoard = newBoard;
        board = newBoard;
    }
}


// function: check the user's input
function checkSolution() {
    if (confirm("Are you sure you want to submit?")) {
        var check = true;
        // if any of the innerText doesn't match the solution, check is false
        for (r = 0; r < 9; r++) {
            for (c = 0; c < 9; c++) {
                if (document.getElementById(r.toString() + c.toString()).innerText != solution[r][c]) {
                    check = false;
                }
            }
        }

        if (check) {
            on('winOverlay');
        }
        else {
            on('lossOverlay');
        }
    } 
}


// function: split the tile when two digits are input into one tile
function splitTile(r, c, val1, val2) {
    let coords = r.toString() + c.toString();
    // remove the inner text first
    document.getElementById(coords).innerText = "";
    // create a new div for the left corner
    let tileLeftCorner= document.createElement("div");
    tileLeftCorner.id = coords + "l";
    tileLeftCorner.classList.add("tile-split-left");
    document.getElementById(coords).appendChild(tileLeftCorner);
    // set the inner text to the first digit value
    tileLeftCorner.innerText = val1;
    // if the second digit is the same as the first, exit here
    if (val1 == val2) {
        return;
    }
    // create a new div for the right corner
    let tileRightCorner = document.createElement("div");
    tileRightCorner.id = coords + "r";
    tileRightCorner.classList.add("tile-split-right");
    document.getElementById(coords).appendChild(tileRightCorner);
    // se the inner text to the second digit value
    tileRightCorner.innerText = val2;
}


// functions: overlay off/on
function on(overlayChoice) {
    document.getElementById(overlayChoice).style.display = "block";
}
function off(overlayChoice) {
    document.getElementById(overlayChoice).style.display = "none";
}

