chrome.runtime.onMessage.addListener(
    function (request, sender, callback) {
        switch (request.message) {
            case 'saveOptions':
                saveSyncStorage(request, sender, callback);
                break;
            case 'getConfiguration':
                responseConfiguration(request, sender, callback);
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

    await ssetConfiguration({ term: term, decreasePercentage: decreasePercentage });
}

function ssetConfiguration(value) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({ configuration: { term: value.term, decreasePercentage: value.decreasePercentage } }, function () {
            resolve();
        });
    });
}

async function responseConfiguration(request, sender, callback) {
    callback(await getConfiguration());
}

function getConfiguration() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['configuration'], function (result) {
            resolve(result.configuration);
        });
    });
}
