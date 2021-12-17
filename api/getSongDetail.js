const { Song } = require('../model/Song')
const { Singer } = require('../model/Singer')
const getSongLrc = require('./getSongLrc')
const getSongMedialUrl = require('./getSongMedialUrl')
const retryRequest = require('../util/retryRequest')
const md5 = require('js-md5')

const parseSongInfo = async (data) => {
    if (!data)
        return null
    let song = new Song()
    //解析properties
    song.properties = []
    for (let key in data.info) {
        let item = data.info[key]
        song.properties.push({ key: item.title, value: item.content[0].value })
    }
    //解析 extra
    song.extraName = data.extras.subtitle
    //开始解析剩下信息
    let track_info = data.track_info
    song.id = track_info.id
    song.mid = track_info.mid
    song.title = track_info.title || track_info.name
    song.subTitle = track_info.subtitle
    song.singers = []
    for (let index in track_info.singer) {
        let item = track_info.singer[index]
        let singer = new Singer()
        singer.id = item.id
        singer.mid = item.mid
        singer.name = item.name
        song.singers.push(singer)
    }
    if (track_info.album) {
        song.albumId = track_info.album.id
        song.albumMid = track_info.album.mid
    }
    if (track_info.mv) {
        song.mvId = track_info.mv.id
        song.mvMid = track_info.mv.vid
    }
    song.publicTime = track_info.time_public
    return song
}

module.exports = async (ctx, next) => {
    const songMid = ctx.query.songMid
    if (!songMid)
        return { code: 10003, msg: 'required parameter [songMid]' }
    let api = {
        method: 'get_song_detail_yqq',
        module: 'music.pf_song_detail_svr',
        param: { "song_mid": "" }
    }
    api.param.song_mid = songMid
    let result = await retryRequest.get(api)
    let data = await parseSongInfo(result.data)
    let lrc = await getSongLrc(songMid)
    let mediaUrl = await getSongMedialUrl(songMid)

    if (result.code == 0) {
        data.lrc = md5(lrc)
        data.mediaUrl = mediaUrl
        result.data = data
    }
    return result
}