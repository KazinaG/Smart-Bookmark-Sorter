function save_options() {
    term.value = 24;
    decreasePercentage.value = sortLevel.value;

    chrome.runtime.sendMessage({
        message: "saveOptions",
        term: term.value,
        decreasePercentage: decreasePercentage.value,
        sortOrderList: changedSortOrder,
        sortTarget: { isBar: sortTarget.bar.checked, isMobile: sortTarget.mobile.checked, isOther: sortTarget.other.checked }
    }, function (response) {
    });
    changeDisabled();
}