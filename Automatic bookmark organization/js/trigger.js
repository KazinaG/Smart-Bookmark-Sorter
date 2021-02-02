// 監視開始
loop();

chrome.runtime.onInstalled.addListener(function () {
	processList.push([typeInitialize]);
});
chrome.browserAction.onClicked.addListener(function () {
	processList.push([typeInitialize]);
});

chrome.bookmarks.onCreated.addListener(function (id, bookmark) {
	processList.push([typeInitialize]);
});

chrome.bookmarks.onRemoved.addListener(function (id, removeInfo) {
	processList.push([typeInitialize]);
});

chrome.bookmarks.onChanged.addListener(function (id, changeInfo) {
	processList.push([typeInitialize]);
});

chrome.bookmarks.onMoved.addListener(function (id, moveInfo) {
	processList.push([typeInitialize]);
});

chrome.history.onVisited.addListener(function (historyItem) {
	processList.push([typeInitialize]);
});