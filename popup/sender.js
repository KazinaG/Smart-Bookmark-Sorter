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
    let configuration = await getConfigurationFromBackgroundPage();
    term = termSelections.indexOf(parseInt(configuration.term));
    decreasePercentage = decreasePercentageSelections.indexOf(parseFloat(configuration.decreasePercentage));
    document.getElementById("term").selectedIndex = term;
    document.getElementById("decreasePercentage").selectedIndex = decreasePercentage;
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