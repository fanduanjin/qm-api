const md5 = require('js-md5')
const config = {
    maxLen: 16,
    minLen: 10,
    prefix: 'zza',
    encNonce: 'CJBPACrRuNy7',
    chars: '0123456789abcdefghijklmnoqprstuvwxyz'
}

const qqEncrypt = {
    randomStr() {
        let result = '';
        let length = parseInt(Math.random() * (config.maxLen - config.minLen + 1) + config.minLen, 10);
        for (var i = length; i > 0; --i) result += config.chars[Math.floor(Math.random() *config.chars.length)];
        return result;
    },
    sign(param) {
        let sign = config.prefix + this.randomStr() + md5(config.encNonce + param)
        return sign
    }
}
module.exports = qqEncrypt