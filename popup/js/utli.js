function changeDisabled() {
    if (parseInt(term.value) == termSelections[0].value) {
        decreasePercentage.disabled = true;
    }
    else {
        decreasePercentage.disabled = false;
    }
}