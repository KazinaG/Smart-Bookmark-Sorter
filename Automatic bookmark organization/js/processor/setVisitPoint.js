async function setVisitPoint(tmpNode) {

	let url = tmpNode.url;
	if (url) {
		let i = await getVisitPointByUrl(url);
		tmpNode['visitPoint'] = i;
	} else {
		tmpNode['visitPoint'] = 0;
	}
	return tmpNode;
};

function getVisitPointByUrl(conditionUrl) {
	return new Promise((resolve) => {
		chrome.history.getVisits({ url: conditionUrl }, function (visitItem) {
			getVisitPoint(visitItem);
			resolve(visitItem.length);
		});
	})
};

function getVisitPoint(visitItem) {
	let visitPoint = 0;
	for (let i in visitItem) {
		if (new Date() < new Date(visitItem[i].visitTime)) {
			// おそらくないが、未来の日時のvisitTimeがあった場合、現在の日時として扱う。
			visitPoint++;
		}
		else {
			let difference = new Date() - new Date(visitItem[i].visitTime);
			let quotient = Math.floor(difference / (term * 3600000));
			visitPoint += Math.pow(decreasePercentage, quotient);
		}
	}
	return visitPoint;
}