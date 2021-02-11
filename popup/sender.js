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

async function initialize() {
    for (let i = 0; i < termSelections.length; i++) {
        let option = document.createElement('option');
        option.setAttribute('value', termSelections[i].value);
        option.innerHTML = termSelections[i].display;
        term.appendChild(option);
    }

    for (let i = 0; i < decreasePercentageSelections.length; i++) {
        let option = document.createElement('option');
        option.setAttribute('value', decreasePercentageSelections[i].value);
        option.innerHTML = decreasePercentageSelections[i].display;
        decreasePercentage.appendChild(option);
    }

    await restore_options();
}

async function restore_options() {
    let configuration = await getConfigurationFromBackgroundPage();
    for (let i = 0; i < termSelections.length; i++) {
        if (termSelections[i].value == parseInt(configuration.term)) {
            term.selectedIndex = i;
            break;
        }
    }

    for (let i = 0; i < decreasePercentageSelections.length; i++) {
        if (decreasePercentageSelections[i].value == parseFloat(configuration.decreasePercentage)) {
            decreasePercentage.selectedIndex = i;
            break;
        }
    }

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
    if (parseInt(term.value) == termSelections[0].value) {
        decreasePercentage.disabled = true;
    }
    else {
        decreasePercentage.disabled = false;
    }
}