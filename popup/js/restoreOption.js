async function initialize() {

    await getConstantFromBackgroundPage();

    for (let i = 0; i < termSelections.length; i++) {
        let option = document.createElement('option');
        option.setAttribute('value', termSelections[i].value);
        option.innerHTML = termSelections[i].display;
        term.appendChild(option);
    }

    for (let i = 0; i < decreasePercentageSelections.length; i++) {
        let option = document.createElement('option');
        option.setAttribute('value', decreasePercentageSelections[i].value);
        option.innerHTML = decreasePercentageSelections[i].display;
        decreasePercentage.appendChild(option);
    }

    await restore_options();

    for (let i = 0; i < sortOrderList.length; i++) {
        let li = document.createElement('li');
        li.setAttribute('id', sortOrderList[i].id);
        li.innerHTML = sortOrderList[i].display;
        li.setAttribute('class', 'list-group-item');
        sortList.appendChild(li);
    }

    initializeSortList();
}

function getConstantFromBackgroundPage() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            message: "getConstant"
        }, function (response) {
            termSelections = response.termSelections;
            decreasePercentageSelections = response.decreasePercentageSelections;
            sortOrderList = response.sortOrderList;
            sortTarget.bar.checked = response.sortTargetList[0].value;
            sortTarget.mobile.checked = response.sortTargetList[1].value;
            sortTarget.other.checked = response.sortTargetList[2].value;
            resolve(response);
        });
    });
}

function initializeSortList() {
    $('#sortList').sortable({
        axis: 'y',
        update: function (event, ui) {
            changedSortOrder = $(this).sortable("toArray");
            save_options();
        }
    });
}

async function restore_options() {
    let configuration = await getConfigurationFromBackgroundPage();
    if (configuration.term) {
        for (let i = 0; i < termSelections.length; i++) {
            if (termSelections[i].value == parseInt(configuration.term)) {
                term.selectedIndex = i;
                break;
            }
        }
    }

    if (configuration.decreasePercentage) {
        for (let i = 0; i < decreasePercentageSelections.length; i++) {
            if (decreasePercentageSelections[i].value == parseFloat(configuration.decreasePercentage)) {
                decreasePercentage.selectedIndex = i;
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

    changeDisabled();
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