async function deleteBookmarksById(deleteIdList, callback) {
    for (let i = 0; i < deleteIdList.length; i++) {
        await removeBookmarkById(deleteIdList[i]);
    }
    await aggregate();
    callback();
};

function removeBookmarkById(deleteId) {
    return new Promise((resolve, reject) => {
        chrome.bookmarks.remove(deleteId, () => {
            resolve();
        })
    });
}