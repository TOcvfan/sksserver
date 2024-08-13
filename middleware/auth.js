'use strict'
function headersAuth(req, res, jwt, hvisFunktion, auth) {

    const response = (reply, status) => res.status(status).send(reply);

    if (req.headers && req.headers.authorization) {
        var authorization = req.headers.authorization.split(' ')[1],
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.SECRET_OR_KEY);
        } catch (e) {
            return response({ message: 'unauthorized ' + e, error: true }, 401);
        }

        hvisFunktion(decoded) ? auth = true : auth = false;
    } else {
        return response({ message: 'token mangler', error: true }, 403);
    }
    return auth;
}

module.exports = headersAuth
