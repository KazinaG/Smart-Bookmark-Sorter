chrome.runtime.onMessage.addListener(
    function (request, sender, callback) {
        switch (request.message) {
            case 'saveOptions':
                saveSyncStorage(request, sender, callback);
                break;
            case 'getConfiguration':
                responseConfiguration(request, sender, callback);
                break;
            case 'getConstant':
                responseConstant(request, sender, callback);
                break;
            default:
                break;
        }
        return true;
    }
);

async function saveSyncStorage(request, sender, callback) {  // 1
    callback(request.message + '確認');

    term = request.term;
    decreasePercentage = request.decreasePercentage;
    sortOrder = request.sortOrderList;

    await setConfiguration({ configuration: { term: term, decreasePercentage: decreasePercentage, sortOrder: sortOrder } });
}

async function responseConstant(request, sender, callback) {
    callback({
        termSelections: termSelections,
        decreasePercentageSelections: decreasePercentageSelections,
        sortOrderList: sortOrderList
    });
}

async function responseConfiguration(request, sender, callback) {
    await toReflectConfig();

    callback({ term: term, decreasePercentage: decreasePercentage, sortOrder: sortOrder });
}
