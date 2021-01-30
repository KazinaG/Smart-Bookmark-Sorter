function moveDbByMovedBookmark(id, moveInfo) {
    if (bookmarkMoveWaitCount == 0) {
        let bookmarkId = id;
        let beforeParentId = moveInfo.oldParentId;
        let afterParentId = moveInfo.parentId;


        node = updateDbByMovedBookmark(node, bookmarkId, beforeParentId, afterParentId);
        let nodeAndViews = folderViewsSumByBookmarkViews(node);
        node = nodeAndViews.node;
    }
    else {
    }
}

function updateDbByMovedBookmark(tmpNode, bookmarkId, beforeParentId, afterParentId) {
    // remove->createの順で使えば良い(bookmarkIdを元に)。更に、delete時にviewsを保持し、createする際にviewsを追加で入れてやれば、完璧。
    let bookmarkInfo;
    // Delete from Database by bookmarkId and get views.
    // get bookmark info what bookmark id.
    let nodeAndBookmarkInfo = returnBookmarkInfoFromDbWhereBookmarkId(tmpNode, bookmarkId);
    bookmarkInfo = nodeAndBookmarkInfo.bookmarkInfo;
    bookmarkInfo.parentId = afterParentId;
    // Delete from Database by bookmarkId
    {
        let request = {};
        let reference = {};
        request['type'] = 'delete';
        reference['node'] = tmpNode;
        reference['bookmarkId'] = bookmarkId;
        reference['parentId'] = beforeParentId;
        request['reference'] = reference;
        let response = database(request);
        tmpNode = response.node;
    };
    {
        let request = {};
        let reference = {};
        request['type'] = 'insert';
        reference['node'] = tmpNode;
        reference['bookmarkInfo'] = bookmarkInfo;
        reference['parentId'] = afterParentId;
        request['reference'] = reference;
        let response = database(request);
        tmpNode = response.node;
    };
    return tmpNode;
}

function returnBookmarkInfoFromDbWhereBookmarkId(tmpNode, bookmarkId) {
    let nodeAndBookmarkInfo = { node: null, bookmarkInfo: null };

    if (tmpNode.id == bookmarkId) {
        nodeAndBookmarkInfo.bookmarkInfo = tmpNode;
    } else if (tmpNode.children) {
        let childrenNode = tmpNode.children;
        for (let i in childrenNode) {
            nodeAndBookmarkInfo = returnBookmarkInfoFromDbWhereBookmarkId(childrenNode[i], bookmarkId);
            childrenNode[i] = nodeAndBookmarkInfo.node;
            // nodeAndBookmarkInfoがnull以外の場合はbreak
            if (nodeAndBookmarkInfo.bookmarkInfo != null) {
                break;
            };
        };
        tmpNode.children = childrenNode;
    }

    nodeAndBookmarkInfo.node = tmpNode;
    return nodeAndBookmarkInfo;
};

function database(request) {
    let response = {};

    if (request.type == 'delete') {
        let tmpNode = request.reference.node;
        let parentId = request.reference.parentId;
        if (tmpNode.id == parentId) {
            let childResponse = deleteDatabase(request);
            tmpNode = childResponse.node;
        } else if (tmpNode.children) {
            for (let i in tmpNode.children) {
                request.reference.node = tmpNode.children[i];
                let childResponse = database(request);
                tmpNode.children[i] = childResponse.node;
            };
        };
        response['node'] = tmpNode;
    }
    else if (request.type == 'insert') {
        let tmpNode = request.reference.node;
        let parentId = request.reference.parentId;
        if (tmpNode.id == parentId) {
            let childResponse = insertDatabase(request);
            tmpNode = childResponse.node;
        } else if (tmpNode.children) {
            for (let i in tmpNode.children) {
                request.reference.node = tmpNode.children[i];
                let childResponse = database(request);
                tmpNode.children[i] = childResponse.node;
            };
        };
        response['node'] = tmpNode;
    }
    else if (request.type == 'update') {
        let tmpNode = request.reference.node;
        let bookmarkId = request.reference.bookmarkId;
        if (tmpNode.id == bookmarkId) {
            let childResponse = updateDatabase(request);
            tmpNode = childResponse.node;
        } else if (tmpNode.children) {
            for (let i in tmpNode.children) {
                request.reference.node = tmpNode.children[i];
                let childResponse = database(request);
                tmpNode.children[i] = childResponse.node;
            };
        };
        response['node'] = tmpNode;
    }
    return response;
};

function deleteDatabase(request) {
    let response = {};
    let tmpNode = request.reference.node;
    let childrenNode = tmpNode.children;
    let removedBookmarkId = request.reference.bookmarkId;

    for (let i in childrenNode) {
        if (childrenNode[i].id == removedBookmarkId) {
            childrenNode.splice(i, 1);
        }
    };
    tmpNode.children = childrenNode;
    response.node = tmpNode;
    return response;
};

function insertDatabase(request) {
    let response = {};
    let tmpNode = request.reference.node;
    let childrenNode = tmpNode.children;
    let bookmarkInfo = request.reference.bookmarkInfo;

    childrenNode.push(bookmarkInfo);

    tmpNode.children = childrenNode;
    response.node = tmpNode;
    return response;
};

function updateDatabase(request) {
    let response = {};
    let tmpNode = request.reference.node;
    let changeInfo = request.reference.changeInfo;
    if (tmpNode.title) { tmpNode.title = changeInfo.title; }
    if (tmpNode.url) { tmpNode.url = changeInfo.url; }
    response.node = tmpNode;
    return response;
};

function folderViewsSumByBookmarkViews(tmpNode) {
    let nodeAndViews = {
        node: node,
        views: 0
    };
    if (tmpNode.children) {
        let childrenNode = tmpNode.children;
        let folderViews = 0;
        for (let i in childrenNode) {
            nodeAndViews = folderViewsSumByBookmarkViews(childrenNode[i]);
            childrenNode[i] = nodeAndViews.node;
            folderViews = folderViews + nodeAndViews.views;
        };
        tmpNode.children = childrenNode;
        tmpNode.views = folderViews;
    }
    nodeAndViews.views = tmpNode.views;
    nodeAndViews.node = tmpNode;
    return nodeAndViews;
};