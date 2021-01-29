
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
//#endregion
