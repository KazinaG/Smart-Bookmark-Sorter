
function save_options() {
    let term = document.getElementById('term').value;
    let decreasePercentage = document.getElementById('decreasePercentage').value;

    chrome.runtime.sendMessage({
        message: "message_中身",
        term: term,
        decreasePercentage: decreasePercentage
    }, function (response) {
        console.log(response);
        // alert(response);
    });
}

function restore_options() {
    await getConfiguration();
}

function getConfiguration() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['configuration'], function (result) {
            // TODO オプション画面にSyncStorageから取得した設定反映
            resolve();
        });
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);