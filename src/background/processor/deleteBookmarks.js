async function deleteBookmarksById(deleteIdList) {
    for (let i = 0; i < deleteIdList.length; i++) {
        await removeBookmarkById(deleteIdList[i]);
    }
};

function removeBookmarkById(deleteId) {
    return new Promise((resolve, reject) => {
        chrome.bookmarks.remove(deleteId, () => {
            resolve();
        })
    });
}
