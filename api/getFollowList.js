const request = require('../util/request')
const baseRetryRequest = require('../util/baseRetryRequest')
const objectUtil = require('../util/objectUtil')
const { FollowType } = require('../enum/FollowType')
const { Song } = require('../model/Song')
const { Album } = require('../model/Album')
const { SongOrder } = require('../model/SongOrder')

const parseSongList = async (songList) => {
    for (let index in songList) {
        let item = songList[index].data
        let song = new Song()
        song.id = item.songid
        song.mid = item.songmid
        song.title = item.songname
        songList[index] = song
    }
    return songList
}

const parseAlbums = async (albums) => {
    for (let index in albums) {
        let item = albums[index]
        let album = new Album()
        album.id = item.albumid
        album.mid = item.albummid
        album.name = item.albumname
        albums[index] = album
    }
    return albums
}

const parseSongOrderList = async (songOrders) => {
    for (let index in songOrders) {
        let item = songOrders[index]
        let songOrder = new SongOrder()
        songOrder.id = item.dissid
        songOrder.name = item.dissname
        songOrder.uin = item.uin
        songOrder.encryptUin = item.encrypt_uin
        songOrder.createTime = item.createtime
        songOrders[index] = songOrder
    }
    return songOrders
}


module.exports = async (ctx, next) => {
    let followType = ctx.query.followType || 1
    let uin = ctx.query.uin
    let pageSize = ctx.query.pageSize || 10
    let pageIndex = ctx.query.pageIndex || 1
    let ein = pageIndex * pageSize
    let sin = (pageIndex - 1) * pageSize
    if (!uin)
        return { code: request.statusCode.missingParameter, msg: 'parameter is require uin' }

    let url = 'https://c.y.qq.com/fav/fcgi-bin/fcg_get_profile_order_asset.fcg?cv=4747474&ct=20&format=json&inCharset=utf-8&outCharset=utf-8&cid=205360956&userid=' + uin
        + '&reqtype=' + followType
        + '&sin=' + sin
        + '&ein=' + ein

    let result
    switch (parseInt(followType)) {
        case FollowType.Song:
            result = await baseRetryRequest.get(url, { code: 0, subcode: 0 }, 'data')
            result.total = result.data.totalsong
            let songList = result.data.songlist
            if (!songList || songList.length == 0) {
                result.code = request.statusCode.emptyData
                result.msg = 'result is empty'
            }
            songList = await parseSongList(songList)
            result.data = songList
            break
        case FollowType.Album:
            result = await baseRetryRequest.get(url, { code: 0, subcode: 0 }, 'data')
            result.total = result.data.totalalbum
            let albumList = result.data.albumlist
            if (!albumList || albumList.length == 0) {
                result.code = request.statusCode.emptyData
                result.msg = 'result is empty'
            }
            albumList = await parseAlbums(albumList)
            result.data = albumList
            break
        case FollowType.CdList:
            result = await baseRetryRequest.get(url, { code: 0, subcode: 0 }, 'data')
            result.total = result.data.totaldiss
            let cdList = result.data.cdlist
            if (!cdList || cdList.length == 0) {
                result.code = request.statusCode.emptyData
                result.msg = 'result is empty'
            }
            cdList = await parseSongOrderList(cdList)
            result.data = cdList
            break
        default:
            result = { code: request.statusCode.faild, msg: 'parameter {followType} is faild' }
    }
    return result
}
