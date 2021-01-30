function removeDbRemovedBookmark(removeInfo) {
    node = removeNodeToAllNode(node, removeInfo);
}

function removeNodeToAllNode(tmpNode, removeInfo) {
    if (tmpNode.children) {
        tmpNode = removeNode(tmpNode, removeInfo.node.id);
        let childrenNode = tmpNode.children;
        for (let i in childrenNode) {
            childrenNode[i] = removeNodeToAllNode(childrenNode[i], removeInfo);
        };
        tmpNode.children = childrenNode;
    } else if (tmpNode.url) { };
    return tmpNode;
}

function removeNode(tmpNode, removeNodeId) {
    let nodeContents = tmpNode.children;
    for (let i in nodeContents) {
        if (nodeContents[i].id == removeNodeId) {
            nodeContents.splice(i, 1);
            tmpNode.children = nodeContents;
        };
    };
    return tmpNode;
}