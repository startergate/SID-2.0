exports.rootRequest = (req, res, next) => {
    var output = {
        type: 'error',

        is_vaild: false,
        description: 'Request to ROOT directory of api is prohibited'
    };
    res.status(400);
    res.send(output);
};
