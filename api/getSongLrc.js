const axios = require('axios')
const retryRequest = require('../util/retryRequest')

const config = {
    lrcUrl: 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?format=json'
}


module.exports = async (songmid) => {
    if (!songmid)
        return { code: 10003, msg: 'required parameter [songmid]' }
    let url = config.lrcUrl + '&songmid=' + songmid
    let retryIndex = 0;
    do {
        let result = await axios.get(url)
        if (result.code != 0) {
            retryIndex++
            continue
        }
        return result.data
    } while (retryIndex < retryRequest.config.retryCount)
    return ''
}