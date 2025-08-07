const log = require("./logger.js");

function shorten_number(number, decimalPlaces = 1) {
    
    if (typeof number === 'string') number = parseFloat(number);
    if (typeof number !== 'number' || isNaN(number)) return '0';
    if (number === 0) return '0';

    const suffixes = ['', 'k', 'M', 'B', 'T', 'Q'];
    const absNumber = Math.abs(number);
    
    const suffixIndex = absNumber >= 1 
        ? Math.min(
            Math.floor(Math.log10(absNumber) / 3),
            suffixes.length - 1
          )
        : 0;

    const divisor = suffixIndex > 0 ? Math.pow(1000, suffixIndex) : 1;
    let value = number / divisor;

    if (value >= 999.9999999999999 && suffixIndex < suffixes.length - 1) {
        value /= 1000;
        return (value.toFixed(decimalPlaces).replace(/(?:\.0+|(\.[0-9]*?)0+)$/, '$1') 
                + suffixes[suffixIndex + 1]);
    }

    let formatted = value.toFixed(decimalPlaces)
                       .replace(/(?:\.0+|(\.[0-9]*?)0+)$/, '$1');

    return formatted + suffixes[suffixIndex];
}

module.exports = shorten_number;