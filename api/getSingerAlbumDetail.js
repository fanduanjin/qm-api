const retryRequest = require('../util/retryRequest')
const axios = require('axios')
const { Album } = require('../model/Album')
const md5 = require('js-md5')
const { Singer } = require('../model/Singer')
//https://c.y.qq.com/v8/fcg-bin/musicmall.fcg?_=1639455493747&cv=4747474&ct=24&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=yqq.json&needNewCode=1&uin=0&g_tk_new_20200303=5381&g_tk=5381&cmd=get_album_buy_page&albummid=001hGx1Z0so1YX&albumid=0

const parseAlbum = (data) => {
    let album = new Album()
    album.id = parseInt(data.album_id)
    album.mid = data.album_mid
    album.name = data.album_name
    album.companyName = data.companyname
    album.desc = md5(data.desc)
    album.price = data.price
    if (data.headpiclist && data.headpiclist.length > 0) {
        album.pic = data.headpiclist[0].picurl
    }
    album.publicTime = data.publictime
    album.sellCount = data.soldcount
    for (let index in data.singerinfo) {
        let item = data.singerinfo[index]
        let singer = new Singer()
        singer.id = item.singerid
        singer.mid = item.singermid
        singer.name = item.singername
    }
    return album
}

module.exports = async (ctx, next) => {
    const albumMid = ctx.query.albumMid
    if (!albumMid)
        return { code: 10003, msg: 'required parameter [albumMid]' }
    let url = 'https://c.y.qq.com/v8/fcg-bin/musicmall.fcg?format=json&inCharset=utf-8&outCharset=utf-8&cmd=get_album_buy_page&albummid='
    url += albumMid
    let retryIndex = 0
    do {
        let result = await axios.get(url)
        if (result.code != 0) {
            retryIndex++

        } else if (result.code == 0 && result.data) {
            let album = await parseAlbum(result.data)
            result.data = album
            return result
        }
        continue
    } while (retryIndex < retryRequest.config.retryCount)
    return { code: -1, msg: 'faild' }
}
