async function sortBookmarks() {
    let nodeAndVisitCount = sumFolderVisitCount(node);
    node = nodeAndVisitCount.node;
    node = sortIndexForAllNode(node);
    await moveAllBookmarks(node);
};

function sortIndexForAllNode(tmpNode) {
    if (tmpNode.children) {
        let childrenNode = tmpNode.children;
        childrenNode = sortIndex(childrenNode);
        for (let i in childrenNode) { childrenNode[i] = sortIndexForAllNode(childrenNode[i]); };
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
        // visitCount(desc)
        {
            if (a.visitCount > b.visitCount) return -1;
            if (a.visitCount < b.visitCount) return 1;
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

async function moveAllBookmarks(tmpNode) {
    let nodeId = tmpNode.id;
    if (!(nodeId == 1 || nodeId == 2 || nodeId == 3)) { await moveBookmarks(tmpNode); }
    if (tmpNode.children) {
        let childrenNode = tmpNode.children;
        for (let i in childrenNode) {
            childrenNode[i] = moveAllBookmarks(childrenNode[i]);
        };
        tmpNode.children = childrenNode;
    };
    return tmpNode;
};

function moveBookmarks(tmpNode) {
    return new Promise((resolve, reject) => {
        let id = tmpNode['id'];
        let destination = { parentId: tmpNode['parentId'], index: tmpNode['index'] };
        if (destination.parentId != undefined && destination.parentId != undefined) {
            chrome.bookmarks.move(id, destination, () => {
                resolve();
            });
        } else {
            resolve();
        }
    });
};

function sumFolderVisitCount(tmpNode) {
    let nodeAndVisitCount = {
        node: node,
        visitCount: 0
    };
    if (tmpNode.children) {
        let childrenNode = tmpNode.children;
        let folderVisitCount = 0;
        for (let i in childrenNode) {
            nodeAndVisitCount = sumFolderVisitCount(childrenNode[i]);
            childrenNode[i] = nodeAndVisitCount.node;
            folderVisitCount = folderVisitCount + nodeAndVisitCount.visitCount;
        };
        tmpNode.children = childrenNode;
        tmpNode.visitCount = folderVisitCount;
    }
    nodeAndVisitCount.visitCount = tmpNode.visitCount;
    nodeAndVisitCount.node = tmpNode;
    return nodeAndVisitCount;
};