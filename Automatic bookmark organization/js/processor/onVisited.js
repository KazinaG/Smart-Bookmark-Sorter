function countupVisitCountOfDbByUrl(historyItem) {
    let url = historyItem.url;
    getVisitCountByUrl(url);
    // countupVisitCountToAllNode(node, url);
};

function countupVisitCountToAllNode(tmpNode, url) {
    if (tmpNode.children) {
        tmpNode = countupVisitCount(tmpNode, url);
        let childrenNode = tmpNode.children;
        for (let i in childrenNode) {
            childrenNode[i] = countupVisitCountToAllNode(childrenNode[i], url);
        };
        tmpNode.children = childrenNode;
    } else if (tmpNode.url) { };
    return tmpNode;
}

function countupVisitCount(tmpNode, url) {
    let nodeContents = tmpNode.children;
    for (let i in nodeContents) {
        if (nodeContents[i].url == url) {
            nodeContents[i].visitCount++;
            tmpNode.children = nodeContents;
        };
    };
    return tmpNode;
}