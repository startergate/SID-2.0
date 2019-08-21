exports.checkExist = (conn, targetDB, targetName, targetValue, callback) => {
    console.log(targetDB);
    targetDB = conn.escape(targetDB).split("'").join('');
    targetName = conn.escape(targetName).split("'").join('');
    targetValue = conn.escape(targetValue);
    try {
        const sql = "SELECT * FROM " + targetDB + " WHERE " + targetName + " = " + targetValue;
        console.log(sql);
        conn.query(sql, (error, result, field) => {
            if (error) {
                callback(false);
                return;
            }
            if (result.length > 0) {
                callback(true);
                return;
            }
            callback(false);
        });
    } catch (e) {
        callback(false);
    }
};

exports.randomString = (length) => {
    const character = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let random_str = '';
    let loopNum = length;
    while (loopNum) {
        random_str += character[Math.floor(Math.random() * character.length)];
        loopNum -= 1;
    }

    return random_str;
};

exports.jsonChecker = (_json, variablesArray, isMustFilled) => {
    if (!Array.isArray(variablesArray) || !Array.isArray(isMustFilled)) {
        throw new TypeError('Input Data is not an array');
    }
    if (typeof _json !== 'object') {
        throw new TypeError('Input Data is not an object');
    }
    let cnt = 0;
    for (let data in _json) {
        if (!variablesArray.hasOwnProperty(data)) continue;
        if (variablesArray.indexOf(data) === -1) continue;
        if (!(_json[data] || !isMustFilled[cnt])) return 0;

        cnt++;
    }
    if (cnt !== variablesArray.length) return 0;
    for (let variable in variablesArray) {
        if (!Object.prototype.hasOwnProperty.call(_json, variablesArray[variable])) return 0;
    }
    return 1;
};