let currentOrdinal = Y_Sequence.ZERO;
let currentBase = 10;
let pathmaxlength = 100;
let factor_shift_level = 0;
let automation_unlocked = false;

let successor_autoclicker_level = 0;
let maximize_autoclicker_level = 0;

let successor_autoclicker_cost = "1,2,3,2";
let maximize_autoclicker_cost = "1,2,3,2";

let successoramount = "1";
let successorlevel = 0;
let successorupgradecost = "1,2";
let successorupgradecostaddition = "1,2";

let successorupgradecost2 = "1,2,2";
let successorupgradecostaddition2 = "1,2,1,2";

let successorupgradecost3 = "1,2,3";
let successorupgradecostaddition3 = "1,2,2";

let successorupgradecost4 = "1,2,3,2";

let successorupgrade5unlocked = false;
let successorupgradecost5 = "1,2,3,2,2";

let successorupgrade6unlocked = false;
let successorupgradecost6 = "1,2,3,2,2,2";

let successorupgrade7unlocked = false;
let successorupgradecost7 = "1,2,3,2,2,2,2";

// Cache DOM Elements
const numberdisplay = document.getElementById("current-number");
const notationcoverted = document.getElementById("current-converted");
const factor_shift_information = document.getElementById("factor-shift-information");

const unlockautomationbtn = document.getElementById("automation-unlock-button");
const open_automation_btn = document.getElementById("automation-tab-open");
const factorshiftButton = document.getElementById("shift-button");

const successorAutoclickerInfo = document.getElementById("successor-autoclicker-information");
const maximizeAutoclickerInfo = document.getElementById("maximize-autoclicker-information");
const buySuccessorAutoclickerBtn = document.getElementById("buy-successor-autoclicker-button");
const buyMaximizeAutoclickerBtn = document.getElementById("buy-maximize-autoclicker-button");

const upgradesuccessorpowerexample = document.getElementById("upgrade-successor-power-example");
const upgradesuccessorpowerexampleconverted = document.getElementById("upgrade-successor-power-example-converted");
const upgradesuccessorpowerinformation = document.getElementById("upgrade-successor-power-information");
const successorupgradeinformation = document.getElementById("successor-upgrade-information");

const successorupgradepurchasebutton = document.getElementById("successor-upgrade-purchase-button");
const successorupgradepurchasebutton2 = document.getElementById("successor-upgrade-purchase-button2");
const successorupgradepurchasebutton3 = document.getElementById("successor-upgrade-purchase-button3");
const successorupgradepurchasebutton4 = document.getElementById("successor-upgrade-purchase-button4");
const successorupgradepurchasebutton5 = document.getElementById("successor-upgrade-purchase-button5");
const successorupgradepurchasebutton6 = document.getElementById("successor-upgrade-purchase-button6");
const successorupgradepurchasebutton7 = document.getElementById("successor-upgrade-purchase-button7");

const succupgradeinfo = document.getElementById("succ-upgrade-info");
const succupgradeinfo2 = document.getElementById("succ-upgrade-2-info");
const succupgradeinfo3 = document.getElementById("succ-upgrade-3-info");
const succupgradeinfo4 = document.getElementById("succ-upgrade-4-info");
const succupgradeinfo5 = document.getElementById("succ-upgrade-5-info");
const succupgradeinfo6 = document.getElementById("succ-upgrade-6-info");
const succupgradeinfo7 = document.getElementById("succ-upgrade-7-info");

const factorshiftcost = [
    "1,2",
    "1,2,1,2",
    "1,2,1,2,1,2",
    "1,2,1,2,1,2,1,2",
    "1,2,2",
    "Limit"
];

//////////////////////////// HELPER FUNCTIONS //////////////////////////////////////////

function extractsumterms(input) {
    return input.split(/(?<!^),1/g).map((item, index) => (index === 0 ? item : "1" + item));
}

function minY(a, b) {
    return Y_Sequence.cmp(a, b) < 0 ? a : b;
}

