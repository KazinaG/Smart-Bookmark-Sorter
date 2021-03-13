document.addEventListener('DOMContentLoaded', initialize);
document.getElementById('delete').addEventListener('click', deleteBookmarks);

async function initialize() {

    let deleteTargets = await returnDeleteTargets();

    for (let i in deleteTargets) {
        var tr = document.createElement('tr');
        let th = document.createElement('th');
        th.setAttribute('scope', 'row');
        // Checkbox
        let input = document.createElement('input');
        input.setAttribute('class', 'form-check-input');
        input.setAttribute('type', 'checkbox');
        input.setAttribute('id', 'flexCheckDefault');
        input.value = "";
        th.appendChild(input);
        // id
        var id = document.createElement('td');
        id.setAttribute('class', 'collapse');
        id.innerHTML = deleteTargets[i].id;
        // Title
        var td1 = document.createElement('td');
        td1.innerHTML = deleteTargets[i].title;
        // URL
        var td2 = document.createElement('td');
        let url = document.createElement('a');
        // URLの子要素を追加
        url.setAttribute('href', deleteTargets[i].url);
        url.setAttribute('target', "_blank");
        url.innerHTML = deleteTargets[i].url;
        td2.appendChild(url);
        // テーブルに追加
        tr.appendChild(th);
        tr.appendChild(id);
        tr.appendChild(td1);
        tr.appendChild(td2);
        deleteSuggestionTable.appendChild(tr);
    }
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

}