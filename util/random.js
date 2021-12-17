module.exports={
    randomLen(m, n) {
        //获取 10-16 随机数 
        let len = Math.round(Math.random() * (m - n) + n)
        let result = ''
        for (i = 0; i < len; i++) {
            result += Math.round(Math.random() * 10);
        }
        return parseInt(result)
    },
}