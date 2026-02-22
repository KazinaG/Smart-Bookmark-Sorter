chrome.runtime.onMessage.addListener(function (request, sender, callback) {
	handleMessage(request)
		.then((response) => {
			callback(response);
		})
		.catch((error) => {
			console.error('onMessage failed', error);
			callback();
		});
	return true;
});

async function handleMessage(request) {
	switch (request.message) {
		case 'saveOptions':
			return saveSyncStorage(request);
		case 'getConfiguration':
			return responseConfiguration();
		case 'getConstant':
			return responseConstant();
		case 'getDeleteTargets':
			return responseDeleteTargets();
		case 'deleteBookmarks':
			return deleteBookmarks(request);
		default:
			return;
	}
}

async function saveSyncStorage(request) {
	term = request.term;
	decreasePercentage = request.decreasePercentage;
	sortOrder = request.sortOrderList;
	sortTarget = request.sortTarget;
	await setConfiguration({ configuration: { term: term, decreasePercentage: decreasePercentage, sortOrder: sortOrder, sortTarget: sortTarget } });
	requestAggregateProcessing();
	return request.message + '確認';
}

async function responseConstant() {
	await hydrateRuntimeStateToMemory();
	return {
		termSelections: termSelections
		, decreasePercentageSelections: decreasePercentageSelections
		, sortOrderList: sortOrderList
		, sortTargetList: sortTargetList
		, deleteSuggestionTargetsLength
	};
}

async function responseConfiguration() {
	await toReflectConfig();
	return { term: term, decreasePercentage: decreasePercentage, sortOrder: sortOrder, sortTarget: sortTarget };
}

async function responseDeleteTargets() {
	await hydrateRuntimeStateToMemory();
	return deleteSuggestionTargets;
}

async function deleteBookmarks(request) {
	await deleteBookmarksById(request.deleteIdList);
	await enqueueAggregateRequest();
	await processPendingAggregateRequests();
}
