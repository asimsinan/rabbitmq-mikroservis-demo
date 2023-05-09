const jwt = require('jsonwebtoken');

const dogrulama = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ "mesaj": 'Token eklenmedi' });
    }
    try {
        jwt.verify(token, 'secret', (err, kullanici) => {
            if (err) {
                return res.status(401).json({ "mesaj": 'Token geçersiz' });
            }
            req.user = kullanici;
            next();
        });
    } catch (err) {
        res.status(401).json({ "mesaj": 'Token geçersiz' });
    }
}

module.exports = dogrulama;