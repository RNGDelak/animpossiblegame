let currentOrdinal = typeof Y_Sequence !== "undefined" ? Y_Sequence.ZERO : "";
let currentBase = 10;
let pathmaxlength = 100;
let factor_shift_level = 0;
let automation_unlocked = false;
let ObjectiveHtml = document.getElementById("Objective");

// Autoclicker levels, costs, and toggle states
let successor_autoclicker_level = 0;
let addition_autoclicker_level = 0;
let maximize_autoclicker_level = 0;

let successor_autoclicker_enabled = true;
let addition_autoclicker_enabled = true;
let maximize_autoclicker_enabled = true;

let successor_autoclicker_cost = "1,2,3,2";
let addition_autoclicker_cost = "1,2,3,2";
let maximize_autoclicker_cost = "1,2,3,2";

// Addition Power state variables
let additionamount = "1";
let additionlevel = 0;

let additionupgradecost = "1,2";
let additionupgradecostaddition = "1,2";

let additionupgradecost2 = "1,2,2";
let additionupgradecostaddition2 = "1,2,1,2";

let additionupgradecost3 = "1,2,3";
let additionupgradecostaddition3 = "1,2,2";

let additionupgradecost4 = "1,2,3,2";

let additionupgrade5unlocked = false;
let additionupgradecost5 = "1,2,3,2,2";

let additionupgrade6unlocked = false;
let additionupgradecost6 = "1,2,3,2,2,2";

let additionupgrade7unlocked = false;
let additionupgradecost7 = "1,2,3,2,2,2,2";

let additionupgrade8unlocked = false;
let additionupgradecost8 = "1,2,3,2,3"; // w^w*2

let additionupgrade9unlocked = false;
let additionupgradecost9 = "1,2,3,2,3,2,3"; // w^w*3

let additionupgrade10unlocked = false;
let additionupgradecost10 = "1,2,3,3"; // w^w^2

// Cache DOM Elements
const numberdisplay = document.getElementById("current-number");
const notationcoverted = document.getElementById("current-converted");
const fpsdisplay = document.getElementById("fps-display");
const factor_shift_information = document.getElementById("factor-shift-information");

const additionButton = document.getElementById("addition-button");
const unlockautomationbtn = document.getElementById("automation-unlock-button");
const open_automation_btn = document.getElementById("automation-tab-open");
const factorshiftButton = document.getElementById("shift-button");

// Automation DOM Elements
const successorAutoclickerInfo = document.getElementById("successor-autoclicker-information");
const additionAutoclickerInfo = document.getElementById("addition-autoclicker-information");
const maximizeAutoclickerInfo = document.getElementById("maximize-autoclicker-information");

const buySuccessorAutoclickerBtn = document.getElementById("buy-successor-autoclicker-button");
const buyAdditionAutoclickerBtn = document.getElementById("buy-addition-autoclicker-button");
const buyMaximizeAutoclickerBtn = document.getElementById("buy-maximize-autoclicker-button");

const toggleSuccessorAutoclickerBtn = document.getElementById("toggle-successor-autoclicker-button");
const toggleAdditionAutoclickerBtn = document.getElementById("toggle-addition-autoclicker-button");
const toggleMaximizeAutoclickerBtn = document.getElementById("toggle-maximize-autoclicker-button");

// Upgrade DOM Elements
const upgradeadditionpowerexample = document.getElementById("upgrade-addition-power-example");
const upgradeadditionpowerexampleconverted = document.getElementById("upgrade-addition-power-example-converted");
const upgradeadditionpowerinformation = document.getElementById("upgrade-addition-power-information");
const additionupgradeinformation = document.getElementById("addition-upgrade-information");

const additionupgradepurchasebutton = document.getElementById("addition-upgrade-purchase-button");
const additionupgradepurchasebutton2 = document.getElementById("addition-upgrade-purchase-button2");
const additionupgradepurchasebutton3 = document.getElementById("addition-upgrade-purchase-button3");
const additionupgradepurchasebutton4 = document.getElementById("addition-upgrade-purchase-button4");
const additionupgradepurchasebutton5 = document.getElementById("addition-upgrade-purchase-button5");
const additionupgradepurchasebutton6 = document.getElementById("addition-upgrade-purchase-button6");
const additionupgradepurchasebutton7 = document.getElementById("addition-upgrade-purchase-button7");
const additionupgradepurchasebutton8 = document.getElementById("addition-upgrade-purchase-button8");
const additionupgradepurchasebutton9 = document.getElementById("addition-upgrade-purchase-button9");
const additionupgradepurchasebutton10 = document.getElementById("addition-upgrade-purchase-button10");

