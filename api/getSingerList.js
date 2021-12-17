const retryRequest = require('../util/retryRequest')
const { Singer } = require('../model/Singer')
const parseSinger = async (data) => {
    let singers = []
    for (let index in data) {
        let item = data[index]
        let singer = new Singer()
        singer.id = item.singer_id
        singer.name = item.singer_name
        singer.mid = item.singer_mid
        //singer.pic = item.singer_pic
        singers.push(singer)
    }
    return singers
}

module.exports = async (ctx, next) => {
    const pageIndex = ctx.query.pageIndex || 1
    const pageSize = ctx.query.pageSize || 80
    let api = {
        method: 'get_singer_list',
        module: 'Music.SingerListServer',
        param: { "area": -100, "sex": -100, "genre": -100, "index": -100, "sin": 0, "cur_page": 1 }
    }
    api.param.cur_page = pageIndex
    api.param.sin = (pageIndex - 1) == 0 ? 0 : (pageIndex - 1) * pageSize
    let result = await retryRequest.get(api)
    if (result.code == 0 && result.data.singerlist && result.data.singerlist.length > 0) {
        let singers = await parseSinger(result.data.singerlist)
        result.total = result.data.total
        result.data = singers
        return result
    } else if (result.code == 0)
        return { code: -1, msg: 'falid result is empty' }
    return result
}