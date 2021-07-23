async function aggregate() {
    await getTree();

    tempDeleteSuggestionTargets = [];

    node = await setVisitPointToAllNode(node);

    deleteSuggestionTargets = tempDeleteSuggestionTargets;

    if (deleteSuggestionTargets.length > 0) {
        deleteSuggestionTargetsLength = deleteSuggestionTargets.length;
        let displayBadge = deleteSuggestionTargetsLength;
        if (displayBadge >= 1000) displayBadge = '999+'
        chrome.browserAction.setBadgeText({ text: String(displayBadge) });
    } else { deleteSuggestionTargetsLength = 0; }
};

function getTree() {
    return new Promise((resolve, reject) => {
        chrome.bookmarks.getTree((rootList) => {
            node = getBookmarks(rootList);
            resolve();
        });
    });
}

function getBookmarks(rootList) {
    // ルートからソート対象以外のノードを削除
    if (!sortTarget.isOther) rootList[0].children.splice(2, 1);
    if (!sortTarget.isMobile) rootList[0].children.splice(1, 1);
    if (!sortTarget.isBar) rootList[0].children.splice(0, 1);
    return rootList[0];
};

async function setVisitPointToAllNode(tmpNode) {
    if (tmpNode.children) {
        tmpNode = await setVisitPoint(tmpNode);
        let childrenNode = tmpNode.children;
        for (let i in childrenNode) { childrenNode[i] = await setVisitPointToAllNode(childrenNode[i]); };
        tmpNode.children = childrenNode;
    } else if (tmpNode.url) { tmpNode = await setVisitPoint(tmpNode); };
    return tmpNode;
};