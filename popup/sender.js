let term = document.getElementById('term');
let decreasePercentage = document.getElementById('decreasePercentage');

function save_options() {
    chrome.runtime.sendMessage({
        message: "saveOptions",
        term: term.value,
        decreasePercentage: decreasePercentage.value
    }, function (response) {
    });
    changeDisabled();
}

async function restore_options() {
    let configuration = await getConfigurationFromBackgroundPage();
    term.selectedIndex = termSelections.indexOf(parseInt(configuration.term));
    decreasePercentage.selectedIndex = decreasePercentageSelections.indexOf(parseFloat(configuration.decreasePercentage));
    changeDisabled();
}

function getConfigurationFromBackgroundPage() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            message: "getConfiguration"
        }, function (response) {
            resolve(response);
        });
    });
}

function changeDisabled() {
    if (term.value == term_none.toString()) {
        decreasePercentage.disabled = true;
    }
    else {
        decreasePercentage.disabled = false;
    }
}