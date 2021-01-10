// 定数・変数宣言
// const bookmark = new Worker('js/bookmark.js');

// Function
const initialize = function () {
    // chrome.bookmarks.getTree(function (rootList) {
    //     let node;
    //     node = getBookmarks(rootList);
    //     node = newSetViews(node);
    //     node = searchAndDoFolderFunction(node, sortIndex, noBookmark);
    // });
    // setLocalStorage(node);
    // newSortBookmarks(node);



    // bookmark.onmessage = function (response) {
    //     console.log(response);
    //     console.log(response.data);
    // };
};

// event listener
self.addEventListener('message', (request) => {
    console.log(request.data);
    if (request.data == 'initialize') {
        initialize();
    }
    console.log('bookmark.js: postMessage: getBookmarkTreeNode')
    bookmark.postMessage('getBookmarkTreeNode');
});

