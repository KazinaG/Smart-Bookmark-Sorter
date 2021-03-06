async function loop() {
	while (true) {
		await wait();
		await observer();
	}
}

function wait() {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, sleepSec * 1000);
	})
}

async function observer() {
	if (!isProcessing && (processList.length > 0)) {
		isProcessing = true;
		while (processList.length > 0) {
			await classifier(processList.shift());
		}
	}
	else if (isProcessing) {
		await sortBookmarks();
		isProcessing = false;
	} else {
	}
};

async function classifier(process) {
	switch (process.message) {
		case typeAggregate:
			await aggregate();
			break;
		case typeDeleteBookmarks:
			await deleteBookmarksById(process.param, process.callback);
			break;
		default:
	}
};
