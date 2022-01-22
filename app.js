const api = require('./api/index')
// 加载框架并新建实例
const fastify = require('fastify')({
    logger: true
})

fastify.get('/getSongList', api.getSongList)
fastify.get('/getSingerList', api.getSingerList)
fastify.get('/getSingerDetail', api.getSingerDetail)
fastify.get('/getSongDetail', api.getSongDetail)
fastify.get('/getSingerAlbumList', api.getSingerAlbumList)
fastify.get('/getSingerMvList', api.getSingerMvList)
fastify.get('/getSingerAlbumDetail', api.getSingerAlbumDetail)
fastify.get('/getSingerMvDetail', api.getSingerMvDetail)
fastify.get('/getComment', api.getSongComment)
fastify.get('/getReplyComment', api.getReplyComment)
fastify.get('/getFollowList', api.getFollowList)
const start = async () => {
    await fastify.listen(3000)
    console.log('server started url http://localhost:3000')
}
start()