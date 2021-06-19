function setConfiguration(value) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.sync.set(value, function () {
                resolve();
            });
        } catch {
            chrome.storage.local.set(value, function () {
                resolve();
            });
        }
    });
}

async function toReflectConfig() {
    let configuration = await getConfiguration();
    if (configuration.term) term = configuration.term;
    if (configuration.decreasePercentage) decreasePercentage = configuration.decreasePercentage;
    if (configuration.sortOrder) sortOrder = configuration.sortOrder;
    if (configuration.sortTarget) sortTarget = configuration.sortTarget;
}


function getConfiguration() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.sync.get([conf_key], function (result) {
                if (result.configuration) {
                    resolve(result.configuration);
                } else {
                    resolve(getDefaults());
                }
            });
        } catch {
            try {
                chrome.storage.local.get([conf_key], function (result) {
                    if (result.configuration) {
                        resolve(result.configuration);
                    } else {
                        resolve(getDefaults());
                    }
                });
            } catch {
                resolve(getDefaults());
            }
        }
    });
}

function getDefaults() {
    let configuration = { term: null, decreasePercentage: null };
    for (let i = 0; i < termSelections.length; i++) {
        if (termSelections[i].default) {
            configuration.term = termSelections[i].value.toString();
            break;
        }
    }

    for (let i = 0; i < decreasePercentageSelections.length; i++) {
        if (decreasePercentageSelections[i].default) {
            configuration.decreasePercentage = decreasePercentageSelections[i].value.toString();
            break;
        }
    }

    return configuration;
}

function localizeResources() {
    localizeResource(decreasePercentageSelections);
    localizeResource(sortOrderList);
}

function localizeResource(target) {
    for (let i = 0; i < target.length; i++) {
        target[i].display = target[i].display.replace(/__MSG_(\w+)__/g, function (match, v1) {
            return v1 ? chrome.i18n.getMessage(v1) : "";
        });
    }
}