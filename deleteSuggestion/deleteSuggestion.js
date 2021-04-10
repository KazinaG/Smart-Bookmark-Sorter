document.addEventListener('DOMContentLoaded', initialize);
document.getElementById('delete').addEventListener('click', deleteBookmarks);

async function initialize(reflesh) {

    let deleteTargets = await returnDeleteTargets();
    var dataList = [];
    $('#table').bootstrapTable('destroy');
    for (let i in deleteTargets) {
        let th = document.createElement('th');
        th.setAttribute('scope', 'row');
        // Checkbox
        let input = document.createElement('input');
        input.setAttribute('class', 'form-check-input');
        input.setAttribute('type', 'checkbox');
        input.setAttribute('id', 'flexCheckDefault');
        input.setAttribute('name', 'deleteCheckbox');
        input.value = deleteTargets[i].id;
        th.appendChild(input);
        // URL
        var td2 = document.createElement('td');
        let url = document.createElement('a');
        // URLの子要素を追加
        url.setAttribute('href', deleteTargets[i].url);
        url.setAttribute('target', "_blank");
        url.innerHTML = deleteTargets[i].url;
        td2.appendChild(url);

        dataList.push({
            checkbox: th.innerHTML
            , id: deleteTargets[i].id
            , title: deleteTargets[i].title
            , url: td2.innerHTML
        });
    }

    $('#table').bootstrapTable({ data: dataList });
}

async function returnDeleteTargets() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            message: "getDeleteTargets"
        }, function (response) {
            resolve(response);
        });
    });
}

async function deleteBookmarks() {
    var deleteIdList = [];
    var checkBoxList = document.getElementsByName('deleteCheckbox');
    for (let i = 0; i < checkBoxList.length; i++) {
        if (checkBoxList[i].checked) {
            deleteIdList.push(checkBoxList[i].value);
        }
    }

    // backgroundへ送信
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            message: "deleteBookmarks",
            deleteIdList: deleteIdList
        },
            // callbackで再描画処理
            async function (response) {
                await initialize();
                resolve(response);
            });
    });
}