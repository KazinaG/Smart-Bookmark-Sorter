let sleepSec = 0.1;
let processList = [];
let isProcessing = false;
let node;
const conf_key = 'configuration';

//#region 
let term = 24;
let term_none = 0;
let term_short = 24; // 1 day
let term_middle = 168; // 1 week
let term_long = 720; // about 1 month
//#endregion

//#region 
let decreasePercentage = 0.9;
let decreasePercentage_none = 1;
let decreasePercentage_low = 0.9;
let decreasePercentage_middle = 0.5;
let decreasePercentage_high = 0.1;
//#endregion

//#region processType
const typeInitialize = 'initialize';
//#endregion processType