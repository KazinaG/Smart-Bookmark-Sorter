document.addEventListener('DOMContentLoaded', initialize);

let deleteTargets = [];
let currentSort = { field: 'title', direction: 'asc' };
let isEventListenersReady = false;

async function initialize() {
    localizeHtmlPage();
    addEventListeners();
    await loadAndRenderDeleteTargets();
}

function addEventListeners() {
    if (isEventListenersReady) return;

    document.getElementById('delete').addEventListener('click', deleteBookmarks);
    let sortableHeaders = document.querySelectorAll('th[data-sort-field]');
    sortableHeaders.forEach((header) => {
        header.dataset.baseLabel = header.textContent.trim();
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            applySort(header.dataset.sortField);
        });
    });

    isEventListenersReady = true;
}

async function loadAndRenderDeleteTargets() {
    deleteTargets = await returnDeleteTargets();
    renderDeleteTargetsTable();
}

function renderDeleteTargetsTable() {
    updateSortIndicators();

    let targetTable = document.getElementById('deleteSuggestionTable');
    targetTable.innerHTML = '';

    let sortedTargets = sortDeleteTargets(deleteTargets, currentSort.field, currentSort.direction);
    sortedTargets.forEach((target) => {
        let tr = document.createElement('tr');

        let checkboxCell = document.createElement('th');
        checkboxCell.setAttribute('scope', 'row');
        checkboxCell.classList.add('text-center');

        let input = document.createElement('input');
        input.setAttribute('class', 'form-check-input');
        input.setAttribute('type', 'checkbox');
        input.setAttribute('name', 'deleteCheckbox');
        input.value = target.id;
        checkboxCell.appendChild(input);

        let idCell = document.createElement('td');
        idCell.classList.add('collapse');
        idCell.textContent = target.id;

        let titleCell = document.createElement('td');
        titleCell.textContent = target.title;

        let urlCell = document.createElement('td');
        let urlAnchor = document.createElement('a');
        urlAnchor.setAttribute('href', target.url);
        urlAnchor.setAttribute('target', '_blank');
        urlAnchor.setAttribute('rel', 'noopener noreferrer');
        urlAnchor.classList.add('link-light');
        urlAnchor.textContent = target.url;
        urlCell.appendChild(urlAnchor);

        tr.appendChild(checkboxCell);
        tr.appendChild(idCell);
        tr.appendChild(titleCell);
        tr.appendChild(urlCell);

        targetTable.appendChild(tr);
    });
}

function applySort(field) {
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.direction = 'asc';
    }

    renderDeleteTargetsTable();
}

function sortDeleteTargets(targets, field, direction) {
    let sorted = [...targets];
    sorted.sort((a, b) => {
        let left = String(a[field] || '').toUpperCase();
        let right = String(b[field] || '').toUpperCase();
        if (left < right) return direction === 'asc' ? -1 : 1;
        if (left > right) return direction === 'asc' ? 1 : -1;
        return 0;
    });
    return sorted;
}

function updateSortIndicators() {
    let headers = document.querySelectorAll('th[data-sort-field]');
    headers.forEach((header) => {
        let field = header.dataset.sortField;
        let baseLabel = header.dataset.baseLabel || header.textContent.trim();
        let indicator = '';
        if (currentSort.field === field) {
            indicator = currentSort.direction === 'asc' ? ' ▲' : ' ▼';
        }
        header.textContent = baseLabel + indicator;
    });
}

async function returnDeleteTargets() {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            message: "getDeleteTargets"
        }, function (response) {
            resolve(response || []);
        });
    });
}

async function deleteBookmarks() {
    let checkBoxList = document.querySelectorAll('input[name="deleteCheckbox"]:checked');
    let deleteIdList = Array.from(checkBoxList).map((checkbox) => checkbox.value);

    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            message: "deleteBookmarks",
            deleteIdList: deleteIdList
        }, async function () {
            await loadAndRenderDeleteTargets();
            resolve();
        });
    });
}

function localizeHtmlPage() {
    // Localize by replacing __MSG_***__ meta tags.
    var objects = document.getElementsByTagName('html');
    for (var j = 0; j < objects.length; j++) {
        var obj = objects[j];

        var valStrH = obj.innerHTML.toString();
        var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function (match, v1) {
            return v1 ? chrome.i18n.getMessage(v1) : "";
        });

        if (valNewH != valStrH) {
            obj.innerHTML = valNewH;
        }
    }
}
