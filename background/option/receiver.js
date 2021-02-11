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

    await setConfiguration({ term: term, decreasePercentage: decreasePercentage });
}

function setConfiguration(value) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.sync.set({ configuration: { term: value.term, decreasePercentage: value.decreasePercentage } }, function () {
                resolve();
            });
        } catch {
            chrome.storage.local.set({ configuration: { term: value.term, decreasePercentage: value.decreasePercentage } }, function () {
                resolve();
            });
        }
    });
}

async function responseConfiguration(request, sender, callback) {
    callback(await getConfiguration());
}

function getConfiguration() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.sync.get([conf_key], function (result) {
                if (result.configuration) {
                    resolve(result.configuration);
                } else {
                    resolve({
                        term: term_short.toString(),
                        decreasePercentage: decreasePercentage_low.toString()
                    });
                }
            });
        } catch {
            try {
                chrome.storage.local.get([conf_key], function (result) {
                    if (result.configuration) {
                        resolve(result.configuration);
                    } else {
                        resolve({
                            term: term_short.toString(),
                            decreasePercentage: decreasePercentage_low.toString()
                        });
                    }
                });
            } catch {
                resolve({
                    term: term_short.toString(),
                    decreasePercentage: decreasePercentage_low.toString()
                });
            }
        }
    });
}
