// ブックマークを移動した際に、ブックマーク移動確認→ソート（ブックマーク移動）→ブックマーク移動確認→…の無限ループが発生するため、それの抑止
let bookmarkMoveWaitCount = 0;
let sleepSec = 1;
let processList = [];
let isProcessing = false;
let node;
//#region processType
const typeInitialize = 'initialize';
const typeOnCreated = 'onCreated';
//#endregion processType

//#region API
chrome.runtime.onInstalled.addListener(function () {
	// initialize();
	loop(sleepSec);
});
chrome.browserAction.onClicked.addListener(function () {
	processList.push([typeInitialize]);
});

chrome.bookmarks.onCreated.addListener(function (id, bookmark) {
	processList.push([typeOnCreated, id, bookmark]);
});

//#endregion API

//#region Observer
// TODO 次はここのテスト（タイムアウトが同期処理になっていることをチェック。）
async function loop(sec) {
	try {
		while (true) {
			await Promise.resolve()
				.then(
					wait(sec) // ここで?秒間止まります
				).then(
					// ここに目的の処理を書きます。
					observer()
				)
		}
	} catch (err) {
		console.error(err);
	}
};

const wait = (sec) => {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, sec * 1000);
		//setTimeout(() => {reject(new Error("エラー！"))}, sec*1000);
	});
};

function observer() {
	return new Promise((resolve, reject) => {
		if (!isProcessing && (processList.length > 0)) {
			isProcessing = true;

			// getLocalStorage();

			// while (processList.length > 0) {
			// 	console.log('判定開始');
			// 	classifier(processList.shift());
			// 	console.log('判定終了');
			// }

			// replaceLocalStorage();

			return getLocalStorage()
				.then(() => {
					while (processList.length > 0) {
						console.log('判定開始');
						classifier(processList.shift());
						console.log('判定終了');
					}
					resolve();
				})
				.then(replaceLocalStorage);
		}
		else if (isProcessing) {

			getLocalStorage();

			// ブックマークの整理処理 TODO リファクタリング
			console.log('ブックマークの整理開始');
			sortBookmarks();
			isProcessing = false;
			console.log('ブックマークの整理終了');

			replaceLocalStorage();
		} else {
			console.log('イベントなし。');
		}
		resolve();
	});
};

function classifier(param) {
	return new Promise((resolve, reject) => {
		switch (param[0]) {
			case typeInitialize:
				return initialize()
					.then(() => {
						console.log('initialize実行終了2');
						resolve();
					});
				break;
			case typeOnCreated:
				insertDbByCreatedBookmark(param[2]);
				break;

			default:
		}
		resolve();
	});
};

//#endregion Observer


//#region Sort bookmark
// TODO function名が、sortbookmarksとsortbookmarkでややこしい
function sortBookmarks() {
	return new Promise((resolve, reject) => {
		node = sortIndexToAllNode(node);

		sortAllBookmarks(node);
		resolve();
	});
};

function replaceLocalStorage() {
	// return new Promise(async (resolve, reject) => {
	// 	await clearLocalStorage();
	// 	await setLocalStorage();
	// 	resolve();
	// });
	// Promise.resolve()
	// 	.then(clearLocalStorage)
	// 	.then(setLocalStorage);

	clearLocalStorage().then(setLocalStorage);
};

function clearLocalStorage() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.clear(() => {
			console.log('clear local storage.');
			resolve();
		});
	});
};

function setLocalStorage() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.set({ key: node }, () => {
			console.log('set local storage.');
			resolve();
		});
	});
};

function getLocalStorage() {
	return new Promise((resolve, reject) => {
		try {
			chrome.storage.local.get(key, (value) => {
				node = value[key];
				resolve();
			});
		}
		catch {
			console.log('local storage is empty.');
			resolve();
		}
	});
}

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
	chrome.bookmarks.move(id, destination, () => {
		bookmarkMoveWaitCount = bookmarkMoveWaitCount - 1;
	});
};
//#endregion Sort bookmark


//#region Executes
function initialize() {
	console.log('initialize実行開始');
	return new Promise((resolve, reject) => {
		chrome.bookmarks.getTree((rootList) => {
			node = getBookmarks(rootList);
			node = setViewsToAllNode(node);
			console.log('initialize実行終了');
			resolve();
		});
	});
};

function insertDbByCreatedBookmark(bookmark) {
	bookmark = setViews(bookmark);
	if (bookmark.url) { }
	else { bookmark = setChildren(bookmark); }
	node = insertNewNodeToAllNode(node, bookmark);
};

function setChildren(bookmark) {
	bookmark['children'] = [];
	return bookmark;
};

function insertNewNode(node, insertNode) {
	let parentNodeId = node.id;
	let nodeContents = node.children;
	if (parentNodeId == insertNode.parentId) {
		nodeContents[nodeContents.length] = insertNode;
		node.children = nodeContents;
	};
	return node;
};

function insertNewNodeToAllNode(node, insertNode) {
	if (node.children) {
		node = insertNewNode(node, insertNode);
		let childrenNode = node.children;
		for (let i in childrenNode) {
			childrenNode[i] = insertNewNodeToAllNode(childrenNode[i], insertNode);
		};
		node.children = childrenNode;
	} else if (node.url) { };
	return node;
};
//#endregion Executes

//#region Processes
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
