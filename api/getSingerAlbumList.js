const { Album } = require('../model/Album')
const retryRequest = require('../util/retryRequest')

const parseAlbums = async (data) => {
    let albums = []
    for (let index in data) {
        let item = data[index]
        let album = new Album()
        album.id = item.albumID
        album.mid = item.albumMid
        album.name = item.albumName
        //album.albumType=item.albumType
        albums.push(album)
    }
    return albums
}

module.exports = async (ctx, next) => {
    const singerMid = ctx.query.singerMid
    const pageIndex = ctx.query.pageIndex || 1
    const pageSize = ctx.query.pageSize || 5
    if (!singerMid)
        return { code: 10003, msg: 'required parameter [singerMid]' }
    let api = {
        "method": "GetAlbumList",
        "param": {
            "singerMid": "",
            "order": 0,
            "begin": 0,
            "num": 5,
            "songNumTag": 0,
            "singerID": 0
        },
        "module": "music.musichallAlbum.AlbumListServer"
    }
    api.param.singerMid = singerMid
    api.param.num = pageSize
    api.param.begin = (pageIndex - 1) == 0 ? 0 : (pageIndex - 1) * pageSize
    let result = await retryRequest.get(api)
    if (result.code == 0 && result.data.albumList && result.data.albumList.length > 0) {
        let albums = await parseAlbums(result.data.albumList)
        let total = result.data.total
        result.data = albums
        result.total = total
    } else if (result.code == 0) {
        return { code: -1, msg: 'result is empty' }
    }
    return result
}
