const { Singer } = require('../model/Singer')
const md5 = require('js-md5')
const retryRequest = require('../util/retryRequest')
const parseSingerInfo = async (data) => {
    let singer = new Singer()
    //解析 basic_info
    singer.mid = data.basic_info.singer_mid
    singer.id = data.basic_info.singer_id
    singer.name = data.basic_info.name
    singer.type = data.basic_info.type
    //解析 ex_info
    let desc = data.ex_info.desc
    if (desc)
        singer.desc = md5(desc)
    singer.area = data.ex_info.area
    singer.genre = data.ex_info.genre
    singer.foreignName = data.ex_info.foreign_name
    singer.birthday = data.ex_info.birthday
    if (singer.birthday) {
        singer.birthday = singer.birthday.replace(/\//g, '-')
        //判断日期格式长度是否标准 2022-02-02  10位
        if (singer.birthday.length != 10) {
            //不标准 设置标准
            let ts = singer.birthday.split('-')
            if (ts[0].length < 4) {
                //月
                for (i = 0, l = 4 - ts[0].length; i < l; i++) {
                    ts[0] = ts[0] + 0
                }
            }else if(ts[0].length > 4){
                ts[0]=ts[0].substr(0,4)
                
            }
            if (ts[1].length != 2) {
                //月
                ts[1] = 0 + ts[1]
            }
            if (ts[2].length != 2) {
                //日
                ts[2] = 0 + ts[2]
            }
            singer.birthday = ts.join('-')
        }
    }
    if (data.wiki)
        singer.wiki = md5(data.wiki)
    //判断是否为 组合，如果是组合 解析组合信息
    if (singer.type == 2) {
        singer.team = []
        for (let index in data.group_list) {
            let item = data.group_list[index]
            let teamSinger = new Singer()
            teamSinger.id = item.singer_id
            teamSinger.name = item.name
            teamSinger.mid = item.singer_mid
            singer.team.push(teamSinger)
        }
    }
    //解析剩下信息
    singer.pic = data.pic.pic
    return singer
}


module.exports = async (ctx, next) => {

    const singerMid = ctx.query.singerMid
    if (!singerMid)
        return { code: 10003, msg: 'required parameter [singerMid]' }
    let api = {
        method: 'GetSingerDetail',
        module: 'musichall.singer_info_server',
        param: { "singer_mids": [], "ex_singer": 1, "wiki_singer": 1, "group_singer": 1, "pic": 1, "photos": 0 }
    }
    api.param.singer_mids.push(singerMid)
    let result = await retryRequest.get(api)
    if (result.code == 0 && result.data.singer_list && result.data.singer_list.length > 0) {
        result.data = await parseSingerInfo(result.data.singer_list[0])
        return result
    } else if (result.code == 0) {
        return { code: -1, msg: 'faild result is empty' }
    } else
        return result
}