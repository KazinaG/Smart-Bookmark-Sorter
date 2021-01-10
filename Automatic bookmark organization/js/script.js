// TODO common.jsを参照できるようになったらいいなぁ。
// document.write("<script src='js/common.js'></script>");
//#region From common.js
function returnTimestamp() {
	var d = new Date();
	var year = d.getFullYear();
	var month = d.getMonth() + 1;
	var day = d.getDate();
	var hour = (d.getHours() < 10) ? '0' + d.getHours() : d.getHours();
	var min = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes();
	var sec = (d.getSeconds() < 10) ? '0' + d.getSeconds() : d.getSeconds();
	const timestamp = (year + '/' + month + '/' + day + ' ' + hour + ':' + min + ':' + sec);
	return timestamp;
};
//#endregion From common.js

let functionQueue = [];
let bookmarkTreeNode = [];

self.addEventListener('message', (request) => {
	const requestData = request.data;
	console.log(returnTimestamp() + ': ' + 'js/script.js: receive request: ' + requestData);
	if (requestData == 'initialize') {
		self.postMessage('getTree');
	}
	else if (requestData.postMessage == 'returnTree') {
		console.log('いえーい');
	}







	// self.postMessage(requestData);
	console.log("script.js is runned.")
});

function request(request) {

};
