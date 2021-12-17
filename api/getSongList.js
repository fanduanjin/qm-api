const { Song } = require('../model/Song')
const { Singer } = require('../model/Singer')
const retryRequest = require('../util/retryRequest')

const parseSong = async (data) => {
    let songs = []
    for (let index in data) {
        let item = data[index]
        let song = new Song()
        let songInfo = item.songInfo
        song.id = songInfo.id
        song.type = songInfo.type
        song.mid = songInfo.mid
        song.name = songInfo.name
        song.title = songInfo.title
        song.subTitle = songInfo.subtitle
        songs.push(song)
    }
    return songs
}

module.exports = async (ctx, next) => {
    const singerMid = ctx.query.singerMid
    const pageIndex = ctx.query.pageIndex || 1
    const pageSize = ctx.query.pageSize || 10
    if (!singerMid)
        return { code: 10003, msg: 'required parameter [singerMid]' }
    let api = {
        method: 'GetSingerSongList',
        module: 'musichall.song_list_server',
        param: { "order": 1, "singerMid": null, "begin": 0, "num": 10 }
    }
    api.param.singerMid = singerMid
    api.param.num = pageSize
    api.param.begin = (pageIndex - 1) == 0 ? 0 : (pageIndex - 1) * pageSize
    let result = await retryRequest.get(api)
    if (result.code == 0 && result.data && result.data.songList && result.data.songList.length > 0) {
        let songs = await parseSong(result.data.songList)
        result.total = result.data.totalNum
        result.data = songs
        return result
    } else if (result.code == 0)
        return { code: -1, msg: 'falid result num is empty' }
    else
        return result
}