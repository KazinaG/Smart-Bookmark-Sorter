// ブックマークを移動した際に、ブックマーク移動確認→ソート（ブックマーク移動）→ブックマーク移動確認→…の無限ループが発生するため、それの抑止
let bookmarkMoveWaitCount = 0;
let sleepSec = 5;

chrome.runtime.onInstalled.addListener(function () {
	observer();
	// initialize();
});
chrome.browserAction.onClicked.addListener(function () {
	initialize();
});

const observer = function () {
	sleep(sleepSec);
};

const wait = (sec) => {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, sec * 1000);
		//setTimeout(() => {reject(new Error("エラー！"))}, sec*1000);
	});
};
async function sleep(sec) {
	try {
		while (true) {
			await wait(sec); // ここで?秒間止まります

			// ここに目的の処理を書きます。
			const date = new Date();
			const min = date.getMinutes();
			const seco = date.getSeconds();
			console.log(min + ':' + seco + '監視中…');
			//console.log(new Date() + "監視中…");
		}
	} catch (err) {
		console.error(err);
	}
}

function initialize() {
	chrome.bookmarks.getTree(function (rootList) {
		let node = setViewsToAllNode(getBookmarks(rootList));
		node = sortIndexToAllNode(node);
		node = setLocalStorageAndSortAllBookmarks(node);
	});
};

function getTree() {
	let rootList2;
	chrome.bookmarks.getTree(function (rootList) {
		rootList2 = rootList;
	});
	return rootList2;
};

function getBookmarks(rootList) {
	// ルートオブジェクトの取得
	let root_defaultBookmark = rootList[0];
	// ルートオブジェクトから最上位のデフォルトのブックマークフォルダの配列の取得
	let defaultBookmarkList = root_defaultBookmark['children'];
	// 「ブックマークバー」の取得 0:ブックマークバー 1:その他ブックマーク 2:モバイルブックマーク
	let bookmarkBarNode = defaultBookmarkList[0];
	return bookmarkBarNode;
};

function setViewsToAllNode(node) {
	if (node.children) {
		node = setViews(node);
		let childrenNode = node.children;
		for (let i in childrenNode) { childrenNode[i] = setViewsToAllNode(childrenNode[i]); };
		node.children = childrenNode;
	} else if (node.url) { node = setViews(node); };
	return node;
};

function setViews(node) {
	node['views'] = 0;
	return node;
};

function sortIndexToAllNode(node) {
	if (node.children) {
		let childrenNode = node.children;
		childrenNode = sortIndex(childrenNode);
		for (let i in childrenNode) { childrenNode[i] = sortIndexToAllNode(childrenNode[i]); };
		node.children = childrenNode;
	} else if (node.url) { };
	return node;
};

function sortIndex(node) {
	// sort
	node.sort((a, b) => {
		// is folder(asc)
		{
			let aIsFolder = 0; // a is folder = 0, a is not folder = 1.
			if (a.url) { aIsFolder = 1; };
			let bIsFolder = 0; // b is folder = 0, a is not folder = 1.
			if (b.url) { bIsFolder = 1; };
			if (aIsFolder < bIsFolder) return -1;
			if (aIsFolder > bIsFolder) return 1;
		}
		// views(desc)
		{
			if (a.views > b.views) return -1;
			if (a.views < b.views) return 1;
		}
		// title(asc)
		{
			if (a.title.toUpperCase() < b.title.toUpperCase()) return -1;
			if (a.title.toUpperCase() > b.title.toUpperCase()) return 1;
		}
		// url(asc)
		{
			if (a.url < b.url) return -1;
			if (a.url > b.url) return 1;
		}
		// id(asc)
		{
			if (a.id < b.id) return -1;
			if (a.id > b.id) return 1;
		}
		return 0;
	});
	// 順番通りにindexをソートする
	for (var i in node) {
		node[i]['index'] = Number(i);
	};
	return node;
};

const setLocalStorageAndSortAllBookmarks = function (node) {
	setLocalStorage(node);
	console.log("start all bookmarks.")
	sortAllBookmarks(node);
	console.log("finish sort all bookmarks.")

	return node;
};

function setLocalStorage(value) {
	chrome.storage.local.set({ key: value }, function () {
		console.log("setLocalStorage");
	});
};

function sortAllBookmarks(node) {
	let nodeId = node.id;
	if (!(nodeId == 1 || nodeId == 2 || nodeId == 3)) { sortBookmark(node); }
	if (node.children) {
		let childrenNode = node.children;
		for (let i in childrenNode) {
			childrenNode[i] = sortAllBookmarks(childrenNode[i]);
		};
		node.children = childrenNode;
	};
	return node;
};

function sortBookmark(node) {
	let id = node['id'];
	let destination = { parentId: node['parentId'], index: node['index'] };
	if (destination.parentId != undefined && destination.parentId != undefined) {
		bookmarkMoveWaitCount = bookmarkMoveWaitCount + 1;
		moveBookmarks(id, destination);
	};
};

function moveBookmarks(id, destination) {
	chrome.bookmarks.move(id, destination, function () {
		bookmarkMoveWaitCount = bookmarkMoveWaitCount - 1;
	});
};
