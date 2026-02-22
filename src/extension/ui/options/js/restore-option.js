async function initialize() {

    localizeHtmlPage();

    // TODO 後ほどfunction化する。
    sortLevel = document.getElementById('sortLevel');
    sortList = document.getElementById('sortList');
    sortTarget = { bar: document.getElementById('bookmarksBar'), mobile: document.getElementById('mobileBookmarks'), other: document.getElementById('otherBookmarks') };
    deleteSuggestionTargetsLength = document.getElementById('delete_target_number');

    await getConstantFromBackgroundPage();

    // フル機能用に下記のコメントは残しておく
    // for (let i = 0; i < termSelections.length; i++) {
    //     let option = document.createElement('option');
    //     option.setAttribute('value', termSelections[i].value);
    //     option.innerHTML = termSelections[i].display;
    //     term.appendChild(option);
    // }

    // for (let i = 0; i < decreasePercentageSelections.length; i++) {
    //     let option = document.createElement('option');
    //     option.setAttribute('value', decreasePercentageSelections[i].value);
    //     option.innerHTML = decreasePercentageSelections[i].display;
    //     decreasePercentage.appendChild(option);
    // }

    for (let i = 0; i < sortLevelSelections.length; i++) {
        let option = document.createElement('option');
        option.setAttribute('value', sortLevelSelections[i].value);
        option.innerHTML = sortLevelSelections[i].display;
        sortLevel.appendChild(option);
    }

    await restore_options();

    for (let i = 0; i < sortOrderList.length; i++) {
        let li = document.createElement('li');
        li.setAttribute('id', sortOrderList[i].id);
        li.innerHTML = sortOrderList[i].display;
        li.setAttribute('class', 'list-group-item text-dark');
        sortList.appendChild(li);
    }

    initializeSortList();
}

let draggedSortItem = null;
let dragStartOrder = [];

function getConstantFromBackgroundPage() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            message: "getConstant"
        }, function (response) {
            termSelections = response.termSelections;
            decreasePercentageSelections = response.decreasePercentageSelections;
            sortLevelSelections = response.decreasePercentageSelections;
            sortOrderList = response.sortOrderList;
            sortTarget.bar.checked = response.sortTargetList[0].value;
            sortTarget.mobile.checked = response.sortTargetList[1].value;
            sortTarget.other.checked = response.sortTargetList[2].value;
            deleteSuggestionTargetsLength.innerHTML = response.deleteSuggestionTargetsLength;
            resolve(response);
        });
    });
}

function initializeSortList() {
    let items = sortList.querySelectorAll('li');
    items.forEach((item) => {
        item.setAttribute('draggable', 'true');
        item.classList.add('draggable-sort-item');
        item.addEventListener('dragstart', onSortDragStart);
        item.addEventListener('dragover', onSortDragOver);
        item.addEventListener('drop', onSortDragDrop);
        item.addEventListener('dragend', onSortDragEnd);
    });
}

function onSortDragStart(event) {
    draggedSortItem = event.currentTarget;
    dragStartOrder = getCurrentSortOrder();
    draggedSortItem.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedSortItem.id);
}

function onSortDragOver(event) {
    event.preventDefault();
    if (!draggedSortItem) return;

    let targetItem = event.currentTarget;
    if (targetItem === draggedSortItem) return;

    let targetRect = targetItem.getBoundingClientRect();
    let shouldInsertAfter = event.clientY > targetRect.top + targetRect.height / 2;

    if (shouldInsertAfter) {
        if (targetItem.nextSibling !== draggedSortItem) {
            sortList.insertBefore(draggedSortItem, targetItem.nextSibling);
        }
    } else if (targetItem !== draggedSortItem.nextSibling) {
        sortList.insertBefore(draggedSortItem, targetItem);
    }
}

function onSortDragDrop(event) {
    event.preventDefault();
}

function onSortDragEnd() {
    if (!draggedSortItem) return;

    draggedSortItem.classList.remove('dragging');
    changedSortOrder = getCurrentSortOrder();
    if (!isSameOrder(dragStartOrder, changedSortOrder)) {
        save_options();
    }

    draggedSortItem = null;
    dragStartOrder = [];
}

function getCurrentSortOrder() {
    return Array.from(sortList.querySelectorAll('li')).map((item) => item.id);
}

function isSameOrder(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

async function restore_options() {
    let configuration = await getConfigurationFromBackgroundPage();
    // フル機能用に下記のコメントは残しておく
    // if (configuration.term) {
    //     for (let i = 0; i < termSelections.length; i++) {
    //         if (termSelections[i].value == parseInt(configuration.term)) {
    //             term.selectedIndex = i;
    //             break;
    //         }
    //     }
    // }

    // if (configuration.decreasePercentage) {
    //     for (let i = 0; i < decreasePercentageSelections.length; i++) {
    //         if (decreasePercentageSelections[i].value == parseFloat(configuration.decreasePercentage)) {
    //             decreasePercentage.selectedIndex = i;
    //             break;
    //         }
    //     }
    // }

    if (configuration.decreasePercentage) {
        for (let i = 0; i < sortLevelSelections.length; i++) {
            if (sortLevelSelections[i].value == parseFloat(configuration.decreasePercentage)) {
                sortLevel.selectedIndex = i;
                break;
            }
        }
    }

    let restoreOrderList = [];
    let size = sortOrderList.length;
    if (configuration.sortOrder) {
        for (let j = 0; j < configuration.sortOrder.length; j++) {
            for (let i = 0; i < size; i++) {
                if (configuration.sortOrder[j] == sortOrderList[i].id) {
                    restoreOrderList.push(sortOrderList[i]);
                    sortOrderList.splice(i, 1);
                    break;
                }
            }
        }
    }

    sortOrderList = restoreOrderList.concat(sortOrderList);
    for (let i = 0; i < sortOrderList.length; i++) {
        changedSortOrder.push(sortOrderList[i].id);
    }

    // Storageから取得したソート対象の設定を画面に反映
    if (configuration.sortTarget) {
        sortTarget.bar.checked = configuration.sortTarget.isBar;
        sortTarget.mobile.checked = configuration.sortTarget.isMobile;
        sortTarget.other.checked = configuration.sortTarget.isOther;
    }

    // changeDisabled();
}

function getConfigurationFromBackgroundPage() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            message: "getConfiguration"
        }, function (response) {
            resolve(response);
        });
    });
}
