async function aggregate() {
    await getTree();
    node = await setVisitPointToAllNode(node);
};

function getTree() {
    return new Promise((resolve, reject) => {
        chrome.bookmarks.getTree((rootList) => {
            node = getBookmarks(rootList);
            resolve();
        });
    });
}

function getBookmarks(rootList) {
    // ルートオブジェクトの取得
    let root_defaultBookmark = rootList[0];
    // ルートオブジェクトから最上位のデフォルトのブックマークフォルダの配列の取得
    let defaultBookmarkList = root_defaultBookmark['children'];
    // 「ブックマークバー」の取得 0:ブックマークバー 1:その他ブックマーク 2:モバイルブックマーク
    let bookmarkBarNode = defaultBookmarkList[0];
    return bookmarkBarNode;
};

async function setVisitPointToAllNode(tmpNode) {
    if (tmpNode.children) {
        tmpNode = await setVisitPoint(tmpNode);
        let childrenNode = tmpNode.children;
        for (let i in childrenNode) { childrenNode[i] = await setVisitPointToAllNode(childrenNode[i]); };
        tmpNode.children = childrenNode;
    } else if (tmpNode.url) { tmpNode = await setVisitPoint(tmpNode); };
    return tmpNode;
};