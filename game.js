let currentOrdinal = Y_Sequence.ZERO
let currentBase = 10
let pathmaxlength = 100
let factor_shift_level = 0;

let successorButton = document.getElementById("click-button")
let maximizeButton = document.getElementById("maximize-button")
let factorshiftButton = document.getElementById("shift-button")

let numberdisplay = document.getElementById("current-number")
let notationcoverted = document.getElementById("current-converted")

let factorshiftcost = [
    "1,2,2" ,                 // equivalent to 100 clicks
    "1,2,2,1,2,2" ,           // equivalent to 162 clicks
    "1,2,2,1,2,2,1,2,2" ,     // equivalent to 192 clicks
    "1,2,2,2" ,               // equivalent to 343 clicks
    "1,2,2,2,1,2,2,2" ,       // equivalent to 432 clicks
    "1,2,2,2,2",              // equivalent to 625 clicks
    "1,2,3,2",                // equivalent to 1024 clicks
    "Limit"                   // equivalent to END GAME
]

// Local Storage Save / Load Handlers
function saveGame() {
    let saveData = {
        currentOrdinal: currentOrdinal,
        currentBase: currentBase,
        factor_shift_level: factor_shift_level
    };
    localStorage.setItem("y_sequence_incremental_save", JSON.stringify(saveData));
}

function loadGame() {
    let saved = localStorage.getItem("y_sequence_incremental_save");
    if (saved !== null) {
        try {
            let data = JSON.parse(saved);
            if (data.currentOrdinal !== undefined) currentOrdinal = data.currentOrdinal;
            if (data.currentBase !== undefined) currentBase = data.currentBase;
            if (data.factor_shift_level !== undefined) factor_shift_level = data.factor_shift_level;
        } catch (e) {
            console.error("Failed to parse save data:", e);
        }
    }
}

function f(a, b) { // return the least element of b fs's that not smaller than a
    let i = 0
    while (Y_Sequence.cmp(a, Y_Sequence.fs(b, i)) > 0) {
        i++
    }
    return i
}

function maximizeordinal(ord, base) {
    let currentordinal = "Limit";
    let currentpath = [];
    let parentordinal = null;

    while (Y_Sequence.cmp(ord, currentordinal) < 0) {
        if (currentpath.length >= pathmaxlength) {
            if (parentordinal === null) return currentordinal;
            let lastIdx = currentpath.at(-1);
            return Y_Sequence.fs(parentordinal, Math.max(lastIdx - 1, 0));
        }

        let idx = f(ord, currentordinal);

        if (idx >= base-1) {
            return currentordinal; 
        }

        parentordinal = currentordinal;
        currentpath.push(idx);
        currentordinal = Y_Sequence.fs(currentordinal, idx);
    }

    return currentordinal;
}

function successorordinal(ord) {
    return (ord.length == 0) ? "1" : ord + ",1"
}

function display() {
    numberdisplay.innerHTML = (currentOrdinal.length == 0)? "0" : "g<sub>" + currentOrdinal + "</sub>(" + currentBase + ")"
    notationcoverted.innerHTML = (currentOrdinal.length == 0)? "0" :"g<sub>" + Conv_BMS_OCF(Conv_Y_sequence_BMS(currentOrdinal)) + "</sub>(" + currentBase + ")"
    
    let cost = factorshiftcost[factor_shift_level];
    factorshiftButton.innerHTML = "Reach g<sub>" + Conv_BMS_OCF(Conv_Y_sequence_BMS(cost)) + "</sub>(" + currentBase + ") to perform a factor shift";
}

function buyfactorshift() {
    let cost = factorshiftcost[factor_shift_level];
    if (cost && cost !== "Limit" && Y_Sequence.cmp(cost, currentOrdinal) <= 0) {
        factor_shift_level++;
        currentBase--;
        currentOrdinal = Y_Sequence.ZERO;
        saveGame();
    }
    display();
}

// Event Bindings
successorButton.onclick = function () {
    currentOrdinal = successorordinal(currentOrdinal);
    display();
    saveGame();
}

maximizeButton.onclick = function () {
    currentOrdinal = maximizeordinal(currentOrdinal, currentBase);
    display();
    saveGame();
}

factorshiftButton.onclick = function () {
    buyfactorshift();
}

// Initialize Game State
loadGame();
display();