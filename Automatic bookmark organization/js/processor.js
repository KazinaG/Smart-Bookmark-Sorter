
async function replaceLocalStorage() {
    await clearLocalStorage();
    await setLocalStorage();
};

function clearLocalStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.clear(() => {
            console.log('clear local storage.');
            resolve();
        });
    });
};

function getLocalStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (value) => {
            node = value[key];
            console.log('get local storage.');
            resolve();
        });
    });
}

function setLocalStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ key: node }, () => {
            console.log('set local storage.');
            resolve();
        });
    });
};


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

function insertNewNode(tmpNode, insertNode) {
    let parentNodeId = tmpNode.id;
    let nodeContents = tmpNode.children;
    if (parentNodeId == insertNode.parentId) {
        nodeContents[nodeContents.length] = insertNode;
        tmpNode.children = nodeContents;
    };
    return tmpNode;
};

function insertNewNodeToAllNode(tmpNode, insertNode) {
    if (tmpNode.children) {
        tmpNode = insertNewNode(tmpNode, insertNode);
        let childrenNode = tmpNode.children;
        for (let i in childrenNode) {
            childrenNode[i] = insertNewNodeToAllNode(childrenNode[i], insertNode);
        };
        node.children = childrenNode;
    } else if (tmpNode.url) { };
    return tmpNode;
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

function setViewsToAllNode(tmpNode) {
    if (tmpNode.children) {
        tmpNode = setViews(tmpNode);
        let childrenNode = tmpNode.children;
        for (let i in childrenNode) { childrenNode[i] = setViewsToAllNode(childrenNode[i]); };
        tmpNode.children = childrenNode;
    } else if (tmpNode.url) { tmpNode = setViews(tmpNode); };
    return tmpNode;
};

function setViews(tmpNode) {
    tmpNode['views'] = 0;
    return tmpNode;
};

function sortIndexToAllNode(tmpNode) {
    if (tmpNode.children) {
        let childrenNode = tmpNode.children;
        childrenNode = sortIndex(childrenNode);
        for (let i in childrenNode) { childrenNode[i] = sortIndexToAllNode(childrenNode[i]); };
        tmpNode.children = childrenNode;
    } else if (tmpNode.url) { };
    return tmpNode;
};

function sortIndex(tmpNode) {
    // sort
    tmpNode.sort((a, b) => {
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
    for (var i in tmpNode) {
        tmpNode[i]['index'] = Number(i);
    };
    return tmpNode;
};
//#endregion
