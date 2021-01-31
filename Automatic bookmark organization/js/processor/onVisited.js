function countupViewsOfDbByUrl(historyItem) {
    let url = historyItem.url;
    countupViewsToAllNode(node, url);
};

function countupViewsToAllNode(tmpNode, url) {
    if (tmpNode.children) {
        tmpNode = countupViews(tmpNode, url);
        let childrenNode = tmpNode.children;
        for (let i in childrenNode) {
            childrenNode[i] = countupViewsToAllNode(childrenNode[i], url);
        };
        tmpNode.children = childrenNode;
    } else if (tmpNode.url) { };
    return tmpNode;
}

function countupViews(tmpNode, url) {
    let nodeContents = tmpNode.children;
    for (let i in nodeContents) {
        if (nodeContents[i].url == url) {
            nodeContents[i].views++;
            tmpNode.children = nodeContents;
        };
    };
    return tmpNode;
}