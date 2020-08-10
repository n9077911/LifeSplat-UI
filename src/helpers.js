export function formatMoney(number) {
    return '£' + Math.round(number).toLocaleString()
}

export function last(array) {
    return array[array.length - 1];
}

export function displayConstants() {
    return {
        fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'"
    }
}