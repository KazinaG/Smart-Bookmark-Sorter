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