function maxY(a, b) {
    return Y_Sequence.cmp(a, b) > 0 ? a : b;
}

function addY(a, b) {
    if (!a) return b;
    if (!b) return a;

    const termsA = extractsumterms(a);
    const termsB = extractsumterms(b);

    const allTerms = termsA.concat(termsB);
    allTerms.sort((x, y) => Y_Sequence.cmp(y, x)); 

    return allTerms.join(",");
}

function monictify(ord){
    if (!Array.isArray(ord)) { ord = extractsumterms(ord); }
    return ord.filter((item, i) => item !== ord[i - 1]).join(",");
}

function mulYtoNumber(a, b) {
    if (!Array.isArray(a)) {
        a = extractsumterms(a);
    }
    return a.flatMap(x => Array(b).fill(x)).join(',');
}

function increaseexpofmonicYordinal(ord, amount) {
    if (Y_Sequence.cmp(ord, Y_Sequence.ZERO) === 0) return "";
    return extractsumterms(ord).map(x => (x + ",2".repeat(amount))).join(',');
}

function f(a, b) {
    let i = 0;
    while (Y_Sequence.cmp(a, Y_Sequence.fs(b, i)) > 0) {
        i++;
    }
    return i;
}

function maximizeordinal(ord, base) {
    let currentpath = [];
    let ordinallist = ["Limit"];
    let currentordinal = "Limit";

    while (Y_Sequence.cmp(ord, currentordinal) < 0 && currentpath.length <= pathmaxlength) {
        let step = f(ord, currentordinal);

        if (step >= base) {
            return currentordinal;
        }

        currentpath.push(step);
        currentordinal = Y_Sequence.fs(currentordinal, step);
        ordinallist.push(currentordinal);
    }

    if (currentpath.length > pathmaxlength) {
        let prev = ordinallist.length >= 2 ? ordinallist.at(-2) : ordinallist.at(-1);
        let lastIdx = currentpath.at(-1) || 0;
        return Y_Sequence.fs(prev, Math.max(lastIdx - 1, 0));
    }

    return currentordinal;
}

function successorordinal(ord) {
    return addY(ord, successoramount);
}

function formatG(sub, base) {
    return `g<sub>${sub}</sub>(${base})`;
}

function isEmptyOrdinal(ord) {
    return !ord || ord.length === 0;
}

function updateElement(el, html) {
    if (el && el.innerHTML !== html) {
        el.innerHTML = html;
    }
}

//////////////////////////// RENDER FUNCTIONS //////////////////////////////////////////

// High Frequency: Runs on ticks or quick clicks (fast text update only)
function updateDynamicUI() {
    const isOrdEmpty = isEmptyOrdinal(currentOrdinal);
    const convertedCurrent = convert_From_wY(currentOrdinal, "2-shifted OCF");

    updateElement(numberdisplay, isOrdEmpty ? "0" : formatG(`&omega;-Y(${currentOrdinal})`, currentBase));
    updateElement(notationcoverted, isOrdEmpty ? "0" : formatG(convertedCurrent, currentBase));

    const addedvalue = addY(currentOrdinal, successoramount);
    const convertedvalue = convert_From_wY(addedvalue, "2-shifted OCF");
    const startRaw = isOrdEmpty ? "0" : formatG(`&omega;-Y(${currentOrdinal})`, currentBase);
    const startConverted = isOrdEmpty ? "0" : formatG(convertedCurrent, currentBase);
    const endRaw = formatG(`&omega;-Y(${addedvalue})`, currentBase);
    const endConverted = formatG(convertedvalue, currentBase);

    updateElement(upgradesuccessorpowerexample, `${startRaw} ↦ ${endRaw}`);
    updateElement(upgradesuccessorpowerexampleconverted, `Which is equivalent to: ${startConverted} ↦ ${endConverted}`);
}