const addupgradeinfo = document.getElementById("add-upgrade-info");
const addupgradeinfo2 = document.getElementById("add-upgrade-2-info");
const addupgradeinfo3 = document.getElementById("add-upgrade-3-info");
const addupgradeinfo4 = document.getElementById("add-upgrade-4-info");
const addupgradeinfo5 = document.getElementById("add-upgrade-5-info");
const addupgradeinfo6 = document.getElementById("add-upgrade-6-info");
const addupgradeinfo7 = document.getElementById("add-upgrade-7-info");
const addupgradeinfo8 = document.getElementById("add-upgrade-8-info");
const addupgradeinfo9 = document.getElementById("add-upgrade-9-info");
const addupgradeinfo10 = document.getElementById("add-upgrade-10-info");

const factorshiftcost = [
    "1,2",
    "1,2,1,2",
    "1,2,1,2,1,2",
    "1,2,1,2,1,2,1,2",
    "1,2,2",
    "Limit"
];

//////////////////////////// TAB NAVIGATION //////////////////////////////////////////

function showTab(tabId) {
    const tabs = document.querySelectorAll('.tabs');
    tabs.forEach(tab => tab.style.display = 'none');

    const activeTab = document.getElementById(tabId);
    if (activeTab) {
        activeTab.style.display = 'block';
    }
}

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
    return addY(ord, "1");
}

