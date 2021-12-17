const retryRequest = require('../util/retryRequest')
const mediaHost = 'http://dl.stream.qqmusic.qq.com/'
const random = require('../util/random')


module.exports = async (songmid) => {
    if (!songmid)
        return { code: 10003, msg: 'required parameter [songmid]' }
    let api = {
        method: 'CgiGetVkey',
        module: 'vkey.GetVkeyServer',
        param: { "guid": '', "songmid": [], "songtype": [0], "uin": "786793542", "loginflag": 1, "platform": "20" }
    }
    api.param.songmid.push(songmid)
    api.param.guid = '' + random.randomLen(9, 9)
    let result = await retryRequest.post(api)
    if (result.code != 0) {
        return ''
    }
    let medialUrl = result.data.midurlinfo[0].purl
    if (!medialUrl)
        return ''
    return mediaHost + medialUrl
}