// Low Frequency: Only called on upgrade/shift button actions
function updateStaticUI() {
    unlockautomationbtn.style.display = (factor_shift_level === 5) ? "block" : "none";
    open_automation_btn.style.display = automation_unlocked ? "block" : "none";

    const cost = factorshiftcost[factor_shift_level];
    const convertedCost = convert_From_wY(cost, "2-shifted OCF");
    updateElement(factorshiftButton, `Reach ${formatG(convertedCost, currentBase)} to perform a factor shift`);

    const timesText = factor_shift_level === 1 ? "time" : "times";
    const timesText2 = successorlevel === 1 ? "time" : "times";
    updateElement(factor_shift_information, `You have factor shift for ${factor_shift_level} ${timesText}, and the current base is ${currentBase}`);

    updateElement(unlockautomationbtn, automation_unlocked
        ? "Unlocked Automation!"
        : `Reach ${formatG("&omega;<sup>&omega;+1</sup>", currentBase)} to unlock automation tab!`);

    const succTimes = successor_autoclicker_level === 1 ? "time" : "times";
    const succCost = convert_From_wY(successor_autoclicker_cost, "2-shifted OCF");
    updateElement(successorAutoclickerInfo, `You have ${successor_autoclicker_level} successor autoclicker, which is clicking the successor button ${successor_autoclicker_level} ${succTimes} per second`);
    updateElement(buySuccessorAutoclickerBtn, `Buy Successor Autoclicker for ${formatG(succCost, currentBase)}`);

    const maxTimes = maximize_autoclicker_level === 1 ? "time" : "times";
    const maxCost = convert_From_wY(maximize_autoclicker_cost, "2-shifted OCF");
    updateElement(maximizeAutoclickerInfo, `You have ${maximize_autoclicker_level} maximize autoclicker, which is clicking the maximize button ${maximize_autoclicker_level} ${maxTimes} per second`);
    updateElement(buyMaximizeAutoclickerBtn, `Buy Maximize Autoclicker for ${formatG(maxCost, currentBase)}`);

    const convertedsccuessorpower = convert_From_wY(successoramount, "2-shifted OCF");
    updateElement(upgradesuccessorpowerinformation, "Your current successor power is: " + convertedsccuessorpower + " (in ω-Y terms: " + successoramount + ")");
    updateElement(successorupgradeinformation, "You have upgraded successor for " + successorlevel + " " + timesText2 + ", which equilvalent to the boost of " + (successorlevel + 1) + "x");

    updateElement(successorupgradepurchasebutton, "Upgrade successor power by 1 for: " + formatG(convert_From_wY(successorupgradecost, "2-shifted OCF"), currentBase));
    updateElement(successorupgradepurchasebutton2, "Upgrade successor power by 2 for: " + formatG(convert_From_wY(successorupgradecost2, "2-shifted OCF"), currentBase));
    updateElement(successorupgradepurchasebutton3, "Upgrade successor power by &omega; for: " + formatG(convert_From_wY(successorupgradecost3, "2-shifted OCF"), currentBase));
    updateElement(successorupgradepurchasebutton4, "Increase successor power by the lowest sum terms for " + formatG(convert_From_wY(successorupgradecost4, "2-shifted OCF"), currentBase));
    updateElement(successorupgradepurchasebutton5, (successorupgrade5unlocked) ? ("Increase successor power by the highest sum terms for " + formatG(convert_From_wY(successorupgradecost5, "2-shifted OCF"), currentBase)) : "Unlock upgrade for " + formatG("ω<sup>ω+2</sup>", currentBase));
    updateElement(successorupgradepurchasebutton6, (successorupgrade6unlocked) ? ("Increase successor power by all the monic sum terms " + formatG(convert_From_wY(successorupgradecost6, "2-shifted OCF"), currentBase)) : "Unlock upgrade for " + formatG("ω<sup>ω+3</sup>", currentBase));
    updateElement(successorupgradepurchasebutton7, (successorupgrade7unlocked) ? ("Increase successor power by all the monic sum terms doubled " + formatG(convert_From_wY(successorupgradecost7, "2-shifted OCF"), currentBase)) : "Unlock upgrade for " + formatG("ω<sup>ω+4</sup>", currentBase));

    updateElement(succupgradeinfo, ": " + convert_From_wY(successoramount, "2-shifted OCF") + " ↦ " + convert_From_wY(successoramount + ",1", "2-shifted OCF"));
    updateElement(succupgradeinfo2, ": " + convert_From_wY(successoramount, "2-shifted OCF") + " ↦ " + convert_From_wY(successoramount + ",1,1", "2-shifted OCF"));
    updateElement(succupgradeinfo3, ": " + convert_From_wY(successoramount, "2-shifted OCF") + " ↦ " + convert_From_wY(addY(successoramount, "1,2"), "2-shifted OCF"));
    updateElement(succupgradeinfo4, ": " + convert_From_wY(successoramount, "2-shifted OCF") + " ↦ " + convert_From_wY(addY(successoramount, extractsumterms(successoramount).at(-1)), "2-shifted OCF"));
    updateElement(succupgradeinfo5, (successorupgrade5unlocked) ? (": " + convert_From_wY(successoramount, "2-shifted OCF") + " ↦ " + convert_From_wY(addY(successoramount, extractsumterms(successoramount)[0]), "2-shifted OCF")) : "");
    updateElement(succupgradeinfo6, (successorupgrade6unlocked) ? (": " + convert_From_wY(successoramount, "2-shifted OCF") + " ↦ " + convert_From_wY(addY(successoramount, monictify(successoramount)), "2-shifted OCF")) : "");
    updateElement(succupgradeinfo7, (successorupgrade7unlocked) ? (": " + convert_From_wY(successoramount, "2-shifted OCF") + " ↦ " + convert_From_wY(addY(successoramount, mulYtoNumber(monictify(successoramount), 2)), "2-shifted OCF")) : "");
}

