const conf_key = 'configuration';

const typeAggregate = 'aggregate';

const term_none = 0;
const termSelections = [
    { display: "None", value: 0, default: false },
    { display: "Short", value: 24, default: true },
    { display: "Middle", value: 168, default: false },
    { display: "Long", value: 720, default: false }
];

let decreasePercentageSelections = [
    { display: "__MSG_none__", value: 1.0, default: false },
    { display: "__MSG_low__", value: 0.9, default: true },
    { display: "__MSG_middle__", value: 0.5, default: false },
    { display: "__MSG_high__", value: 0.1, default: false }
];

const sortLevelSelections = [
    { display: "None", value: 1.0, default: false },
    { display: "Low", value: 0.9, default: true },
    { display: "Middle", value: 0.5, default: false },
    { display: "High", value: 0.1, default: false }
];

const sortTargetList = [
    { display: "Bookmarks bar", value: true },
    { display: "Mobile bookmarks", value: false },
    { display: "Other bookmarks", value: false }
]

const sortOrderList = [
    { display: "__MSG_visit_point__", id: "visitPoint" },
    { display: "__MSG_folder__", id: "folder" },
    { display: "__MSG_title__", id: "title" },
    { display: "__MSG_url__", id: "url" }
];
