const request = require('../util/request')
const baseRetryRequest = require('../util/baseRetryRequest')
const objectUtil = require('../util/objectUtil')
const { FollowType } = require('../enum/FollowType')
const { Song } = require('../model/Song')
const { Album } = require('../model/Album')
const { SongOrder } = require('../model/SongOrder')
const { Mv } = require('../model/Mv')

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

const parseMvList = async (mvlist) => {
    for (let index in mvlist) {
        let item = mvlist[index]
        let mv = new Mv()
        mv.mid == item.mid
        mv.id = item.id
        mv.name = item.mv_name
        mv.singers = item.singer
        mv.uploadEncuin = item.uploader_encuin
        mv.publicTime = item.publish_date
        mv.playCount = item.playcount
        mvlist[index] = mv
    }
    return mvlist
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
            if (result.code != request.statusCode.success) {
                result.msg = 'faild'
                break
            }
            let songList = result.data.songlist
            result.total = result.data.totalsong
            songList = await parseSongList(songList)
            result.data = songList
            break
        case FollowType.Album:
            result = await baseRetryRequest.get(url, { code: 0, subcode: 0 }, 'data')
            result.total = result.data.totalalbum
            let albumList = result.data.albumlist
            if (result.code != request.statusCode.success) {
                result.msg = 'faild'
                break
            }
            albumList = await parseAlbums(albumList)
            result.data = albumList
            break
        case FollowType.CdList:
            result = await baseRetryRequest.get(url, { code: 0, subcode: 0 }, 'data')
            result.total = result.data.totaldiss
            let cdList = result.data.cdlist
            if (result.code != request.statusCode.success) {
                result.msg = 'faild'
                break
            }
            cdList = await parseSongOrderList(cdList)
            result.data = cdList
            break
        case FollowType.Mv:
            url = 'https://c.y.qq.com/mv/fcgi-bin/fcg_get_myfav_mv.fcg?reqtype=1&support=1&cid=205361447&encuin=' +
                uin + '&num=' + sin + '&pagesize=' + pageSize
            result = await baseRetryRequest.get(url, { code: 0, subcode: 0 })
            if (result.code == request.statusCode.success) {
                result.total = result.data.total
                //格式化返回模型
                result.data = await parseMvList(result.data.mvlist)
            }
            break
        default:
            result = { code: request.statusCode.faild, msg: 'parameter {followType} is faild' }
    }
    return result
}
