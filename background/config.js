let term = 24;
let decreasePercentage = 0.9;
let sortTarget = { isBar: true, isMobile: false, isOther: false };
let sortOrder = ["visitPoint", "folder", "title", "url"];

let node;

let deleteSuggestionTargets = [];
let tempDeleteSuggestionTargets = [];
let deleteSuggestionTargetsLength = 0;

const runtime_state_key = 'runtimeState';
let aggregateEnqueueTask = Promise.resolve();
let isAggregateProcessing = false;
let runtimeStateTask = Promise.resolve();
