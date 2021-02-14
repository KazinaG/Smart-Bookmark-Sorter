async function sortBookmarks() {
	let nodeAndvisitPoint = sumFolderVisitPoint(node);
	node = nodeAndvisitPoint.node;
	node = sortIndexForAllNode(node);
	await moveAllBookmarks(node);
};

function sortIndexForAllNode(tmpNode) {
	if (tmpNode.children) {
		let childrenNode = tmpNode.children;
		childrenNode = sortIndex(childrenNode);
		for (let i in childrenNode) { childrenNode[i] = sortIndexForAllNode(childrenNode[i]); };
		tmpNode.children = childrenNode;
	} else if (tmpNode.url) { };
	return tmpNode;
};

function sortIndex(tmpNode) {
	// sort
	tmpNode.sort((a, b) => {
		let ret = 0;
		for (let i = 0; i < sortOrder.length; i++) {
			switch (sortOrder[i]) {
				case "folder":
					ret = sortByFolder(a, b);
					break;
				case "visitPoint":
					ret = sortByVisitPoint(a, b);
					break;
				case "title":
					ret = sortByTitle(a, b);
					break;
				case "url":
					ret = sortByUrl(a, b);
					break;
				default:
					break;
			}
			if (ret != 0) return ret;
		}
		return 0;
	});
	// 順番通りにindexをソートする
	for (var i in tmpNode) {
		tmpNode[i]['index'] = Number(i);
	};
	return tmpNode;
};

// is folder(asc)
function sortByFolder(a, b) {
	let aIsFolder = 0; // a is folder = 0, a is not folder = 1.
	if (a.url) { aIsFolder = 1; };
	let bIsFolder = 0; // b is folder = 0, a is not folder = 1.
	if (b.url) { bIsFolder = 1; };
	if (aIsFolder < bIsFolder) return -1;
	if (aIsFolder > bIsFolder) return 1;
}

// visitPoint(desc)
function sortByVisitPoint(a, b) {
	if (a.visitPoint > b.visitPoint) return -1;
	if (a.visitPoint < b.visitPoint) return 1;
}

// title(asc)
function sortByTitle(a, b) {
	if (a.title.toUpperCase() < b.title.toUpperCase()) return -1;
	if (a.title.toUpperCase() > b.title.toUpperCase()) return 1;
}

// url(asc)
function sortByUrl(a, b) {
	if (a.url < b.url) return -1;
	if (a.url > b.url) return 1;
}

async function moveAllBookmarks(tmpNode) {
	let nodeId = tmpNode.id;
	if (!(nodeId == 1 || nodeId == 2 || nodeId == 3)) { await moveBookmarks(tmpNode); }
	if (tmpNode.children) {
		let childrenNode = tmpNode.children;
		for (let i in childrenNode) {
			childrenNode[i] = moveAllBookmarks(childrenNode[i]);
		};
		tmpNode.children = childrenNode;
	};
	return tmpNode;
};

function moveBookmarks(tmpNode) {
	return new Promise((resolve, reject) => {
		let id = tmpNode['id'];
		let destination = { parentId: tmpNode['parentId'], index: tmpNode['index'] };
		if (destination.parentId != undefined && destination.parentId != undefined) {
			chrome.bookmarks.move(id, destination, () => {
				resolve();
			});
		} else {
			resolve();
		}
	});
};

function sumFolderVisitPoint(tmpNode) {
	let nodeAndvisitPoint = {
		node: node,
		visitPoint: 0
	};
	if (tmpNode.children) {
		let childrenNode = tmpNode.children;
		let foldervisitPoint = 0;
		for (let i in childrenNode) {
			nodeAndvisitPoint = sumFolderVisitPoint(childrenNode[i]);
			childrenNode[i] = nodeAndvisitPoint.node;
			foldervisitPoint = foldervisitPoint + nodeAndvisitPoint.visitPoint;
		};
		tmpNode.children = childrenNode;
		tmpNode.visitPoint = foldervisitPoint;
	}
	nodeAndvisitPoint.visitPoint = tmpNode.visitPoint;
	nodeAndvisitPoint.node = tmpNode;
	return nodeAndvisitPoint;
};