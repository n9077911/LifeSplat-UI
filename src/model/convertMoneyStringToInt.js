export default function convertMoneyStringToInt(s) {
    if(s === undefined)
        return 0
    if(s.match(/^\d+[kK]$/))
        return parseInt(s.slice(0, -1)) * 1000
    return parseInt(s || '0');
}