function displayFull() {
    updateDynamicUI();
    updateStaticUI();
}

//////////////////////////// GAME ACTIONS //////////////////////////////////////////

function applySuccessor(renderDynamic = true) {
    currentOrdinal = successorordinal(currentOrdinal);
    if (renderDynamic) updateDynamicUI();
}

function applyMaximize(renderDynamic = true) {
    currentOrdinal = maximizeordinal(currentOrdinal, currentBase);
    if (renderDynamic) updateDynamicUI();
}

function buyfactorshift() {
    let cost = factorshiftcost[factor_shift_level];
    if (cost && cost !== "Limit" && Y_Sequence.cmp(cost, currentOrdinal) <= 0) {
        factor_shift_level++;
        currentBase--;
        currentOrdinal = Y_Sequence.ZERO;
        displayFull();
    }
}

function unlockautomation() {
    let cost = "1,2,3,2";
    if (Y_Sequence.cmp(cost, currentOrdinal) <= 0) {
        automation_unlocked = true;
        displayFull();
    }
}

function purchase_successor_autoclicker() {
    if (Y_Sequence.cmp(successor_autoclicker_cost, currentOrdinal) <= 0) {
        currentOrdinal = "";
        successor_autoclicker_level++;
        successor_autoclicker_cost = maximizeordinal(successor_autoclicker_cost + "," + extractsumterms(successor_autoclicker_cost).at(-1), currentBase);
        displayFull();
    }
}

function purchase_maximize_autoclicker() {
    if (Y_Sequence.cmp(maximize_autoclicker_cost, currentOrdinal) <= 0) {
        currentOrdinal = "";
        maximize_autoclicker_level++;
        maximize_autoclicker_cost = maximizeordinal(maximize_autoclicker_cost + "," + extractsumterms(maximize_autoclicker_cost).at(-1), currentBase);
        displayFull();
    }
}

