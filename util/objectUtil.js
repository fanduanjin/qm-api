module.exports = {
    /**
     */
    getValueByStr(data, fields) {
        if (!data || !fields)
            return data
        var arr = fields.split('.')
        var key = arr.shift();
        var value = data[key];
        if (arr.length > 0)
            return this.getValueByStr(value, arr.join('.'))
        else {
            return value
        }
    }
}