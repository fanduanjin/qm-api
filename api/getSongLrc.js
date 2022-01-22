const baseRetryRequest = require('../util/baseRetryRequest')

const config = {
    lrcUrl: 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?format=json'
}


module.exports = async (songmid) => {
    if (!songmid)
        return { code: 10003, msg: 'required parameter [songmid]' }
    let url = config.lrcUrl + '&songmid=' + songmid
    let result = await baseRetryRequest.get(url, { retcode: 0, code: 0 }, 'lyric')
    return result.data || ''
}