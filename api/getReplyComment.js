//RankType 0时间 1热门
const { Comment } = require('../model/Comment')
const retryRequest = require('../util/retryRequest')

const parseComment = (data, rootCmId) => {
    let comments = []
    for (let index in data) {
        let item = data[index]
        let comment = new Comment()
        comment.rootCmId = rootCmId
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
        let repliedComment = item.RepliedComments
        if (repliedComment) {
            let repliedCommentCmId = repliedComment[0].CmId
            comment.repliedCommentCmId = repliedCommentCmId
        }
        comments.push(comment)
    }
    return comments
}

module.exports = async (ctx, next) => {
    const rootCmId = ctx.query.rootCmId
    const lastSeqNo = ctx.query.lastSeqNo
    //const LastRankScore = ctx.query.lastRankScore
    //const RankType = ctx.query.RankType
    if (!rootCmId)
        return { code: 10003, msg: 'required parameter [rootCmId]' }
    let api = {
        method: 'GetReplyCommentList',
        module: 'music.globalComment.CommentReadServer',
        param: {
            //1!4EynU9ZG8T8DG2U2i-FCyw3xKBdDpEqBEVefdUKTdfa2RtbWcoMJIWlt0SINKwkL
            "RootCmId": "",
            "LastCommentSeqNo": "",
            "PageSize": 10
            //"LastRankScore": "0",
            //"RankType": 0
        }
    }
    api.param.RootCmId = rootCmId
    api.param.LastCommentSeqNo = lastSeqNo
    let result = await retryRequest.get(api)
    if (result.code == 0 && result.data.CommentList.Comments && result.data.CommentList.Comments.length > 0) {
        let comments = await parseComment(result.data.CommentList.Comments, rootCmId)
        result.total = result.data.CommentList.Total
        result.data = comments
        return result
    } else if (result.code == 0)
        return { code: -1, msg: 'falid result num is empty' }
    else
        return result
}