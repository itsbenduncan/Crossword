const puzzle = {
    size: 5,
    grid: [
        ["", "", "", "#", "#"],
        ["", "", "", "", "#"],
        ["", "", "", "", ""],
        ["#", "#", "", "", ""],
        ["#", "#", "", "", ""],
    ],
    answers: [
        ["E", "C", "O", "#", "#"],
        ["M", "O", "R", "E", "#"],
        ["S", "P", "A", "R", "K"],
        ["#", "#", "T", "A", "I"],
        ["#", "#", "E", "S", "T"],
    ],
    clues: {
        across: {
            1: { clue: "Green prefix", row: 0, col: 0, length: 3 },
            2: { clue: "Oliver Twist's request", row: 1, col: 0, length: 4 },
            3: { clue: "Burning feeling of connection", row: 2, col: 0, length: 5 },
            4: { clue: "Country name with several martial arts", row: 3, col: 2, length: 3 },
            5: { clue: "Abbr. for started", row: 4, col: 2, length: 3 },
        },
        down: {
            1: { clue: "First on the scene, briefly", row: 0, col: 0, length: 3 },
            2: { clue: "Slang name for douches in blue", row: 0, col: 1, length: 3 },
            3: { clue: "Wax eloquent", row: 0, col: 2, length: 5 },
            4: { clue: "Travis' domme's tour", row: 1, col: 3, length: 4 },
            5: { clue: "Soccer uniform", row: 2, col: 4, length: 3 },
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
        }

        let nextCell = document.querySelector(`[data-row="${activeRow}"][data-col="${activeCol}"]`);
        if (nextCell) {
            highlightWord();
            nextCell.focus({ preventScroll: true });
        } else {
            // Reset to the cell we were actually in
            activeRow = parseInt(e.target.getAttribute("data-row"));
            activeCol = parseInt(e.target.getAttribute("data-col"));
            
            // Now find which clue we're in and jump to the next one
            let current = findCurrentClue();
            let clueNums = Object.keys(puzzle.clues[direction]).map(Number).sort((a, b) => a - b);
            let currentIndex = clueNums.indexOf(current.num);

            if (currentIndex < clueNums.length - 1) {
                let nextClue = puzzle.clues[direction][clueNums[currentIndex + 1]];
                activeRow = nextClue.row;
                activeCol = nextClue.col;
                highlightWord();
                document.querySelector(`[data-row="${activeRow}"][data-col="${activeCol}"]`).focus({ preventScroll: true });
            }
        }
    }
}

function handleKeydown(e) {
    activeRow = parseInt(e.target.getAttribute("data-row"));
    activeCol = parseInt(e.target.getAttribute("data-col"));
    if (e.key === "Backspace") {
        if (e.target.value !== "") {
            e.target.value = "";
            e.preventDefault();
        } else {
            if (direction === "across") {
                activeCol -= 1;
            } else if (direction === "down") {
                activeRow -= 1;
            }

            let prevCell = document.querySelector(`[data-row="${activeRow}"][data-col="${activeCol}"]`);
            if (prevCell) {
                highlightWord();
                prevCell.focus({ preventScroll: true });
            } else {
                // Previous cell doesn't exist — jump to previous clue
                let current = findCurrentClue();
                let clueNums = Object.keys(puzzle.clues[direction]).map(Number).sort((a, b) => a - b);
                let currentIndex = clueNums.indexOf(current.num);

                if (currentIndex > 0) {
                    let prevClue = puzzle.clues[direction][clueNums[currentIndex - 1]];
                    if (direction === "across") {
                        activeRow = prevClue.row;
                        activeCol = prevClue.col + prevClue.length - 1;
                    } else {
                        activeRow = prevClue.row + prevClue.length - 1;
                        activeCol = prevClue.col;
                    }
                    highlightWord();
                    document.querySelector(`[data-row="${activeRow}"][data-col="${activeCol}"]`).focus({ preventScroll: true });
                }
            }
            e.preventDefault();
        }
    }
}

function findCurrentClue() {
    let clueEntries = Object.entries(puzzle.clues[direction]);
    for (let [num, clue] of clueEntries) {
        if (direction === "across") {
            if (activeRow === clue.row && activeCol >= clue.col && activeCol < clue.col + clue.length) {
                return { num: parseInt(num), clue };
            }
        } else {
            if (activeCol === clue.col && activeRow >= clue.row && activeRow < clue.row + clue.length) {
                return { num: parseInt(num), clue };
            }
        }
    }
    return null;
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
        for (let answer=0; answer<answers.length; answer++) {
            for (let letter=0; letter<answers[answer].length; letter++) {
                if (answers[answer][letter] == "#") {
                    continue;
                } else {
                    document.querySelector(`[data-row="${answer}"][data-col="${letter}"]`).classList.add("correct");
                }
            }
        }
        setTimeout(() => {
            document.querySelector(".yay").style.display = "block";
        }, 1500);
    }
};

function updateClueBarPosition() {
    let clueBar = document.querySelector(".clue-bar");
    let offset = window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop;
    clueBar.style.bottom = `${offset}px`;
}

window.visualViewport.addEventListener("resize", updateClueBarPosition);
window.visualViewport.addEventListener("scroll", updateClueBarPosition);

// generate_puzzle();