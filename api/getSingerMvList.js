const { Mv } = require('../model/Mv')
const retryRequest = require('../util/retryRequest')

const parseMvs = async (data) => {
    let mvs = []
    for (let index in data) {
        let item = data[index]
        let mv = new Mv()
        mv.id = item.mvid
        mv.mid = item.vid
        mv.name = item.title
        mvs.push(mv)
    }
    return mvs
}

module.exports = async (ctx, next) => {
    const singerMid = ctx.query.singerMid
    const pageIndex = ctx.query.pageIndex || 1
    const pageSize = ctx.query.pageSize || 10
    if (!singerMid)
        return { code: 10003, msg: 'required parameter [singerMid]' }
    let api = {
        "method": "GetSingerMvList",
        "param": {
            "singermid": "0025NhlN2yWrP4",
            "count": 20,
            "start": 0,
            "order": 1
        },
        "module": "MvService.MvInfoProServer"
    }
    api.param.singermid = singerMid
    api.param.count = pageSize
    api.param.begin = (pageIndex - 1) == 0 ? 0 : (pageIndex - 1) * pageSize
    let result = await retryRequest.get(api)
    if (result.code == 0 && result.data.list && result.data.list.length > 0) {
        let mvs = await parseMvs(result.data.list)
        result.data = mvs
        result.total = result.data.total
        return result
    }
    else if (result.code == 0)
        return { code: -1, msg: 'faild result is empty' }
    else
        return result

}