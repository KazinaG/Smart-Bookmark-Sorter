const conf_key = 'configuration';

const typeAggregate = 'aggregate';

const term_none = 0;
const termSelections = [
    { display: "None", value: 0, default: false },
    { display: "Short", value: 24, default: true },
    { display: "Middle", value: 168, default: false },
    { display: "Long", value: 720, default: false }
];

const decreasePercentageSelections = [
    { display: "None", value: 1.0, default: false },
    { display: "Low", value: 0.9, default: true },
    { display: "Middle", value: 0.5, default: false },
    { display: "High", value: 0.1, default: false }
];

const sortTarget = [
    { display: "Bookmarks bar", value: true },
    { display: "Mobile bookmarks", value: false },
    { display: "Other bookmarks", value: false }
]

const sortOrderList = [
    { display: "Visit Point", id: "visitPoint" },
    { display: "Folder", id: "folder" },
    { display: "Title", id: "title" },
    { display: "URL", id: "url" }
];
