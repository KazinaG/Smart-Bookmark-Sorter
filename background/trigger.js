// 監視開始
loop();

chrome.runtime.onInstalled.addListener(function () {
	processList.push([typeAggregate]);
});
chrome.browserAction.onClicked.addListener(function () {
	processList.push([typeAggregate]);
});

chrome.bookmarks.onCreated.addListener(function (id, bookmark) {
	processList.push([typeAggregate]);
});

chrome.bookmarks.onRemoved.addListener(function (id, removeInfo) {
	processList.push([typeAggregate]);
});

chrome.bookmarks.onChanged.addListener(function (id, changeInfo) {
	processList.push([typeAggregate]);
});

chrome.bookmarks.onMoved.addListener(function (id, moveInfo) {
	processList.push([typeAggregate]);
});

chrome.history.onVisited.addListener(function (historyItem) {
	processList.push([typeAggregate]);
});