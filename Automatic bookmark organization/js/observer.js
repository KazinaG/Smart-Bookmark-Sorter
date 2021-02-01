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
			// console.log('判定開始');
			await classifier(processList.shift());
			// console.log('判定終了');
		}
	}
	else if (isProcessing) {

		// ブックマークの整理処理 TODO リファクタリング
		// console.log('ブックマークの整理開始');
		await sortBookmarks();
		isProcessing = false;
		// console.log('ブックマークの整理終了');

	} else {
		// console.log('イベントなし at ' + new Date() + '.');
	}
};

async function classifier(param) {
	switch (param[0]) {
		case typeInitialize:
			await initialize();
			break;
		case typeOnCreated:
			insertDbByCreatedBookmark(param[2]);
			break;
		case typeOnRemoved:
			removeDbRemovedBookmark(param[2]);
			break;
		case typeOnMoved:
			moveDbByMovedBookmark(param[1], param[2]);
			break;
		case typeOnVisited:
			countupVisitCountOfDbByUrl(param[1]);
			break;

		default:
	}
};
