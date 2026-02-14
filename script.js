const puzzle = {
    size: 5,
    grid: [
        ["#", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
    ],
    answers: [
        ["#", "B", "E", "A", "N"],
        ["S", "P", "O", "O", "N"],
        ["S", "P", "O", "O", "N"],
        ["S", "P", "O", "O", "N"],
        ["S", "P", "O", "O", "N"],
    ],
    clues: {
        across: {
            1: { clue: "A single part of us", row: 0, col: 1, length: 4 },
            2: { clue: "Said in a big voice", row: 1, col: 0, length: 5 },
            3: { clue: "Said in a big voice", row: 2, col: 0, length: 5 },
            4: { clue: "Said in a big voice", row: 3, col: 0, length: 5 },
            5: { clue: "Said in a big voice", row: 4, col: 0, length: 5 },
        },
        down: {
            1: { clue: ". . . ", row: 0, col: 1, length: 5 },
            2: { clue: ". . . ", row: 0, col: 2, length: 5 },
            3: { clue: ". . . ", row: 0, col: 3, length: 5 },
            4: { clue: ". . . ", row: 0, col: 4, length: 5 },
            5: { clue: ". . . ", row: 1, col: 0, length: 5 },
        }
    }
};

let puzzleBox = document.querySelector(".puzzle");
let activeRow = null;
let activeCol = null;
let direction = "across";

function generate_puzzle() {
    document.querySelector(".instructions").remove();
    for (let r=0; r<puzzle.grid.length; r++) {
        for (let c=0; c<puzzle.grid[r].length; c++) {
            let cell = puzzle.grid[r][c];
            if (cell === "#") {
                let letterbox = document.createElement('div');
                letterbox.classList.add('blackbox');
                puzzleBox.appendChild(letterbox);
            } else {
                let letterbox = document.createElement('input');
                letterbox.setAttribute("type", "text");
                letterbox.classList.add('letterbox');
                letterbox.setAttribute("data-row", r);
                letterbox.setAttribute("data-col", c);
                letterbox.setAttribute("maxlength", "1");
                letterbox.addEventListener("click", handleCellClick);
                letterbox.addEventListener("input", handleInput);
                letterbox.addEventListener("keydown", handleKeydown);
                puzzleBox.appendChild(letterbox);
            };
        };
    };
    let outerButton = document.createElement('div');
    outerButton.classList.add("btn");
    document.querySelector(".check-btn").appendChild(outerButton);
    let innerButton = document.createElement('div');
    innerButton.textContent = "submit"
    innerButton.classList.add("in_btn");
    innerButton.addEventListener("click", checkAnswers);
    document.querySelector(".btn").appendChild(innerButton);
};

function handleCellClick(e) {
    if (parseInt(e.target.getAttribute("data-row")) === activeRow && parseInt(e.target.getAttribute("data-col")) === activeCol) {
        direction = direction === "across" ? "down" : "across";
    };
    activeRow = parseInt(e.target.getAttribute("data-row"));
    activeCol = parseInt(e.target.getAttribute("data-col"));
    highlightWord();
};

function handleInput(e) {
    activeRow = parseInt(e.target.getAttribute("data-row"));
    activeCol = parseInt(e.target.getAttribute("data-col"));
    if (e.target.value) {
        if (direction === "across") {
            activeCol += 1;
        } else if (direction === "down") {
            activeRow += 1;
        };

        highlightWord();
        document.querySelector(`[data-row="${activeRow}"][data-col="${activeCol}"]`).focus();
    }
}

function handleKeydown(e) {
    activeRow = parseInt(e.target.getAttribute("data-row"));
    activeCol = parseInt(e.target.getAttribute("data-col"));
    if (e.key === "Backspace") {
        if ( e.target.value !== "") {
            e.target.value = "";
            e.preventDefault()
        } else {
            if (direction === "across") {
                activeCol -= 1;
            } else if (direction === "down") {
                activeRow -= 1;
            };

            highlightWord();
            document.querySelector(`[data-row="${activeRow}"][data-col="${activeCol}"]`).focus();
            e.preventDefault()
        }
    }
}

function highlightWord() {
    let highlightedWord = document.querySelectorAll('.active-word');
    highlightedWord.forEach(element => {
        element.classList.remove('active-word');
    });
    let highlightCell = document.querySelector('.active-cell');
    if (highlightCell) {
        highlightCell.classList.remove('active-cell');
    }

    let clues = Object.values(puzzle.clues[direction]);

    clues.forEach(clue => {
        if (direction == "across") {
            if (activeRow === clue.row && activeCol >= clue.col && activeCol <= (clue.col + clue.length)) {
                for (let i=clue.col; i< clue.col + clue.length; i++) {
                    document.querySelector(`[data-row="${clue.row}"][data-col="${i}"]`).classList.add("active-word");
                }
            }
        } else {
            if (activeCol === clue.col && activeRow >= clue.row && activeRow <= (clue.row + clue.length)) {
                for (let i=clue.row; i< clue.row + clue.length; i++) {
                    document.querySelector(`[data-row="${i}"][data-col="${clue.col}"]`).classList.add("active-word");
                }
            }
        }
    })
    
    document.querySelector(`[data-row="${activeRow}"][data-col="${activeCol}"]`).classList.add("active-cell");
    updateClueBar();
};

function updateClueBar() {
    let clueBar = document.querySelector(".clue-bar")
    let clues = Object.values(puzzle.clues[direction]);

    clues.forEach(clue => {
        if (direction == "across") {
            if (activeRow === clue.row && activeCol >= clue.col && activeCol <= (clue.col + clue.length)) {
                // clueBar.textContent = `${(clues.indexOf(clue) + 1)} ${direction}: ${clue.clue}`;
                clueBar.textContent = `${clue.clue}`;
            }
        } else {
            if (activeCol === clue.col && activeRow >= clue.row && activeRow <= (clue.row + clue.length)) {
                clueBar.textContent = clue.clue;
            }
        }
    })
};

function checkAnswers() {
    let allCorrect = true;
    let answers = puzzle.answers;

    for (let answer=0; answer<answers.length; answer++) {
        for (let letter=0; letter<answers[answer].length; letter++) {
            if (answers[answer][letter] == "#") {
                continue;
            } else {
                let inputAnswer = document.querySelector(`[data-row="${answer}"][data-col="${letter}"]`);
                if (inputAnswer.value.toUpperCase() !== answers[answer][letter]) {
                    allCorrect = false;
                    inputAnswer.classList.add("incorrect");
                }
            }
        }
    }

    if (allCorrect) {
        window.location.href = "surprise.html";
    }
};

window.visualViewport.addEventListener("resize", () => {
    let clueBar = document.querySelector(".clue-bar");
    clueBar.style.bottom = `${window.innerHeight - window.visualViewport.height}px`;
});

// generate_puzzle();