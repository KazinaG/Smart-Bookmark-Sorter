function insertDbByCreatedBookmark(bookmark) {
    bookmark = setViews(bookmark);
    if (bookmark.url) { }
    else { bookmark = setChildren(bookmark); }
    node = insertNewNodeToAllNode(node, bookmark);
};

function setViews(tmpNode) {
    tmpNode['views'] = 0;
    return tmpNode;
};

function setChildren(bookmark) {
    bookmark['children'] = [];
    return bookmark;
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

function insertNewNode(tmpNode, insertNode) {
    let parentNodeId = tmpNode.id;
    let nodeContents = tmpNode.children;
    if (parentNodeId == insertNode.parentId) {
        nodeContents[nodeContents.length] = insertNode;
        tmpNode.children = nodeContents;
    };
    return tmpNode;
};