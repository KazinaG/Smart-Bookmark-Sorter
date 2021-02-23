// 監視開始
loop();

toReflectConfig();

chrome.runtime.onInstalled.addListener(function () {
	pusher(typeAggregate);
});

chrome.browserAction.onClicked.addListener(function () {
	pusher(typeAggregate);
});

chrome.bookmarks.onCreated.addListener(function (id, bookmark) {
	pusher(typeAggregate);
});

chrome.bookmarks.onRemoved.addListener(function (id, removeInfo) {
	pusher(typeAggregate);
});

chrome.bookmarks.onChanged.addListener(function (id, changeInfo) {
	pusher(typeAggregate);
});

chrome.bookmarks.onMoved.addListener(function (id, moveInfo) {
	pusher(typeAggregate);
});

chrome.history.onVisited.addListener(function (historyItem) {
	pusher(typeAggregate);
});

chrome.storage.onChanged.addListener(function (changes, areaName) {
	console.log("storage.onChanged:" + changes + ", " + areaName);
});

function pusher(params) {
	if (processList[processList.length - 1] != params) {
		processList.push(params);
	}
}