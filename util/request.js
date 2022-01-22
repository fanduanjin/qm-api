const axios = require('axios')
const qqEncrypt = require('./qqEncrypt')
const random = require('./random')
const api = require('../api')
const group = 'req';

const statusCode = {
    emptyData: -1,
    success: 0,
    faild: 100,
    error: 200,
    missingParameter: 10001
}

const errorHandler = function (error) {
    console.error(error)
    // 对请求错误做些什么  {"statusCode":500,"code":"ENOTFOUND","error":"Internal Server Error","message":"getaddrinfo ENOTFOUND u.y.qq.com"}
    return { code: statusCode.error, error: 'Internal Server Error', msg: error.code || ' ' + error.syscall || ' ' + error.hostname || '' }
}

axios.defaults.headers.common['referer'] = 'https://y.qq.com/'
const baseRequest = axios.create()
const signRequest = axios.create()
signRequest.defaults.baseURL = 'https://u.y.qq.com/cgi-bin/musics.fcg?'
signRequest.interceptors.response.use(function (res) {
    console.log(res.data)
    if (res.data.code != 0 || (res.data[group] && res.data[group].code != 0))
        return { code: statusCode.error, msg: 'debug error code:' + res.data.code }
    else if (res.data.code == 0 && !res.data[group]) {
        //非正常请求 如 多个group
        return { code: statusCode.success, msg: 'sucessful', data: res.data }
    }
    return { code: statusCode.success, msg: 'sucessful', data: res.data[group].data }
}, errorHandler);

baseRequest.interceptors.response.use(function (res) {
    console.log(res.data)
    return res.data
}, errorHandler)

const request = {
    statusCode,
    baseRequest,
    signRequest,
    getCommParam() {
        let comm = { ct: 24, cv: random.randomLen(7, 4) }
        return comm
    },
    async get(param) {
        url = signRequest.defaults.baseURL
        data = {
            comm: this.getCommParam()
        }
        data[group] = param
        data = JSON.stringify(data)
        url += 'data=' + data + '&sign=' + qqEncrypt.sign(data)
        return signRequest.get(url).then(res => {
            return res
        }).catch((err) => {
            return err
        })
    },
    async post(param) {
        url = signRequest.defaults.baseURL
        data = {
            comm: this.getCommParam()
        }
        data[group] = param
        data = JSON.stringify(data)
        url += 'sign=' + qqEncrypt.sign(data)
        return signRequest.post(url, data, {
            headers: { "content-type": "application/json" }
        }).then(res => {
            return res
        }).catch((err) => {
            return err
        })
    }
}


module.exports = request