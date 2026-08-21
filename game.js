let currentOrdinal = Y_Sequence.ZERO
let currentBase = 10
let pathmaxlength = 100
let factor_shift_level = 0;
let automation_unlocked = false


//Tabs
let ordinal_tab = document.getElementById("ordinal-tab")
let automation_tab = document.getElementById("automation-tab")

//Buttons
let successorButton = document.getElementById("click-button")
let maximizeButton = document.getElementById("maximize-button")
let factorshiftButton = document.getElementById("shift-button")
let unlockautomationbtn = document.getElementById("automation-unlock-button")

let open_automation_btn = document.getElementById("automation-tab-open")
open_automation_btn.style.display = "none" //hide for intl


//Display
let numberdisplay = document.getElementById("current-number")
let notationcoverted = document.getElementById("current-converted")
let factor_shift_information = document.getElementById("factor-shift-information")

let factorshiftcost = [
    "1,2",                   // equivalent to 10 clicks
    "1,2,1,2",               // equivalent to 18 clicks
    "1,2,1,2,1,2",           // equivalent to 24 clicks
    "1,2,1,2,1,2,1,2",   // equivalent to 28 clicks
    "1,2,2",                 // equivalent to 36 clicks
    "1,2,2,1,2,2",            // equivalent to 50 clicks
    "1,2,2,2",                // equivalent to 64 clicks
    "Limit"                   // equivalent to END GAME
]

// Local Storage Save / Load Handlers
function saveGame() {
    let saveData = {
        currentOrdinal: currentOrdinal,
        currentBase: currentBase,
        factor_shift_level: factor_shift_level,
        automation_unlocked: automation_unlocked,
        pathmaxlength: pathmaxlength
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
            if (data.automation_unlocked !== undefined) {
                automation_unlocked = data.automation_unlocked;
                open_automation_btn.style.display = automation_unlocked ? "block" : "none";
            }
            if (data.pathmaxlength !== undefined) pathmaxlength = data.pathmaxlength;
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
    let currentpath = [];
    let ordinallist = ["Limit"]; // Initialize with root element
    let currentordinal = "Limit";

    while (Y_Sequence.cmp(ord, currentordinal) < 0 && currentpath.length <= pathmaxlength) {
        let step = f(ord, currentordinal);

        // Immediate yield/return check: if the new step meets or exceeds base - 1,
        // yield to the ordinal state right before this path branch began.
        if (step >= base) {
            return currentordinal; // Equivalent to ordinallist.at(-1) before pushing
        }

        currentpath.push(step);
        currentordinal = Y_Sequence.fs(currentordinal, step);
        ordinallist.push(currentordinal);
    }

    if (currentpath.length > pathmaxlength) {
        // Handle collapse when exceeding path length limit
        let prev = ordinallist.length >= 2 ? ordinallist.at(-2) : ordinallist.at(-1);
        let lastIdx = currentpath.at(-1) || 0;
        return Y_Sequence.fs(prev, Math.max(lastIdx - 1, 0));
    }

    return currentordinal;
}


function successorordinal(ord) {
    return (ord.length == 0) ? "1" : ord + ",1"
}

function display() {
    numberdisplay.innerHTML = (currentOrdinal.length == 0) ? "0" : "g<sub>&omega;-Y(" + currentOrdinal + ")</sub>(" + currentBase + ")"
    notationcoverted.innerHTML = (currentOrdinal.length == 0) ? "0" : "g<sub>" + convert_From_wY(currentOrdinal, "2-shifted OCF") + "</sub>(" + currentBase + ")"

    let cost = factorshiftcost[factor_shift_level];
    factorshiftButton.innerHTML = "Reach g<sub>" + convert_From_wY(cost, "2-shifted OCF") + "</sub>(" + currentBase + ") to perform a factor shift";

    factor_shift_information.innerHTML = "You have factor shift for " + factor_shift_level + ((factor_shift_level > 1) ? " times" : " time") + ", and the current base is " + currentBase
    
    unlockautomationbtn.innerHTML = (automation_unlocked)? "Unlocked Automation!" : "Reach g<sub>&omega;<sup>&omega;+2</sup></sub>(" + currentBase + ") to unlock automation tab!"
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

function unlockautomation() {
    let cost = "1,2,3,2,2"
    if (Y_Sequence.cmp(cost, currentOrdinal) <= 0) {
        factor_shift_level = 0;
        currentBase = 10;
        currentOrdinal = "";
        open_automation_btn.style.display = "block"
        automation_unlocked = true
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





//SOME ULITIES
function showTab(tabId) {
    const tabs = document.querySelectorAll('div.tabs');
    tabs.forEach(tab => {
        tab.style.display = 'none';
    });

    const activeTab = document.querySelector(`div.tabs#${tabId}`);
    if (activeTab) {
        activeTab.style.display = 'block';
    }
}