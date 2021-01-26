// ブックマークを移動した際に、ブックマーク移動確認→ソート（ブックマーク移動）→ブックマーク移動確認→…の無限ループが発生するため、それの抑止


//#region API
chrome.runtime.onInstalled.addListener(function () {
	processList.push([typeInitialize]);
	loop();
});
chrome.browserAction.onClicked.addListener(function () {
	processList.push([typeInitialize]);
});

chrome.bookmarks.onCreated.addListener(function (id, bookmark) {
	processList.push([typeOnCreated, id, bookmark]);
});

//#endregion API

