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
            getVisitTime(visitItem);
            resolve(visitItem.length);
        });
    })
};

function getVisitTime(visitItem) {
    for (let i in visitItem) {
        let item = visitItem[i].visitTime;
        console.log(item);

        let a = new Date(item);

        console.log(a);

    }
}