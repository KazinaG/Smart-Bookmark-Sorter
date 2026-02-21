initializeEventDrivenObserver().catch((error) => {
	console.error('initializeEventDrivenObserver failed', error);
});

chrome.runtime.onInstalled.addListener(function () {
	pusher(typeAggregate);
});

chrome.runtime.onStartup.addListener(function () {
	initializeEventDrivenObserver().catch((error) => {
		console.error('onStartup initialize failed', error);
	});
});

chrome.action.onClicked.addListener(function () {
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

// TODO configUtil.jsに移して問題ないか確認する。　理由：階層感が他と違うため。
function pusher(params) {
	if (params === typeAggregate) {
		requestAggregateProcessing();
	}
}
