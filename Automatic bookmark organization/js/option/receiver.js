chrome.runtime.onMessage.addListener(
    function (request, sender, callback) {  // 1
        callback(request.message + '確認');

        switch (request.term) {
            case 'none':
                term = 1
                break;
            case 'low':
                term = 2
                break;
            case 'middle':
                term = 3
                break;
            case 'high':
                term = 4
                break;
            default:
        }

        switch (request.decreasePercentage) {
            case 'none':
                decreasePercentage = 1
                break;
            case 'low':
                decreasePercentage = 0.9
                break;
            case 'middle':
                decreasePercentage = 0.5
                break;
            case 'high':
                decreasePercentage = 0.1
                break;
            default:
        }

        return true;
    }
);