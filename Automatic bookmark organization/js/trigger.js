// 監視開始
loop();


//#region API
chrome.runtime.onInstalled.addListener(function () {
	processList.push([typeInitialize]);
});
chrome.browserAction.onClicked.addListener(function () {
	processList.push([typeInitialize]);
});

chrome.bookmarks.onCreated.addListener(function (id, bookmark) {
	processList.push([typeOnCreated, id, bookmark]);
});

chrome.bookmarks.onRemoved.addListener(function (id, removeInfo) {
	processList.push([typeOnRemoved, id, removeInfo])
});

chrome.bookmarks.onMoved.addListener(function (id, moveInfo) {
	processList.push([typeOnMoved, id, moveInfo]);
});
//#endregion API

