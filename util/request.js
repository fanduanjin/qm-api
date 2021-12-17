const axios = require('axios')
const qqEncrypt = require('./qqEncrypt')
const random = require('./random')
const api = require('../api')
const group = 'req';
axios.defaults.baseURL = 'https://u.y.qq.com/cgi-bin/musics.fcg?'
axios.defaults.headers.common['referer'] = 'https://y.qq.com/'
axios.interceptors.response.use(function (res) {
    console.log(res.data)
    if (res.data.retcode == 0 && res.data.code == 0)
        //歌词接口相应数据
        return { code: 0, msg: 'sucessful', data: res.data.lyric }
    else if (res.data.code == 0 && res.data.subcode == 0 && res.data.default == 0)
        //albumDetail接口响应数据
        return { code: 0, msg: 'sucessful', data: res.data.data }
    else if (res.data.code != 0 || (res.data[group] && res.data[group].code != 0))
        return { code: 10000, msg: 'debug error code:' + res.data.code }
    else if (res.data.code == 0 && !res.data[group]) {
        //非正常请求 如 多个group
        return { code: 0, msg: 'sucessful', data: res.data }
    }
    return { code: 0, msg: 'sucessful', data: res.data[group].data }
}, function (error) {
    console.error(error)
    // 对请求错误做些什么  {"statusCode":500,"code":"ENOTFOUND","error":"Internal Server Error","message":"getaddrinfo ENOTFOUND u.y.qq.com"}
    return { code: -1, error: 'Internal Server Error', msg: error.code || ' ' + error.syscall || ' ' + error.hostname || '' }
});

const request = {
    req: axios.create(),
    getCommParam() {
        let comm = { ct: 24, cv: random.randomLen(7, 4) }
        return comm
    },
    async get(param) {
        url = axios.defaults.baseURL
        data = {
            comm: this.getCommParam()
        }
        data[group] = param
        data = JSON.stringify(data)
        url += 'data=' + data + '&sign=' + qqEncrypt.sign(data)
        console.log(url)
        return axios.get(url).then(res => {
            return res
        }).catch((err) => {
            return err
        })
    },
    async post(param) {
        url = axios.defaults.baseURL
        data = {
            comm: this.getCommParam()
        }
        data[group] = param
        data = JSON.stringify(data)
        url += 'sign=' + qqEncrypt.sign(data)
        console.log(url)
        console.log(JSON.stringify(data))
        return axios.post(url, data, {
            headers: { "content-type": "application/json" }
        }).then(res => {
            return res
        }).catch((err) => {
            return err
        })
    }
}


module.exports = request