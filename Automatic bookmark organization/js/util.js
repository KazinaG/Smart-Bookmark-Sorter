async function setVisitCount(tmpNode) {

    let url = tmpNode.url;
    if (url) {
        let i = await getVisitCountByUrl(url);
        tmpNode['visitCount'] = i;
    } else {
        tmpNode['visitCount'] = 0;
    }
    return tmpNode;
};

function getVisitCountByUrl(conditionUrl) {
    return new Promise((resolve) => {
        chrome.history.getVisits({ url: conditionUrl }, function (visitItem) {
            // console.log(visitItem);
            // console.log(visitItem.length);

            resolve(visitItem.length);
        });
    })
};
