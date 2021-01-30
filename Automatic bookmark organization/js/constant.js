let bookmarkMoveWaitCount = 0;
let sleepSec = 0.1;
let processList = [];
let isProcessing = false;
let node;
const key = 'key';

//#region processType
const typeInitialize = 'initialize';
const typeOnCreated = 'onCreated';
const typeOnRemoved = 'onRemoved';
//#endregion processType