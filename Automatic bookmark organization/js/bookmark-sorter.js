
//#region Sort bookmark
// TODO function名が、sortbookmarksとsortbookmarkでややこしい
async function sortBookmarks() {
    node = sortIndexToAllNode(node);
    await sortAllBookmarks(node);
    await getLocalStorage();
};

function setLocalStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ key: node }, () => {
            console.log('set local storage.');
            resolve();
        });
    });
};


async function sortAllBookmarks(tmpNode) {
    let nodeId = tmpNode.id;
    if (!(nodeId == 1 || nodeId == 2 || nodeId == 3)) { await sortBookmark(tmpNode); }
    if (tmpNode.children) {
        let childrenNode = tmpNode.children;
        for (let i in childrenNode) {
            childrenNode[i] = sortAllBookmarks(childrenNode[i]);
        };
        tmpNode.children = childrenNode;
    };
    return tmpNode;
};

async function sortBookmark(tmpNode) {
    let id = tmpNode['id'];
    let destination = { parentId: tmpNode['parentId'], index: tmpNode['index'] };
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


