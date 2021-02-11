//#region 
let term_none = 0;
let term_short = 24; // 1 day
let term_middle = 168; // 1 week
let term_long = 720; // about 1 month
//#endregion

//#region 
let decreasePercentage_none = 1;
let decreasePercentage_low = 0.9;
let decreasePercentage_middle = 0.5;
let decreasePercentage_high = 0.1;
//#endregion

const termSelections = [term_none, term_short, term_middle, term_long];
const decreasePercentageSelections = [decreasePercentage_none, decreasePercentage_low, decreasePercentage_middle, decreasePercentage_high];