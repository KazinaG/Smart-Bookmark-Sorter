
//#region Sort bookmark
// TODO function名が、sortbookmarksとsortbookmarkでややこしい
async function sortBookmarks() {
    node = sortIndexToAllNode(node);
    await sortAllBookmarks(node);
};

async function sortAllBookmarks(node) {
    let nodeId = node.id;
    if (!(nodeId == 1 || nodeId == 2 || nodeId == 3)) { await sortBookmark(node); }
    if (node.children) {
        let childrenNode = node.children;
        for (let i in childrenNode) {
            childrenNode[i] = sortAllBookmarks(childrenNode[i]);
        };
        node.children = childrenNode;
    };
    return node;
};

async function sortBookmark(node) {
    let id = node['id'];
    let destination = { parentId: node['parentId'], index: node['index'] };
    if (destination.parentId != undefined && destination.parentId != undefined) {
        // TODO 下記のカウントアップがいるのか確認する。
        bookmarkMoveWaitCount = bookmarkMoveWaitCount + 1;
        await moveBookmarks(id, destination);
    };
};

function moveBookmarks(id, destination) {
    return new Promise((resolve, reject) => {
        chrome.bookmarks.move(id, destination, () => {
            // TODO 下記のカウントアップがいるのか確認する。
            bookmarkMoveWaitCount = bookmarkMoveWaitCount - 1;
            resolve();
        });
    });
};
//#endregion Sort bookmark