function purchase_successor_power_upgrade() {
    if (Y_Sequence.cmp(successorupgradecost, currentOrdinal) <= 0) {
        currentOrdinal = "";
        successoramount = addY(successoramount, "1");
        successorupgradecost = maximizeordinal(addY(successorupgradecost, successorupgradecostaddition), currentBase);
        successorupgradecostaddition = maximizeordinal(addY(successorupgradecostaddition, "1,2"), currentBase);
        successorlevel++;
        displayFull();
    }
}

function purchase_successor_power_upgrade2() {
    if (Y_Sequence.cmp(successorupgradecost2, currentOrdinal) <= 0) {
        currentOrdinal = "";
        successoramount = addY(successoramount, "1,1");
        successorupgradecost2 = maximizeordinal(addY(successorupgradecost2, successorupgradecostaddition2), currentBase);
        successorupgradecostaddition2 = maximizeordinal(addY(successorupgradecostaddition2, "1,2,1,2"), currentBase);
        successorlevel += 2;
        displayFull();
    }
}

function purchase_successor_power_upgrade3() {
    if (Y_Sequence.cmp(successorupgradecost3, currentOrdinal) <= 0) {
        currentOrdinal = "";
        successoramount = addY(successoramount, "1,2");
        successorupgradecost3 = maximizeordinal(addY(successorupgradecost3, successorupgradecostaddition3), currentBase);
        successorupgradecostaddition3 = maximizeordinal(addY(successorupgradecostaddition3, "1,2,2"), currentBase);
        successorlevel += currentBase;
        displayFull();
    }
}

function purchase_successor_power_upgrade4() {
    if (Y_Sequence.cmp(successorupgradecost4, currentOrdinal) <= 0) {
        currentOrdinal = "";
        successoramount = addY(successoramount, extractsumterms(successoramount).at(-1));
        successorupgradecost4 = maximizeordinal(successorupgradecost4 + ",2", currentBase);
        successorlevel += currentBase * 2;
        displayFull();
    }
}

function purchase_successor_power_upgrade5() {
    if (Y_Sequence.cmp("1,2,3,2,2", currentOrdinal) <= 0 && !successorupgrade5unlocked){
        successorupgrade5unlocked = true;
        currentOrdinal = "";
        displayFull();
        return;
    }

    if (!successorupgrade5unlocked) return;

    if (Y_Sequence.cmp(successorupgradecost5, currentOrdinal) <= 0) {
        currentOrdinal = "";
        successoramount = addY(successoramount, extractsumterms(successoramount)[0]);
        successorupgradecost5 = maximizeordinal(successorupgradecost5 + ",2", currentBase);
        successorlevel += currentBase * 3;
        displayFull();
    }
}

function purchase_successor_power_upgrade6() {
    if (Y_Sequence.cmp("1,2,3,2,2,2", currentOrdinal) <= 0 && !successorupgrade6unlocked){
        successorupgrade6unlocked = true;
        currentOrdinal = "";
        displayFull();
        return;
    }

    if (!successorupgrade6unlocked) return;

    if (Y_Sequence.cmp(successorupgradecost6, currentOrdinal) <= 0) {
        currentOrdinal = "";
        successoramount = addY(successoramount, monictify(successoramount));
        successorupgradecost6 = maximizeordinal(successorupgradecost6 + ",2", currentBase);
        successorlevel += currentBase**2;
        displayFull();
    }
}

function purchase_successor_power_upgrade7() {
    if (Y_Sequence.cmp("1,2,3,2,2,2,2", currentOrdinal) <= 0 && !successorupgrade7unlocked){
        successorupgrade7unlocked = true;
        currentOrdinal = "";
        displayFull();
        return;
    }

    if (!successorupgrade7unlocked) return;

    if (Y_Sequence.cmp(successorupgradecost7, currentOrdinal) <= 0) {
        currentOrdinal = "";
        successoramount = addY(successoramount, mulYtoNumber(monictify(successoramount), 2));
        successorupgradecost7 = maximizeordinal(successorupgradecost7 + ",2", currentBase);
        successorlevel += (currentBase**2) * 2;
        displayFull();
    }
}