function additionordinal(ord) {
    return addY(ord, additionamount);
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

function updateobjective() {
    let objectiveText = "";

    if (Y_Sequence.cmp("1,2,4", currentOrdinal) < 0) {
        objectiveText = "Objective: End game reached!! GG!";
    } else if (factor_shift_level >= 5 && automation_unlocked) {
        objectiveText = "Objective: Upgrade even more and reach g<sub>&psi;<sub>0</sub>(&Omega;)</sub>(5)";
    } else if (factor_shift_level >= 5 && !automation_unlocked) {
        objectiveText = "Objective: Unlock the automation tab";
    } else if (factor_shift_level >= 1) {
        objectiveText = "Objective: Perform factor shift 5 times (Pro tip: purchase addition upgrades in the upgrades tab!)";
    } else if (Y_Sequence.cmp("1,2", currentOrdinal) <= 0) {
        objectiveText = "Objective: Perform a Factor Shift!";
    } else {
        objectiveText = "Objective: Reach g<sub>&omega;</sub>(10) (click successor/addition 11 times then click maximize)";
    }

    updateElement(ObjectiveHtml, objectiveText);
}

function updateDynamicUI() {
    updateobjective();
    const isOrdEmpty = isEmptyOrdinal(currentOrdinal);
    const convertedCurrent = convert_From_wY(currentOrdinal, "2-shifted OCF");

    updateElement(numberdisplay, isOrdEmpty ? "0" : formatG(`&omega;-Y(${currentOrdinal})`, currentBase));
    updateElement(notationcoverted, isOrdEmpty ? "0" : formatG(convertedCurrent, currentBase));

    const addedvalue = addY(currentOrdinal, additionamount);
    const convertedvalue = convert_From_wY(addedvalue, "2-shifted OCF");
    const startRaw = isOrdEmpty ? "0" : formatG(`&omega;-Y(${currentOrdinal})`, currentBase);
    const startConverted = isOrdEmpty ? "0" : formatG(convertedCurrent, currentBase);
    const endRaw = formatG(`&omega;-Y(${addedvalue})`, currentBase);
    const endConverted = formatG(convertedvalue, currentBase);

    updateElement(upgradeadditionpowerexample, `${startRaw} ↦ ${endRaw}`);
    updateElement(upgradeadditionpowerexampleconverted, `Which is equivalent to: ${startConverted} ↦ ${endConverted}`);
}

function updateStaticUI() {
    // Only show addition button if player bought at least 1 addition upgrade
    if (additionButton) {
        additionButton.style.display = (additionlevel >= 1) ? "inline-block" : "none";
    }

    unlockautomationbtn.style.display = (factor_shift_level === 5) ? "block" : "none";
    open_automation_btn.style.display = automation_unlocked ? "block" : "none";

    const cost = factorshiftcost[factor_shift_level];
    const convertedCost = convert_From_wY(cost, "2-shifted OCF");
    updateElement(factorshiftButton, `Reach ${formatG(convertedCost, currentBase)} to perform a factor shift`);

    const timesText = factor_shift_level === 1 ? "time" : "times";
    const timesText2 = additionlevel === 1 ? "time" : "times";
    updateElement(factor_shift_information, `You have factor shifted ${factor_shift_level} ${timesText}, and the current base is ${currentBase}`);

    updateElement(unlockautomationbtn, automation_unlocked
        ? "Unlocked Automation!"
        : `Reach ${formatG("&omega;<sup>&omega;+1</sup>", currentBase)} to unlock automation tab!`);

    // --- AUTOCLICKERS ---
    const succTimes = successor_autoclicker_level === 1 ? "time" : "times";
    const succCost = convert_From_wY(successor_autoclicker_cost, "2-shifted OCF");
    updateElement(successorAutoclickerInfo, `You have ${successor_autoclicker_level} successor autoclickers, clicking ${successor_autoclicker_level} ${succTimes} per second.`);
    updateElement(buySuccessorAutoclickerBtn, `Buy Successor Autoclicker for ${formatG(succCost, currentBase)}`);
    updateElement(toggleSuccessorAutoclickerBtn, `Status: ${successor_autoclicker_enabled ? "ON" : "OFF"}`);

    const addTimes = addition_autoclicker_level === 1 ? "time" : "times";
    const addCost = convert_From_wY(addition_autoclicker_cost, "2-shifted OCF");
    updateElement(additionAutoclickerInfo, `You have ${addition_autoclicker_level} addition autoclickers, clicking ${addition_autoclicker_level} ${addTimes} per second.`);
    updateElement(buyAdditionAutoclickerBtn, `Buy Addition Autoclicker for ${formatG(addCost, currentBase)}`);
    updateElement(toggleAdditionAutoclickerBtn, `Status: ${addition_autoclicker_enabled ? "ON" : "OFF"}`);

    const maxTimes = maximize_autoclicker_level === 1 ? "time" : "times";
    const maxCost = convert_From_wY(maximize_autoclicker_cost, "2-shifted OCF");
    updateElement(maximizeAutoclickerInfo, `You have ${maximize_autoclicker_level} maximize autoclickers, clicking ${maximize_autoclicker_level} ${maxTimes} per second.`);
    updateElement(buyMaximizeAutoclickerBtn, `Buy Maximize Autoclicker for ${formatG(maxCost, currentBase)}`);
    updateElement(toggleMaximizeAutoclickerBtn, `Status: ${maximize_autoclicker_enabled ? "ON" : "OFF"}`);

    // --- CACHED CONVERSIONS FOR UPGRADE COSTS ---
    const addCost1 = convert_From_wY(additionupgradecost, "2-shifted OCF");
    const addCost2 = convert_From_wY(additionupgradecost2, "2-shifted OCF");
    const addCost3 = convert_From_wY(additionupgradecost3, "2-shifted OCF");
    const addCost4 = convert_From_wY(additionupgradecost4, "2-shifted OCF");
    const addCost5 = convert_From_wY(additionupgradecost5, "2-shifted OCF");
    const addCost6 = convert_From_wY(additionupgradecost6, "2-shifted OCF");
    const addCost7 = convert_From_wY(additionupgradecost7, "2-shifted OCF");
    const addCost8 = convert_From_wY(additionupgradecost8, "2-shifted OCF");
    const addCost9 = convert_From_wY(additionupgradecost9, "2-shifted OCF");
    const addCost10 = convert_From_wY(additionupgradecost10, "2-shifted OCF");

    const convertedadditionpower = convert_From_wY(additionamount, "2-shifted OCF");
    const extractsumterm = extractsumterms(additionamount);
    const monicAddition = monictify(additionamount);

    updateElement(upgradeadditionpowerinformation, "Your current addition power is: " + convertedadditionpower + " (in &omega;-Y terms: " + additionamount + ")");
    updateElement(additionupgradeinformation, "You have upgraded addition power " + additionlevel + " " + timesText2 + ", equivalent to a boost of " + (additionlevel + 1) + "x");

    updateElement(additionupgradepurchasebutton, "Upgrade addition power by 1 for: " + formatG(addCost1, currentBase));
    updateElement(additionupgradepurchasebutton2, "Upgrade addition power by 2 for: " + formatG(addCost2, currentBase));
    updateElement(additionupgradepurchasebutton3, "Upgrade addition power by &omega; for: " + formatG(addCost3, currentBase));
    updateElement(additionupgradepurchasebutton4, "Increase addition power by the lowest sum terms for: " + formatG(addCost4, currentBase));
    updateElement(additionupgradepurchasebutton5, (additionupgrade5unlocked) ? ("Increase addition power by the highest sum terms for " + formatG(addCost5, currentBase)) : "Unlock upgrade for " + formatG("&omega;<sup>&omega;+2</sup>", currentBase));
    updateElement(additionupgradepurchasebutton6, (additionupgrade6unlocked) ? ("Increase addition power by all the monic sum terms for " + formatG(addCost6, currentBase)) : "Unlock upgrade for " + formatG("&omega;<sup>&omega;+3</sup>", currentBase));
    updateElement(additionupgradepurchasebutton7, (additionupgrade7unlocked) ? ("Increase addition power by all the monic sum terms doubled for " + formatG(addCost7, currentBase)) : "Unlock upgrade for " + formatG("&omega;<sup>&omega;+4</sup>", currentBase));
    updateElement(additionupgradepurchasebutton8, (additionupgrade8unlocked) ? ("Double the addition power for " + formatG(addCost8, currentBase)) : "Unlock upgrade for " + formatG("&omega;<sup>&omega;2</sup>", currentBase));
    updateElement(additionupgradepurchasebutton9, (additionupgrade9unlocked) ? ("Triple the addition power for " + formatG(addCost9, currentBase)) : "Unlock upgrade for " + formatG("&omega;<sup>&omega;3</sup>", currentBase));
    updateElement(additionupgradepurchasebutton10, (additionupgrade10unlocked) ? ("Multiply addition power by &omega; for " + formatG(addCost10, currentBase)) : "Unlock upgrade for " + formatG("&omega;<sup>&omega;<sup>2</sup></sup>", currentBase));

    updateElement(addupgradeinfo, ": " + convertedadditionpower + " ↦ " + convert_From_wY(additionamount + ",1", "2-shifted OCF"));
    updateElement(addupgradeinfo2, ": " + convertedadditionpower + " ↦ " + convert_From_wY(additionamount + ",1,1", "2-shifted OCF"));
    updateElement(addupgradeinfo3, ": " + convertedadditionpower + " ↦ " + convert_From_wY(addY(additionamount, "1,2"), "2-shifted OCF"));
    updateElement(addupgradeinfo4, ": " + convertedadditionpower + " ↦ " + convert_From_wY(addY(additionamount, extractsumterm.at(-1)), "2-shifted OCF"));
    updateElement(addupgradeinfo5, (additionupgrade5unlocked) ? (": " + convertedadditionpower + " ↦ " + convert_From_wY(addY(additionamount, extractsumterm[0]), "2-shifted OCF")) : "");
    updateElement(addupgradeinfo6, (additionupgrade6unlocked) ? (": " + convertedadditionpower + " ↦ " + convert_From_wY(addY(additionamount, monicAddition), "2-shifted OCF")) : "");
    updateElement(addupgradeinfo7, (additionupgrade7unlocked) ? (": " + convertedadditionpower + " ↦ " + convert_From_wY(addY(additionamount, mulYtoNumber(monicAddition, 2)), "2-shifted OCF")) : "");
    updateElement(addupgradeinfo8, (additionupgrade8unlocked) ? (": " + convertedadditionpower + " ↦ " + convert_From_wY(mulYtoNumber(additionamount, 2), "2-shifted OCF")) : "");
    updateElement(addupgradeinfo9, (additionupgrade9unlocked) ? (": " + convertedadditionpower + " ↦ " + convert_From_wY(mulYtoNumber(additionamount, 3), "2-shifted OCF")) : "");
    updateElement(addupgradeinfo10, (additionupgrade10unlocked) ? (": " + convertedadditionpower + " ↦ " + convert_From_wY(extractsumterm.map(x => (Y_Sequence.cmp(x,"") > 0)? x+",2" : "1").join(','), "2-shifted OCF")) : "");
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

function applyAddition(renderDynamic = true) {
    currentOrdinal = additionordinal(currentOrdinal);
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

// Autoclicker Actions & Toggles
function purchase_successor_autoclicker() {
    if (Y_Sequence.cmp(successor_autoclicker_cost, currentOrdinal) <= 0) {
        currentOrdinal = "";
        successor_autoclicker_level++;
        successor_autoclicker_cost = maximizeordinal(successor_autoclicker_cost + "," + extractsumterms(successor_autoclicker_cost).at(-1), currentBase);
        displayFull();
    }
}

function toggle_successor_autoclicker() {
    successor_autoclicker_enabled = !successor_autoclicker_enabled;
    updateStaticUI();
}

function purchase_addition_autoclicker() {
    if (Y_Sequence.cmp(addition_autoclicker_cost, currentOrdinal) <= 0) {
        currentOrdinal = "";
        addition_autoclicker_level++;
        addition_autoclicker_cost = maximizeordinal(addition_autoclicker_cost + "," + extractsumterms(addition_autoclicker_cost).at(-1), currentBase);
        displayFull();
    }
}

function toggle_addition_autoclicker() {
    addition_autoclicker_enabled = !addition_autoclicker_enabled;
    updateStaticUI();
}

function purchase_maximize_autoclicker() {
    if (Y_Sequence.cmp(maximize_autoclicker_cost, currentOrdinal) <= 0) {
        currentOrdinal = "";
        maximize_autoclicker_level++;
        maximize_autoclicker_cost = maximizeordinal(maximize_autoclicker_cost + "," + extractsumterms(maximize_autoclicker_cost).at(-1), currentBase);
        displayFull();
    }
}

function toggle_maximize_autoclicker() {
    maximize_autoclicker_enabled = !maximize_autoclicker_enabled;
    updateStaticUI();
}

// Addition Power Upgrades
function purchase_addition_power_upgrade() {
    if (Y_Sequence.cmp(additionupgradecost, currentOrdinal) <= 0) {
        currentOrdinal = "";
        additionamount = addY(additionamount, "1");
        additionupgradecost = maximizeordinal(addY(additionupgradecost, additionupgradecostaddition), currentBase);
        additionupgradecostaddition = maximizeordinal(addY(additionupgradecostaddition, "1,2"), currentBase);
        additionlevel++;
        displayFull();
    }
}

function purchase_addition_power_upgrade2() {
    if (Y_Sequence.cmp(additionupgradecost2, currentOrdinal) <= 0) {
        currentOrdinal = "";
        additionamount = addY(additionamount, "1,1");
        additionupgradecost2 = maximizeordinal(addY(additionupgradecost2, additionupgradecostaddition2), currentBase);
        additionupgradecostaddition2 = maximizeordinal(addY(additionupgradecostaddition2, "1,2,1,2"), currentBase);
        additionlevel += 2;
        displayFull();
    }
}

function purchase_addition_power_upgrade3() {
    if (Y_Sequence.cmp(additionupgradecost3, currentOrdinal) <= 0) {
        currentOrdinal = "";
        additionamount = addY(additionamount, "1,2");
        additionupgradecost3 = maximizeordinal(addY(additionupgradecost3, additionupgradecostaddition3), currentBase);
        additionupgradecostaddition3 = maximizeordinal(addY(additionupgradecostaddition3, "1,2,2"), currentBase);
        additionlevel += currentBase;
        displayFull();
    }
}

function purchase_addition_power_upgrade4() {
    if (Y_Sequence.cmp(additionupgradecost4, currentOrdinal) <= 0) {
        currentOrdinal = "";
        additionamount = addY(additionamount, extractsumterms(additionamount).at(-1));
        additionupgradecost4 = maximizeordinal(additionupgradecost4 + ",2", currentBase);
        additionlevel += currentBase * 2;
        displayFull();
    }
}

function purchase_addition_power_upgrade5() {
    if (Y_Sequence.cmp("1,2,3,2,2", currentOrdinal) <= 0 && !additionupgrade5unlocked){
        additionupgrade5unlocked = true;
        currentOrdinal = "";
        displayFull();
        return;
    }

    if (!additionupgrade5unlocked) return;

    if (Y_Sequence.cmp(additionupgradecost5, currentOrdinal) <= 0) {
        currentOrdinal = "";
        additionamount = addY(additionamount, extractsumterms(additionamount)[0]);
        additionupgradecost5 = maximizeordinal(additionupgradecost5 + ",2", currentBase);
        additionlevel += currentBase * 3;
        displayFull();
    }
}

function purchase_addition_power_upgrade6() {
    if (Y_Sequence.cmp("1,2,3,2,2,2", currentOrdinal) <= 0 && !additionupgrade6unlocked){
        additionupgrade6unlocked = true;
        currentOrdinal = "";
        displayFull();
        return;
    }

    if (!additionupgrade6unlocked) return;

    if (Y_Sequence.cmp(additionupgradecost6, currentOrdinal) <= 0) {
        currentOrdinal = "";
        additionamount = addY(additionamount, monictify(additionamount));
        additionupgradecost6 = maximizeordinal(additionupgradecost6 + ",2", currentBase);
        additionlevel += currentBase**2;
        displayFull();
    }
}

function purchase_addition_power_upgrade7() {
    if (Y_Sequence.cmp("1,2,3,2,2,2,2", currentOrdinal) <= 0 && !additionupgrade7unlocked){
        additionupgrade7unlocked = true;
        currentOrdinal = "";
        displayFull();
        return;
    }

    if (!additionupgrade7unlocked) return;

    if (Y_Sequence.cmp(additionupgradecost7, currentOrdinal) <= 0) {
        currentOrdinal = "";
        additionamount = addY(additionamount, mulYtoNumber(monictify(additionamount), 2));
        additionupgradecost7 = maximizeordinal(additionupgradecost7 + ",2", currentBase);
        additionlevel += (currentBase**2) * 2;
        displayFull();
    }
}

function purchase_addition_power_upgrade8() {
    if (Y_Sequence.cmp("1,2,3,2,3", currentOrdinal) <= 0 && !additionupgrade8unlocked){
        additionupgrade8unlocked = true;
        currentOrdinal = "";
        displayFull();
        return;
    }

    if (!additionupgrade8unlocked) return;

    if (Y_Sequence.cmp(additionupgradecost8, currentOrdinal) <= 0) {
        currentOrdinal = "";
        additionamount = mulYtoNumber(additionamount, 2);
        additionupgradecost8 = maximizeordinal(additionupgradecost8 + ",2", currentBase-1);
        additionlevel += (currentBase**2) * 3;
        displayFull();
    }
}

function purchase_addition_power_upgrade9() {
    if (Y_Sequence.cmp("1,2,3,2,3,2,3", currentOrdinal) <= 0 && !additionupgrade9unlocked){
        additionupgrade9unlocked = true;
        currentOrdinal = "";
        displayFull();
        return;
    }

    if (!additionupgrade9unlocked) return;

    if (Y_Sequence.cmp(additionupgradecost9, currentOrdinal) <= 0) {
        currentOrdinal = "";
        additionamount = mulYtoNumber(additionamount, 3);
        additionupgradecost9 = maximizeordinal(additionupgradecost9 + ",2", currentBase-1);
        additionlevel += (currentBase**3);
        displayFull();
    }
}

function purchase_addition_power_upgrade10() {
    if (Y_Sequence.cmp("1,2,3,3", currentOrdinal) <= 0 && !additionupgrade10unlocked){
        additionupgrade10unlocked = true;
        currentOrdinal = "";
        displayFull();
        return;
    }

    if (!additionupgrade10unlocked) return;

    if (Y_Sequence.cmp(additionupgradecost10, currentOrdinal) <= 0) {
        currentOrdinal = "";
        additionamount = extractsumterms(additionamount).map(x => (Y_Sequence.cmp(x,"") > 0)? x+",2" : "1").join(',');
        additionupgradecost10 = maximizeordinal(additionupgradecost10 + ",2", currentBase-1);
        additionlevel += (currentBase**4);
        displayFull();
    }
}

function maximizeaddition() {
    additionamount = maximizeordinal(additionamount, currentBase);
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
            localStorage.setItem("y_sequence_incremental_save", JSON.stringify(parsed));
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
        addition_autoclicker_level,
        maximize_autoclicker_level,
        successor_autoclicker_enabled,
        addition_autoclicker_enabled,
        maximize_autoclicker_enabled,
        successor_autoclicker_cost,
        addition_autoclicker_cost,
        maximize_autoclicker_cost,
        additionamount,
        additionlevel,
        additionupgradecost,
        additionupgradecostaddition,
        additionupgradecost2,
        additionupgradecostaddition2,
        additionupgradecost3,
        additionupgradecostaddition3,
        additionupgradecost4,
        additionupgrade5unlocked,
        additionupgradecost5,
        additionupgrade6unlocked,
        additionupgradecost6,
        additionupgrade7unlocked,
        additionupgradecost7,
        additionupgrade8unlocked,
        additionupgradecost8,
        additionupgrade9unlocked,
        additionupgradecost9,
        additionupgrade10unlocked,
        additionupgradecost10
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
            if (data.addition_autoclicker_level !== undefined) addition_autoclicker_level = data.addition_autoclicker_level;
            if (data.maximize_autoclicker_level !== undefined) maximize_autoclicker_level = data.maximize_autoclicker_level;

            if (data.successor_autoclicker_enabled !== undefined) successor_autoclicker_enabled = data.successor_autoclicker_enabled;
            if (data.addition_autoclicker_enabled !== undefined) addition_autoclicker_enabled = data.addition_autoclicker_enabled;
            if (data.maximize_autoclicker_enabled !== undefined) maximize_autoclicker_enabled = data.maximize_autoclicker_enabled;

            if (data.successor_autoclicker_cost !== undefined) successor_autoclicker_cost = data.successor_autoclicker_cost;
            if (data.addition_autoclicker_cost !== undefined) addition_autoclicker_cost = data.addition_autoclicker_cost;
            if (data.maximize_autoclicker_cost !== undefined) maximize_autoclicker_cost = data.maximize_autoclicker_cost;

            if (data.additionamount !== undefined) additionamount = data.additionamount;
            if (data.additionlevel !== undefined) additionlevel = data.additionlevel;
            if (data.additionupgradecost !== undefined) additionupgradecost = data.additionupgradecost;
            if (data.additionupgradecostaddition !== undefined) additionupgradecostaddition = data.additionupgradecostaddition;
            if (data.additionupgradecost2 !== undefined) additionupgradecost2 = data.additionupgradecost2;
            if (data.additionupgradecostaddition2 !== undefined) additionupgradecostaddition2 = data.additionupgradecostaddition2;
            if (data.additionupgradecost3 !== undefined) additionupgradecost3 = data.additionupgradecost3;
            if (data.additionupgradecostaddition3 !== undefined) additionupgradecostaddition3 = data.additionupgradecostaddition3;
            if (data.additionupgradecost4 !== undefined) additionupgradecost4 = data.additionupgradecost4;
            if (data.additionupgrade5unlocked !== undefined) additionupgrade5unlocked = data.additionupgrade5unlocked;
            if (data.additionupgradecost5 !== undefined) additionupgradecost5 = data.additionupgradecost5;
            if (data.additionupgrade6unlocked !== undefined) additionupgrade6unlocked = data.additionupgrade6unlocked;
            if (data.additionupgradecost6 !== undefined) additionupgradecost6 = data.additionupgradecost6;
            if (data.additionupgrade7unlocked !== undefined) additionupgrade7unlocked = data.additionupgrade7unlocked;
            if (data.additionupgradecost7 !== undefined) additionupgradecost7 = data.additionupgradecost7;
            if (data.additionupgrade8unlocked !== undefined) additionupgrade8unlocked = data.additionupgrade8unlocked;
            if (data.additionupgradecost8 !== undefined) additionupgradecost8 = data.additionupgradecost8;
            if (data.additionupgrade9unlocked !== undefined) additionupgrade9unlocked = data.additionupgrade9unlocked;
            if (data.additionupgradecost9 !== undefined) additionupgradecost9 = data.additionupgradecost9;
            if (data.additionupgrade10unlocked !== undefined) additionupgrade10unlocked = data.additionupgrade10unlocked;
            if (data.additionupgradecost10 !== undefined) additionupgradecost10 = data.additionupgradecost10;

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

    currentOrdinal = typeof Y_Sequence !== "undefined" ? Y_Sequence.ZERO : "";
    currentBase = 10;
    pathmaxlength = 100;
    factor_shift_level = 0;
    automation_unlocked = false;

    successor_autoclicker_level = 0;
    addition_autoclicker_level = 0;
    maximize_autoclicker_level = 0;

    successor_autoclicker_enabled = true;
    addition_autoclicker_enabled = true;
    maximize_autoclicker_enabled = true;

    successor_autoclicker_cost = "1,2,3,2";
    addition_autoclicker_cost = "1,2,3,2";
    maximize_autoclicker_cost = "1,2,3,2";

    additionamount = "1";
    additionlevel = 0;
    additionupgradecost = "1,2";
    additionupgradecostaddition = "1,2";
    additionupgradecost2 = "1,2,2";
    additionupgradecostaddition2 = "1,2,1,2";
    additionupgradecost3 = "1,2,3";
    additionupgradecostaddition3 = "1,2,2";
    additionupgradecost4 = "1,2,3,2";

    additionupgrade5unlocked = false;
    additionupgradecost5 = "1,2,3,2,2";

    additionupgrade6unlocked = false;
    additionupgradecost6 = "1,2,3,2,2,2";

    additionupgrade7unlocked = false;
    additionupgradecost7 = "1,2,3,2,2,2,2";

    additionupgrade8unlocked = false;
    additionupgradecost8 = "1,2,3,2,3";

    additionupgrade9unlocked = false;
    additionupgradecost9 = "1,2,3,2,3,2,3";

    additionupgrade10unlocked = false;
    additionupgradecost10 = "1,2,3,3";

    showTab('ordinal-tab');
    displayFull();
}

//////////////////////////// GAME LOOPS & ACCELERATORS //////////////////////////////////////////

let successorAcc = 0;
let additionAcc = 0;
let maximizeAcc = 0;

let lastTime = performance.now();
let frameCount = 0;
let lastFpsTime = performance.now();

function gameLoop(currentTime) {
    let dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Autoclicker executions
    if (automation_unlocked) {
        if (successor_autoclicker_enabled && successor_autoclicker_level > 0) {
            successorAcc += successor_autoclicker_level * dt;
            let clicks = Math.floor(successorAcc);
            if (clicks > 0) {
                successorAcc -= clicks;
                for (let i = 0; i < clicks; i++) {
                    applySuccessor(false);
                }
            }
        }

        if (addition_autoclicker_enabled && addition_autoclicker_level > 0) {
            additionAcc += addition_autoclicker_level * dt;
            let clicks = Math.floor(additionAcc);
            if (clicks > 0) {
                additionAcc -= clicks;
                for (let i = 0; i < clicks; i++) {
                    applyAddition(false);
                }
            }
        }

        if (maximize_autoclicker_enabled && maximize_autoclicker_level > 0) {
            maximizeAcc += maximize_autoclicker_level * dt;
            let clicks = Math.floor(maximizeAcc);
            if (clicks > 0) {
                maximizeAcc -= clicks;
                for (let i = 0; i < clicks; i++) {
                    applyMaximize(false);
                }
            }
        }
    }

    updateDynamicUI();

    // FPS Counter
    frameCount++;
    if (currentTime - lastFpsTime >= 1000) {
        if (fpsdisplay) fpsdisplay.textContent = frameCount;
        frameCount = 0;
        lastFpsTime = currentTime;
    }

    requestAnimationFrame(gameLoop);
}

// Autosave loop (every 5 seconds)
setInterval(saveGame, 5000);

// Keydown Shortcuts
document.addEventListener("keydown", (event) => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

    const key = event.key.toLowerCase();
    if (key === "s") applySuccessor(true);
    if (key === "a" && additionlevel >= 1) applyAddition(true);
    if (key === "m") applyMaximize(true);
});

// Initialize Game
window.onload = function () {
    loadGame();
    displayFull();
    requestAnimationFrame(gameLoop);
};