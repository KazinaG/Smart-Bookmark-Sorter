// document.write("<script src='js/common.js'></script>");

const script = new Worker('js/script.js');
const sendRequestInitialize = 'initialize';
const apiSendRequest = 'js/api.js: send request: ';

const postMessageToScript = function (request) {
	console.log(returnTimestamp() + ': Start: ' + apiSendRequest + request)
	script.postMessage(request);
	console.log(returnTimestamp() + ': End: ' + apiSendRequest + request)
};

//#region Trigger
chrome.runtime.onInstalled.addListener(function () {
	// script.postMessage('initialize');
});

chrome.browserAction.onClicked.addListener(function () {
	postMessageToScript(sendRequestInitialize);
});
//#endregion Trigger


script.addEventListener('message', (message) => {
	console.log('return from script.js:' + message.data);
	let node
	if (message.data == 'getTree') {
		// node = await getTree();
		getTree().then(value => {
			node = value;
		});
	};
	let postMessage = { message: returnTree, args: node };
	postMessageToScript(postMessage);
});

async function getTree() {
	// return new Promise(function (resolve, reject) {
	chrome.bookmarks.getTree(function (rootList) {
		// resolve(rootList);
		return (rootList);
	});
	// });
};

// script.addEventListener('message', (message) => {
// 	console.log('return from script.js:' + message.data);
// });