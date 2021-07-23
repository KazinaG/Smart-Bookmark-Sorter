let sleepSec = 0.1;

let term = 24;
let decreasePercentage = 0.9;
let sortTarget = { isBar: true, isMobile: false, isOther: false };
let sortOrder = ["visitPoint", "folder", "title", "url"];

let processList = [];
let isProcessing = false;
let node;

let deleteSuggestionTargets = [];
let tempDeleteSuggestionTargets = [];
let deleteSuggestionTargetsLength = 0;