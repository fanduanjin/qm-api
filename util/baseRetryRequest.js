const request = require('./request')
const retryRequest = require('./retryRequest')
const instance = request.baseRequest
const objectUtil = require('./objectUtil')
const baseRetryRequest = {
    /**
     * 
     * @param {*} url 
     * @param {必要参数 用来判断请求是否成功 } condition 
     * @param {根据 object.faild 方式获取返回值}
     * @returns 
     */
    async get(url, condition, resultKeyStr) {
        let result
        let retryIndex = 0
        let isSuccess = true
        do {
            result = await instance.get(url)
            for (let key in condition) {
                isSuccess = condition[key] == result[key]
                if (isSuccess == false)
                    break
            }
            if (isSuccess)
                break
            retryIndex++
        } while (retryIndex < retryRequest.config.retryCount);
        if (isSuccess) {
            return { code: request.statusCode.success, data: objectUtil.getValueByStr(result, resultKeyStr) }
        } else if (!isSuccess && retryIndex == retryRequest.config.retryCount) {
            return { code: request.statusCode.faild, msg: 'retryCount is ' + retryIndex }
        } else {
            return { code: request.statusCode.faild, msg: 'request is faild' }
        }
    },
    async post(url, data, condition, resultKeyStr) {
        let result
        let retryIndex = 0
        let isSuccess = true
        do {
            result = await instance.post(url, data)
            for (let key in condition) {
                isSuccess = condition[key] == result[key]
                if (isSuccess == false)
                    break
            }
            if (isSuccess)
                break
            retryIndex++
        } while (retryIndex < retryRequest.config.retryCount);
        if (isSuccess) {
            return { code: request.statusCode.success, data: objectUtil.getValueByStr(result, resultKeyStr) }
        } else if (!isSuccess && retryIndex == retryRequest.config.retryCount) {
            return { code: request.statusCode.faild, msg: 'retryCount is ' + retryIndex }
        } else {
            return { code: request.statusCode.faild, msg: 'request is faild' }
        }
    }

}

module.exports = baseRetryRequest