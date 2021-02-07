
//#region 
let term = 24;
let term_none = 0;
let term_short = 24; // 1 day
let term_middle = 168; // 1 week
let term_long = 720; // about 1 month
//#endregion

//#region 
let decreasePercentage = 0.9;
let decreasePercentage_none = 1;
let decreasePercentage_low = 0.9;
let decreasePercentage_middle = 0.5;
let decreasePercentage_high = 0.1;
//#endregion

const termSelections = [term_none, term_short, term_middle, term_long];

const decreasePercentageSelections = [decreasePercentage_none, decreasePercentage_low, decreasePercentage_middle, decreasePercentage_high];

function save_options() {
    let term = document.getElementById('term').value;
    let decreasePercentage = document.getElementById('decreasePercentage').value;

    chrome.runtime.sendMessage({
        message: "saveOptions",
        term: term,
        decreasePercentage: decreasePercentage
    }, function (response) {
    });
}

async function restore_options() {
    let term = 1;
    let decreasePercentage = 1;
    let configuration = await getConfigurationFromBackgroudPage();
    term = termSelections.indexOf(parseInt(configuration.term));
    decreasePercentage = decreasePercentageSelections.indexOf(parseFloat(configuration.decreasePercentage));

    document.getElementById("term").selectedIndex = term;
    document.getElementById("decreasePercentage").selectedIndex = decreasePercentage;
}

function getConfigurationFromBackgroudPage() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            message: "getConfiguration"
        }, function (response) {
            resolve(response);
        });
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);