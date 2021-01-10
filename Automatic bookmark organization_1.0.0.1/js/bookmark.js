// 定数・変数宣言
// let queue = [];

// event listener
self.addEventListener('message', (request) => {
    console.log(request.data);
    // if (message.data == initialize) {
    //     chrome.bookmarks.getTree(function (rootList) {
    //         let node;
    //         node = getBookmarks(rootList);
    //         node = newSetViews(node);
    //         node = searchAndDoFolderFunction(node, sortIndex, noBookmark);
    //         setLocalStorage(node);
    //         newSortBookmarks(node);
    //     });
    // };
    if (request.data == 'getBookmarkTreeNode') {
        chrome.bookmarks.getTree(function (rootList) {
            postMessage(rootList);
        });
    }
});