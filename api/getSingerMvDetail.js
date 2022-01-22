const axios = require('axios')
const retryRequest = require('../util/retryRequest')
const request = require('../util/request')
const qqEncrypt = require('../util/qqEncrypt')
const { Mv } = require('../model/Mv')
const { Singer } = require('../model/Singer')
const config = {
    mvUrl: 'http://mv.music.tc.qq.com/'
}
const parseMvDetailInfo = async (data, mvMid) => {

    let mvInfo = data['mvInfo']
    let mvDetailinfo = new Mv()
    let mvDetail = mvInfo.data[mvMid]
    if (!mvDetail)
        return null
    mvDetailinfo.mid = mvMid
    mvDetailinfo.pic = mvDetail.cover_pic
    mvDetailinfo.desc = mvDetail.desc
    mvDetailinfo.isFav = mvDetail.isfav
    mvDetailinfo.name = mvDetail.name
    mvDetailinfo.playCount = mvDetail.playcnt
    mvDetailinfo.publicTime = mvDetail.pubdate
    //sid 暂不清楚是什么 可能后续有用
    mvDetailinfo.type = mvDetail.type
    mvDetailinfo.singers = []
    //解析 歌手列表
    for (let index in mvDetail.singers) {
        let item = mvDetail.singers[index]
        let singer = new Singer()
        singer.id = item.id
        singer.mid = item.mid
        singer.name = item.name
        mvDetailinfo.singers.push(singer)
    }
    mvDetailinfo.uploadEncuin = mvDetail.uploader_encuin
    mvDetailinfo.uploadUin = mvDetail.uploader_uin
    //解析 mvUrl
    let mvUrl = data['mvUrl']
    if (mvUrl.code != 0 || !mvUrl.data)
        return mvDetailinfo
    mvUrl = mvUrl.data[mvMid]
    for (let index in mvUrl.mp4) {
        let item = mvUrl.mp4[index]
        let cn = item.cn
        let vkey = item.vkey
        if (!cn || !vkey)
            continue
        let url = config.mvUrl + vkey + '/' + cn
        mvDetailinfo.url = url
    }
    return mvDetailinfo
}


module.exports = async (ctx, next) => {
    let mvMid = ctx.query.mvMid
    if (!mvMid)
        return { code: 10003, msg: 'required parameter [mvMid]' }
    let api = {
        "mvInfo": {
            "module": "video.VideoDataServer",
            "method": "get_video_info_batch",
            "param": {
                "vidlist": [],
                "required": [
                    "vid",
                    "type",
                    "sid",
                    "cover_pic",//封面图
                    "singers",
                    //"new_switch_str",
                    //"video_pay",
                    //"code",
                    //"msg",
                    "name",
                    "desc",
                    "playcnt",//播放次数
                    "pubdate",//发布时间
                    "isfav",
                    //"fileid",
                    //"pay",
                    //"pay_info",
                    "uploader_headurl",
                    "uploader_nick",
                    "uploader_uin",
                    "uploader_encuin"
                ]
            }
        },
        "mvUrl": {
            "module": "music.stream.MvUrlProxy",
            "method": "GetMvUrls",
            "param": {
                "vids": []
            }
        }
    }
    api.mvInfo.param.vidlist.push(mvMid)
    api.mvUrl.param.vids.push(mvMid)
    let retryIndex = 0;
    let result
    do {
        url = axios.defaults.baseURL
        api.comm = request.getCommParam()
        let data = JSON.stringify(api)
        url += 'sign=' + qqEncrypt.sign(data)
        result = await axios.post(url, data)

        if (result.code != 0) {
            retryIndex++
            continue
        }
        let mvDetailinfo = await parseMvDetailInfo(result.data, mvMid)
        if (mvDetailinfo)
            return { code: 0, msg: 'successful', data: mvDetailinfo }
        else {
            retryIndex++
            result = { code: -1, msg: 'faild' }
        }

    } while (retryIndex < retryRequest.config.retryCount)
    return result
}


/*
"required": [
                    "vid",
                    "type",
                    "sid",
                    "cover_pic",//mv封面
                    "duration",视频时长
                    "singers",
                    "new_switch_str",
                    "video_pay",
                    "hint",
                    "code",
                    "msg",
                    "name",
                    "desc",
                    "playcnt",
                    "pubdate",
                    "isfav",
                    "fileid",
                    "filesize",
                    "pay",
                    "pay_info",
                    "uploader_headurl",
                    "uploader_nick",
                    "uploader_uin",
                    "uploader_encuin"
                ]
*/