function maximizesuccessor() {
    successoramount = maximizeordinal(successoramount, currentBase);
    displayFull();
}

//////////////////////////// SAVE / LOAD / EXPORT //////////////////////////////////////////

function exportGame() {
    saveGame();
    let saved = localStorage.getItem("y_sequence_incremental_save");
    if (!saved) return;

    let exportData = btoa(saved);

    navigator.clipboard.writeText(exportData).then(() => {
        alert("Save string copied to clipboard!");
    }).catch(() => {
        prompt("Copy your save string manually:", exportData);
    });
}

function importGame() {
    let input = prompt("Paste your export string here:");
    if (!input) return;

    try {
        let jsonString = atob(input.trim());
        let parsed = JSON.parse(jsonString);

        if (typeof parsed === "object" && parsed !== null) {
            localStorage.setItem("y_sequence_incremental_save", jsonString);
            loadGame();
            displayFull();
            alert("Game loaded successfully!");
        } else {
            throw new Error("Invalid format");
        }
    } catch (e) {
        alert("Failed to import save: Invalid or corrupted import string.");
    }
}

function saveGame() {
    let saveData = {
        currentOrdinal,
        currentBase,
        factor_shift_level,
        automation_unlocked,
        pathmaxlength,
        successor_autoclicker_level,
        maximize_autoclicker_level,
        successor_autoclicker_cost,
        maximize_autoclicker_cost,
        successoramount,
        successorlevel,
        successorupgradecost,
        successorupgradecostaddition,
        successorupgradecost2,
        successorupgradecostaddition2,
        successorupgradecost3,
        successorupgradecostaddition3,
        successorupgradecost4,
        successorupgrade5unlocked,
        successorupgradecost5,
        successorupgrade6unlocked,
        successorupgradecost6,
        successorupgrade7unlocked,
        successorupgradecost7
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
            if (data.automation_unlocked !== undefined) automation_unlocked = data.automation_unlocked;
            if (data.pathmaxlength !== undefined) pathmaxlength = data.pathmaxlength;

            if (data.successor_autoclicker_level !== undefined) successor_autoclicker_level = data.successor_autoclicker_level;
            if (data.maximize_autoclicker_level !== undefined) maximize_autoclicker_level = data.maximize_autoclicker_level;
            if (data.successor_autoclicker_cost !== undefined) successor_autoclicker_cost = data.successor_autoclicker_cost;
            if (data.maximize_autoclicker_cost !== undefined) maximize_autoclicker_cost = data.maximize_autoclicker_cost;

            if (data.successoramount !== undefined) successoramount = data.successoramount;
            if (data.successorlevel !== undefined) successorlevel = data.successorlevel;
            if (data.successorupgradecost !== undefined) successorupgradecost = data.successorupgradecost;
            if (data.successorupgradecostaddition !== undefined) successorupgradecostaddition = data.successorupgradecostaddition;
            if (data.successorupgradecost2 !== undefined) successorupgradecost2 = data.successorupgradecost2;
            if (data.successorupgradecostaddition2 !== undefined) successorupgradecostaddition2 = data.successorupgradecostaddition2;
            if (data.successorupgradecost3 !== undefined) successorupgradecost3 = data.successorupgradecost3;
            if (data.successorupgradecostaddition3 !== undefined) successorupgradecostaddition3 = data.successorupgradecostaddition3;
            if (data.successorupgradecost4 !== undefined) successorupgradecost4 = data.successorupgradecost4;
            if (data.successorupgrade5unlocked !== undefined) successorupgrade5unlocked = data.successorupgrade5unlocked;
            if (data.successorupgradecost5 !== undefined) successorupgradecost5 = data.successorupgradecost5;
            if (data.successorupgrade6unlocked !== undefined) successorupgrade6unlocked = data.successorupgrade6unlocked;
            if (data.successorupgradecost6 !== undefined) successorupgradecost6 = data.successorupgradecost6;
            if (data.successorupgrade7unlocked !== undefined) successorupgrade7unlocked = data.successorupgrade7unlocked;
            if (data.successorupgradecost7 !== undefined) successorupgradecost7 = data.successorupgradecost7;

            if (factor_shift_level > 5) factor_shift_level = 5;
            currentBase = 10 - factor_shift_level;
        } catch (e) {
            console.error("Failed to parse save data:", e);
        }
    }
}

