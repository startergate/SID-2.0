exports.checkExist = (conn, targetDB, targetName, targetValue, callback) => {
  targetDB = conn.escape(targetDB).split("'").join('');
  targetName = conn.escape(targetName).split("'").join('');
  targetValue = conn.escape(targetValue);
  try {
    const sql = 'SELECT * FROM ' + targetDB + ' WHERE ' + targetName + ' = ' + targetValue;
    conn.query(sql, (error, result, field) => {
      if (error) {
        callback(false); // eslint-disable-line
        return;
      }
      if (result.length > 0) {
        callback(true); // eslint-disable-line
        return;
      }
      callback(false); // eslint-disable-line
    });
  } catch (e) {
    callback(false); // eslint-disable-line
  }
};

exports.randomString = (length) => {
  const character = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomStr = '';
  let loopNum = length;
  while (loopNum) {
    randomStr += character[Math.floor(Math.random() * character.length)];
    loopNum -= 1;
  }

  return randomStr;
};

exports.jsonChecker = (_json, variablesArray, isMustFilled) => {
  if (!Array.isArray(variablesArray) || !Array.isArray(isMustFilled)) {
    throw new TypeError('Input Data is not an array');
  }
  if (typeof _json !== 'object') {
    throw new TypeError('Input Data is not an object');
  }
  let cnt = 0;
  for (const data in _json) {
    const targetIndex = variablesArray.indexOf(data);
    if (targetIndex === -1) continue;
    if (!(_json[data] || !isMustFilled[targetIndex])) return 0;

    cnt++;
  }
  if (cnt !== variablesArray.length) return 0;
  for (const variable in variablesArray) {
    if (!Object.prototype.hasOwnProperty.call(_json, variablesArray[variable])) return 0;
  }
  return 1;
};
