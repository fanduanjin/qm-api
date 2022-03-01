const { Comment } = require('../model/Comment')
const retryRequest = require('../util/retryRequest')

const parseComment = (data) => {
    let comments = []
    for (let index in data) {
        let item = data[index]
        let comment = new Comment()
        comment.cmId = item.CmId
        comment.praiseNum = item.PraiseNum
        comment.publicTime = item.PubTime
        comment.encryptUin = item.EncryptUin
        comment.content = item.Content
        comment.seqNo = item.SeqNo
        comment.replyCnt = item.ReplyCnt
        comment.hotScore = item.HotScore
        comment.recScore = item.RecScore
        comment.rankScore = item.RankScore
        if (item.repliedComment) {
            let repliedCommentCmId = item.repliedComment[0].CmId
            comment.repliedCommentCmId = repliedCommentCmId
        }
        comments.push(comment)
    }
    return comments
}

module.exports = async (ctx, next) => {
    const bizId = ctx.query.bizId
    const lastSeqNo = String(ctx.query.lastSeqNo)
    if (!bizId)
        return { code: 10003, msg: 'required parameter [bizId]' }
    let api = {
        method: 'GetNewCommentList',
        module: 'music.globalComment.CommentReadServer',
        param: {
            "BizType": 1, //BizType 1单曲 2专辑 3歌单 5MV
            "BizId": "",
            "LastCommentSeqNo": "",
            "PageSize": 25,
            //"PageNum": 0,
            "FromCommentId": "",
            "WithHot": 0
        }
    }
    api.param.BizId = bizId
    api.param.LastCommentSeqNo = lastSeqNo
    //api.param.PageNum = ctx.query.pageIndex ? (ctx.query.pageIndex < 1 ? 0 : ctx.query.pageIndex - 1) : 0
    let result = await retryRequest.get(api)
    if (result.code == 0 && result.data.CommentList.Comments && result.data.CommentList.Comments.length > 0) {
        let comments = await parseComment(result.data.CommentList.Comments)
        result.total = result.data.CommentList.Total
        result.data = comments
        return result
    } else if (result.code == 0)
        return { code: -1, msg: 'falid result num is empty' }
    else
        return result
}