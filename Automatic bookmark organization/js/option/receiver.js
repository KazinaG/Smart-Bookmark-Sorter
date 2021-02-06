chrome.runtime.onMessage.addListener(
    function (request, sender, callback) {  // 1
        callback(request.message + '確認');

        switch (request.term) {
            case 'none':
                term = term_none
                break;
            case 'short':
                term = term_short
                break;
            case 'middle':
                term = term_middle
                break;
            case 'long':
                term = term_long
                break;
            default:
        }

        switch (request.decreasePercentage) {
            case 'none':
                decreasePercentage = decreasePercentage_none
                break;
            case 'low':
                decreasePercentage = decreasePercentage_low
                break;
            case 'middle':
                decreasePercentage = decreasePercentage_middle
                break;
            case 'high':
                decreasePercentage = decreasePercentage_high
                break;
            default:
        }

        return true;
    }
);