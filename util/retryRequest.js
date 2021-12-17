const config = {
    retryCount: 3
}

const request = require('./request')

const retryRequest = {
    config,
    async get(param) {
        let retryIndex = 0
        do {
            result = await request.get(param)
            if (result.code == 0)
                return result
            retryIndex++
        } while (retryIndex < config.retryCount)
        return { code: 10010, msg: 'retryed count is ' + config.retryCount, error: JSON.stringify(result) }
    },
    async post(param) {
        let retryIndex = 0
        do {
            result = await request.post(param)
            if (result.code == 0)
                return result
            retryIndex++
        } while (retryIndex < config.retryCount)
        return { code: 10010, msg: 'retryed count is ' + config.retryCount, error: JSON.stringify(result) }
    }
}
module.exports = retryRequest