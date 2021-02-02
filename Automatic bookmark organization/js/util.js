async function setVisitPoint(tmpNode) {

    let url = tmpNode.url;
    if (url) {
        let i = await getVisitPointByUrl(url);
        tmpNode['visitPoint'] = i;
    } else {
        tmpNode['visitPoint'] = 0;
    }
    return tmpNode;
};

function getVisitPointByUrl(conditionUrl) {
    return new Promise((resolve) => {
        chrome.history.getVisits({ url: conditionUrl }, function (visitItem) {
            resolve(visitItem.length);
        });
    })
};