function resetGame() {
    if (!confirm("Are you sure you want to reset your progress? This cannot be undone.")) {
        return;
    }

    localStorage.removeItem("y_sequence_incremental_save");

    currentOrdinal = Y_Sequence.ZERO;
    currentBase = 10;
    pathmaxlength = 100;
    factor_shift_level = 0;
    automation_unlocked = false;

    successor_autoclicker_level = 0;
    maximize_autoclicker_level = 0;
    successor_autoclicker_cost = "1,2,3,2";
    maximize_autoclicker_cost = "1,2,3,2";

    successoramount = "1";
    successorlevel = 0;
    successorupgradecost = "1,2";
    successorupgradecostaddition = "1,2";
    successorupgradecost2 = "1,2,2";
    successorupgradecostaddition2 = "1,2,1,2";
    successorupgradecost3 = "1,2,3";
    successorupgradecostaddition3 = "1,2,2";
    successorupgradecost4 = "1,2,3,2";

    successorupgrade5unlocked = false;
    successorupgradecost5 = "1,2,3,2,2";

    successorupgrade6unlocked = false;
    successorupgradecost6 = "1,2,3,2,2,2";

    successorupgrade7unlocked = false;
    successorupgradecost7 = "1,2,3,2,2,2,2";

    showTab('ordinal-tab');
    displayFull();
}

//////////////////////////// EVENT LISTENERS & LOOPS //////////////////////////////////////////

// Button Listeners for elements missing inline onclick attributes in HTML
document.getElementById("click-button").onclick = () => applySuccessor(true);
document.getElementById("maximize-button").onclick = () => applyMaximize(true);
factorshiftButton.onclick = buyfactorshift;

// Key Listeners
document.addEventListener("keydown", (event) => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

    const key = event.key.toLowerCase();
    if (key === 's') {
        applySuccessor(true);
    } else if (key === 'm') {
        applyMaximize(true);
    }
});

// Tab Navigation
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

// Initialization
loadGame();
displayFull();

// Save Interval
setInterval(() => {
    saveGame();
}, 5000);

// Simple Autoclicker Interval Loop
let lastSuccessorTick = Date.now();
let lastMaximizeTick = Date.now();

setInterval(() => {
    const now = Date.now();
    let stateChanged = false;

    if (successor_autoclicker_level > 0) {
        const successorInterval = 1000 / successor_autoclicker_level;
        if (now - lastSuccessorTick >= successorInterval) {
            applySuccessor(false);
            lastSuccessorTick = now;
            stateChanged = true;
        }
    }

    if (maximize_autoclicker_level > 0) {
        const maximizeInterval = 1000 / maximize_autoclicker_level;
        if (now - lastMaximizeTick >= maximizeInterval) {
            applyMaximize(false);
            lastMaximizeTick = now;
            stateChanged = true;
        }
    }

    if (stateChanged) {
        updateDynamicUI();
    }
}, 1);

//////////////////////////// FPS COUNTER //////////////////////////////////////////

const fpsDisplay = document.getElementById("fps-display");

let frameCount = 0;
let lastFpsTime = performance.now();

function updateFPSCounter(now) {
    frameCount++;

    // Calculate and render FPS every 500ms for stability
    if (now - lastFpsTime >= 500) {
        const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
        if (fpsDisplay) {
            fpsDisplay.textContent = fps+"fps";
        }
        frameCount = 0;
        lastFpsTime = now;
    }

    requestAnimationFrame(updateFPSCounter);
}

// Start the FPS loop
requestAnimationFrame(updateFPSCounter);
