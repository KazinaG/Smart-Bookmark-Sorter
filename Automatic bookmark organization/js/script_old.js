// 定数・変数宣言
const promise = Promise.resolve();


//#region API
function getTree() {
	return new Promise(function (resolve, reject) {
		chrome.bookmarks.getTree(function (rootList) {
			console.log("getTree");
			resolve(rootList);
		});
	});
};
function setLocalStorage(value) {
	chrome.storage.local.set({ key: value }, function () {
		console.log("setLocalStorage");
	});
};
function moveBookmarks(id, destination) {
	return new Promise(function (resolve, reject) {
		chrome.bookmarks.move(id, destination, function () {
			bookmarkMoveWaitCount = bookmarkMoveWaitCount - 1;
			resolve();
		});
	});
};
//#region API: Trigger
chrome.runtime.onInstalled.addListener(function () {
	initialize();
});
chrome.browserAction.onClicked.addListener(function () {
	initialize();
});
//#region API: Trigger: Bookmarks
chrome.bookmarks.onCreated.addListener(function (id, bookmark) {
	insertDbByCreatedBookmark(bookmark);
});
chrome.bookmarks.onRemoved.addListener(function (id, removeInfo) {
	removeDbRemovedBookmark(removeInfo);
});
chrome.bookmarks.onMoved.addListener(function (id, moveInfo) {
	if (bookmarkMoveWaitCount == 0) {
		let bookmarkId = id;
		let beforeParentId = moveInfo.oldParentId;
		let afterParentId = moveInfo.parentId;
		chrome.storage.local.get(key, function (value) {
			let node = value[key];
			node = updateDbByMovedBookmark(node, bookmarkId, beforeParentId, afterParentId);
			let nodeAndViews = folderViewsSumByBookmarkViews(node);
			node = nodeAndViews.node;
			node = sortIndexToAllNode(node);
			replaceLocalStorage(node);
			sortAllBookmarks(node);
		});
	}
	else {
	}
});
chrome.bookmarks.onChanged.addListener(function (bookmarkId, changeInfo) {
	let title = changeInfo.title;
	let url = changeInfo.url;
	chrome.storage.local.get(key, function (value) {
		let node = value[key];
		node = updateDbByChangedBookmark(node, bookmarkId, changeInfo);
		let nodeAndViews = folderViewsSumByBookmarkViews(node);
		node = nodeAndViews.node;
		node = sortIndexToAllNode(node);
		replaceLocalStorage(node);
		sortAllBookmarks(node);
	});
});
//#endregion API: Trigger: Bookmarks
//#region API: Trigger: tabs
chrome.tabs.onCreated.addListener(function (tab) {
	// TODO test
	let request = {};
	let reference = {};
	request.function = dbViewsCountUpByUrl;
	reference.url = returnUrlFromTab(tab);
	request.reference = reference;
	setNodeQueue(request);
	setSortQueue();
});
//#endregion API: Trigger: tabs
//#endregion API: Trigger
//#endregion API
//#region Function
//#region Function: Trigger Function
function initialize() {
	// TODO logを吐く順番がおかしいのをなんとかする
	promise
		.then(promiseConsoleLog("start initialization."))
		.then(getTree)
		.then(getBookmarks)
		.then(promiseSetViewsToAllNode)
		.then(promiseSortIndexToAllNode)
		.then(promiseSetLocalStorageAndSortAllBookmarks)
		.then(promiseConsoleLog("finish initialization."));
};
function insertDbByCreatedBookmark(bookmark) {
	bookmark = setViews(bookmark);
	if (bookmark.url) { }
	else { bookmark = setChildren(bookmark); }
	chrome.storage.local.get(key, function (value) {
		let node = value[key];
		node = insertNewNodeToAllNode(node, bookmark);
		node = sortIndexToAllNode(node);
		replaceLocalStorage(node);
		sortAllBookmarks(node);
	});
};
function removeDbRemovedBookmark(removeInfo) {
	chrome.storage.local.get(key, function (value) {
		let node = value[key];
		node = removeNodeToAllNode(node, removeInfo);
		node = sortIndexToAllNode(node);
		replaceLocalStorage(node);
		sortAllBookmarks(node);
	});
};
//#endregion Function:Trigger Function
//#region Function: Created Function
const promiseConsoleLog = function (request) {
	return new Promise(function (resolve, reject) {
		console.log(request);
		resolve();
	});
};
function getBookmarks(rootList) {
	return new Promise(function (resolve, reject) {
		// ルートオブジェクトの取得
		let root_defaultBookmark = rootList[0];
		// ルートオブジェクトから最上位のデフォルトのブックマークフォルダの配列の取得
		let defaultBookmarkList = root_defaultBookmark['children'];
		// 「ブックマークバー」の取得 0:ブックマークバー 1:その他ブックマーク 2:モバイルブックマーク
		let bookmarkBarNode = defaultBookmarkList[0];
		console.log("getBookmarks");
		resolve(bookmarkBarNode);
	});
};
const promiseSetLocalStorageAndSortAllBookmarks = function (node) {
	return new Promise(function (resolve, reject) {
		setLocalStorage(node);
		console.log("start all bookmarks.")
		sortAllBookmarks(node);
		console.log("finish sort all bookmarks.")
		resolve(node);
	});
};
const replaceLocalStorage = function (toChangeItem) {
	chrome.storage.local.clear(function () {
		setLocalStorage(toChangeItem);
	});
};
const folderViewsSumByBookmarkViews = function (node) {
	let nodeAndViews = {
		node: node,
		views: 0
	};
	if (node.children) {
		let childrenNode = node.children;
		let folderViews = 0;
		for (let i in childrenNode) {
			nodeAndViews = folderViewsSumByBookmarkViews(childrenNode[i]);
			childrenNode[i] = nodeAndViews.node;
			folderViews = folderViews + nodeAndViews.views;
		};
		node.children = childrenNode;
		node.views = folderViews;
	}
	nodeAndViews.views = node.views;
	nodeAndViews.node = node;
	return nodeAndViews;
};
const returnUrlFromTab = function (tab) {
	if (tab.url == "" || tab.url == null || tab.url == undefined) {
		url = tab.pendingUrl;
	} else {
		url = tab.url;
	};
	return url;
};
const database = function (request) {
	let response = {};

	if (request.type == 'delete') {
		let node = request.reference.node;
		let parentId = request.reference.parentId;
		if (node.id == parentId) {
			let childResponse = deleteDatabase(request);
			node = childResponse.node;
		} else if (node.children) {
			for (let i in node.children) {
				request.reference.node = node.children[i];
				let childResponse = database(request);
				node.children[i] = childResponse.node;
			};
		};
		response['node'] = node;
	}
	else if (request.type == 'insert') {
		let node = request.reference.node;
		let parentId = request.reference.parentId;
		if (node.id == parentId) {
			let childResponse = insertDatabase(request);
			node = childResponse.node;
		} else if (node.children) {
			for (let i in node.children) {
				request.reference.node = node.children[i];
				let childResponse = database(request);
				node.children[i] = childResponse.node;
			};
		};
		response['node'] = node;
	}
	else if (request.type == 'update') {
		let node = request.reference.node;
		let bookmarkId = request.reference.bookmarkId;
		if (node.id == bookmarkId) {
			let childResponse = updateDatabase(request);
			node = childResponse.node;
		} else if (node.children) {
			for (let i in node.children) {
				request.reference.node = node.children[i];
				let childResponse = database(request);
				node.children[i] = childResponse.node;
			};
		};
		response['node'] = node;
	}
	return response;
};
//#region Function: Created Function: Sort Bookmakrs
function sortBookmark(node) {
	let id = node['id'];
	let destination = { parentId: node['parentId'], index: node['index'] };
	if (destination.parentId != undefined && destination.parentId != undefined) {
		bookmarkMoveWaitCount = bookmarkMoveWaitCount + 1;
		promise
			.then(moveBookmarks(id, destination))
			.then(console.log("move bookmark. id:" + id + ", destination(parentId, index):" + destination.parentId + "," + destination.index));
	};
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
//#endregion Function: Created Function: Sort Bookmakrs
//#region Function: Created Function: Edit Node
//#region Function: Created Function: Edit Node: Insert New Node
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
//#endregion Function: Created Function: Edit Node: Insert New Node
//#region Function: Created Function: Edit Node: Remove Node
const removeNode = function (node, removeNodeId) {
	let nodeContents = node.children;
	for (let i in nodeContents) {
		if (nodeContents[i].id == removeNodeId) {
			nodeContents.splice(i, 1);
			node.children = nodeContents;
		};
	};
	return node;
};
const removeNodeToAllNode = function (node, removeInfo) {
	if (node.children) {
		node = removeNode(node, removeInfo.node.id);
		let childrenNode = node.children;
		for (let i in childrenNode) {
			childrenNode[i] = removeNodeToAllNode(childrenNode[i], removeInfo);
		};
		node.children = childrenNode;
	} else if (node.url) { };
	return node;
};
//#endregion Function: Created Function: Edit Node: Remove Node
//#region Function: Created Function: Edit Node: Update Node
const updateDbByMovedBookmark = function (node, bookmarkId, beforeParentId, afterParentId) {
	// remove->createの順で使えば良い(bookmarkIdを元に)。更に、delete時にviewsを保持し、createする際にviewsを追加で入れてやれば、完璧。
	let bookmarkInfo;
	// Delete from Database by bookmarkId and get views.
	// get bookmark info what bookmark id.
	let nodeAndBookmarkInfo = returnBookmarkInfoFromDbWhereBookmarkId(node, bookmarkId);
	bookmarkInfo = nodeAndBookmarkInfo.bookmarkInfo;
	bookmarkInfo.parentId = afterParentId;
	// Delete from Database by bookmarkId
	{
		let request = {};
		let reference = {};
		request['type'] = 'delete';
		reference['node'] = node;
		reference['bookmarkId'] = bookmarkId;
		reference['parentId'] = beforeParentId;
		request['reference'] = reference;
		let response = database(request);
		node = response.node;
	};
	{
		let request = {};
		let reference = {};
		request['type'] = 'insert';
		reference['node'] = node;
		reference['bookmarkInfo'] = bookmarkInfo;
		reference['parentId'] = afterParentId;
		request['reference'] = reference;
		let response = database(request);
		node = response.node;
	};
	return node;
};
const updateDbByChangedBookmark = function (node, bookmarkId, changeInfo) {
	let title = changeInfo.title;
	let url = changeInfo.url;
	{
		let request = {};
		let reference = {};
		request['type'] = 'update';
		reference['node'] = node;
		reference['bookmarkId'] = bookmarkId;
		reference['changeInfo'] = changeInfo;
		request['reference'] = reference;
		let response = database(request);
		node = response.node;
	};
	return node;
};
//#endregion Function: Created Function: Edit Node: Update Node
//#region Function: Created Function: Edit Node: Set Views
function setViews(node) {
	node['views'] = 0;
	return node;
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
function promiseSetViewsToAllNode(node) {
	return new Promise(function (resolve, reject) {
		setViewsToAllNode(node);
		console.log("setViewsToAllNode");
		resolve(node);
	});
};
//#endregion Function: Created Function: Edit Node: Set Views
//#region Function: Created Function: Edit Node: Sort Index
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
function sortIndexToAllNode(node) {
	if (node.children) {
		let childrenNode = node.children;
		childrenNode = sortIndex(childrenNode);
		for (let i in childrenNode) { childrenNode[i] = sortIndexToAllNode(childrenNode[i]); };
		node.children = childrenNode;
	} else if (node.url) { };
	return node;
};
function promiseSortIndexToAllNode(node) {
	return new Promise(function (resolve, reject) {
		sortIndexToAllNode(node);
		console.log("sortIndexToAllNode");
		resolve(node);
	});
};
//#endregion Function: Created Function: Edit Node: Sort Index
//#endregion Function: Created Function: Edit Node
//#endregion Function: Created Function
//#endregion Function

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ↑リファクタリング後
// ↓リファクタリング前
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------



// 定数・変数宣言
const key = "key";
const doNothing = 'doNothing';
const noUrl = 'noUrl';
const noBookmark = 'noBookmark';
const noId = 'noId';

// ブックマークを移動した際に、ブックマーク移動確認→ソート（ブックマーク移動）→ブックマーク移動確認→…の無限ループが発生するため、それの抑止
let bookmarkMoveWaitCount = 0;

// TODO リファクタリング。汚いのでオブジェクト指向化する。→どうやって？→1.最小の機能を関数化, 2.複数の関数を理に沿って更に関数化
// TODO Githubでソース管理をする。

// get localをするのをここでまとめる。
// run node queue
let runningNodeQueueFlag = false;
let nodeQueue = [];
const runNodeQueue = function () {
	// if (!runningNodeQueueFlag) {
	// 	runningNodeQueueFlag = true;
	// 	while (true) {
	// 		if (nodeQueue.length != 0) {
	// 			request = nodeQueue.shift();
	// 			let callback = request.function;
	// 			let reference = request.reference;
	// 			callback(reference);
	// 		}
	// 		else {
	// 			break;
	// 		};
	// 	};
	// 	runningNodeQueueFlag = false;
	// };
	// while (true) {
	// 	if (nodeQueue.length != 0) {
	// 		if (!runningNodeQueueFlag) {
	// 			runningNodeQueueFlag = true;
	// 			request = nodeQueue.shift();
	// 			let callback = request.function;
	// 			let reference = request.reference;
	// 			callback(reference);
	// 		} else {
	// 			setTimeout(() => { }, timeout);
	// 		}
	// 	}
	// 	else {
	// 		runningNodeQueueFlag = false;
	// 		break;
	// 	};
	// };
	while (true) {
		if (nodeQueue.length == 0) {
			setTimeout(() => { }, 1000);
		} else {
			request = nodeQueue.shift();
			let callback = request.function;
			let reference = request.reference;
			callback(reference);
		};
	};
};

const setNodeQueue = function (request) {
	nodeQueue.push(request);
};

// TODO sortBookmarkをここでまとめる。
// run sort queue
let runningSortFlag = false;
const runSortQueue = function () {
	while (true) {
		if (runningSortFlag) {
			sortAllBookmarks(node);
			runningSortFlag = false;
		} else {
			setTimeout(() => { }, 1000);
		};
	};
};
const setSortQueue = function () {
	runningSortFlag = true;
};

// Trigger ---------------------------------------------------------------------------------------



// Trigger: bookmarks --------------------------------------------------------------------------




// Trigger: tab ------------------------------------------------------------------------------------


// Function -----------------------------------------------------------------
const dbViewsCountUpByUrl = function (reference) {
	chrome.storage.local.get(key, function (value) {
		let url = reference.url;
		let node = value[key];
		node = searchAndDoBookmarkFunction(node, viewsCountUpByUrl, url);
		let nodeAndViews = folderViewsSumByBookmarkViews(node);
		node = nodeAndViews.node;
		node = sortIndexToAllNode(node);
		replaceLocalStorage(node);
	});
};








const updateDatabase = function (request) {
	let response = {};
	let node = request.reference.node;
	let changeInfo = request.reference.changeInfo;
	if (node.title) { node.title = changeInfo.title; }
	if (node.url) { node.url = changeInfo.url; }
	response.node = node;
	return response;
};

const deleteDatabase = function (request) {
	let response = {};
	let node = request.reference.node;
	let childrenNode = node.children;
	let removedBookmarkId = request.reference.bookmarkId;

	for (let i in childrenNode) {
		if (childrenNode[i].id == removedBookmarkId) {
			childrenNode.splice(i, 1);
		}
	};
	node.children = childrenNode;
	response.node = node;
	return response;
};

const insertDatabase = function (request) {
	let response = {};
	let node = request.reference.node;
	let childrenNode = node.children;
	let bookmarkInfo = request.reference.bookmarkInfo;

	childrenNode.push(bookmarkInfo);

	node.children = childrenNode;
	response.node = node;
	return response;
};

const returnBookmarkInfoFromDbWhereBookmarkId = function (node, bookmarkId) {
	let nodeAndBookmarkInfo = { node: null, bookmarkInfo: null };

	if (node.id == bookmarkId) {
		nodeAndBookmarkInfo.bookmarkInfo = node;
	} else if (node.children) {
		let childrenNode = node.children;
		for (let i in childrenNode) {
			nodeAndBookmarkInfo = returnBookmarkInfoFromDbWhereBookmarkId(childrenNode[i], bookmarkId);
			childrenNode[i] = nodeAndBookmarkInfo.node;
			// nodeAndBookmarkInfoがnull以外の場合はbreak
			if (nodeAndBookmarkInfo.bookmarkInfo != null) {
				break;
			};
		};
		node.children = childrenNode;
	}

	nodeAndBookmarkInfo.node = node;
	return nodeAndBookmarkInfo;
};



const searchAndDoBookmarkFunction = function (node, bookmarkCallback, url, id) {
	searchAndDoSomething(node, doNothing, bookmarkCallback, url, noBookmark, id);
	return node;
};

// TODO 消す
const searchAndDoSomething = function (node, folderCallback = doNothing, bookmarkCallback = doNothing, url = noUrl, bookmark = noBookmark, id = noId) {
	let nodeId = node.id;
	if (node.children) {
		let childrenNode = node.children;
		if (folderCallback != doNothing) {
			childrenNode = folderCallback(childrenNode, nodeId, bookmark, id);
		};
		for (let i in childrenNode) {
			childrenNode[i] = searchAndDoSomething(childrenNode[i], folderCallback, bookmarkCallback, url, bookmark, id);
		};
		node.children = childrenNode;
	}
	else if (node.url) {
		if (bookmarkCallback != doNothing) {
			node = bookmarkCallback(node, url, id);
		}
	};
	return node;
};




// その他のブックマークをrootListから取得する処理
const getOtherBookmarks = function (rootList) {
	let node;
	// ルートオブジェクトの取得
	let root_defaultBookmark = rootList[0];
	// ルートオブジェクトから最上位のデフォルトのブックマークフォルダの配列の取得
	let defaultBookmarkList = root_defaultBookmark['children'];
	// 「その他のブックマーク」の取得 0:ブックマークバー 1:その他ブックマーク 2:モバイルブックマーク
	let otherBookmarks = defaultBookmarkList[1];

	node = otherBookmarks;

	return node;
};





const viewsCountUpByUrl = function (bookmark, url) {
	if (bookmark['url'] == url) {
		let views = bookmark['views'];
		views++;
		bookmark['views'] = views;
	}
	return bookmark;
};




// All Item Function




// Folder Function




const setChildren = function (bookmark) {
	bookmark['children'] = [];
	return bookmark;
};





// Bookmark Function


// Reference function -------------------------------------------------------------
// 1つのブックマーク取得処理
const getOneBookmark = function (rootList) {
	// ルートオブジェクトの取得
	let root_defaultBookmark = rootList[0];
	// ルートオブジェクトから最上位のデフォルトのブックマークフォルダの配列の取得
	let defaultBookmarkList = root_defaultBookmark['children'];
	// 「その他のブックマーク」の取得 0:ブックマークバー 1:その他ブックマーク 2:モバイルブックマーク
	let otherBookmarks = defaultBookmarkList[1];
	// 「その他のブックマーク」の下位のブックマークの配列を取得
	let inOtherBookmarkList = otherBookmarks['children'];
	// 「その他のブックマーク」の下位のブックマークの配列から1つめのオブジェクトを取得
	let realBookmark = inOtherBookmarkList[0];
};