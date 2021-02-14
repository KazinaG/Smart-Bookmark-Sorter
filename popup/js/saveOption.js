function save_options() {
    chrome.runtime.sendMessage({
        message: "saveOptions",
        term: term.value,
        decreasePercentage: decreasePercentage.value,
        sortOrderList: changedSortOrder
    }, function (response) {
    });
    changeDisabled();
}