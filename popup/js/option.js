document.addEventListener('DOMContentLoaded', initialize);
document.getElementById('term').addEventListener('change', save_options);
document.getElementById('decreasePercentage').addEventListener('change', save_options);

$(function () {
    $('#list01').sortable();
});