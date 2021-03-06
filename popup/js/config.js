// background/constant.jsから値を入れて使うこと。
let termSelections = [];
let decreasePercentageSelections = [];
let sortOrderList = [];
let changedSortOrder = [];

let term = document.getElementById('term');
let decreasePercentage = document.getElementById('decreasePercentage');
let sortList = document.getElementById('sortList');

let sortTarget = { bar: document.getElementById('bookmarksBar'), mobile: document.getElementById('mobileBookmarks'), other: document.getElementById('otherBookmarks') };