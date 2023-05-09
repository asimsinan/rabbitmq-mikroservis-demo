const Router = require('express').Router;
const router = new Router();
const Kullanici = require('../models/kullanicilar');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/kayitol', async (req, res) => {
    const { kad, sifre, eposta } = req.body;
    if (!kad || !sifre || !eposta) {
        return res.status(400).json({
            "mesaj": 'Lütfen kullanıcı adı, şifre, eposta giriniz!'
        });
    }
    const kullanici = await Kullanici.findOne({ kad: kad });
        
    if (kullanici)
        return res
            .status(400)
            .json({  "mesaj": "Bu kullanıcı zaten var!" });

    const tuz = await bcrypt.genSalt(Number(10));
    const hashlenmisSifre = await bcrypt.hash(sifre, tuz);
    await new Kullanici({ ...req.body, sifre: hashlenmisSifre }).save();

    return res
        .status(201)
        .json({"mesaj": "Kullanıcı oluşturuldu" });

});

router.post('/girisyap', async (req, res) => {
    const { eposta, sifre } = req.body;
    if (!eposta || !sifre) {
        return res.status(400).json({
            "mesaj": 'Lütfen eposta ve şifreyi giriniz!'
        });
    }
    const kullanici = await Kullanici.findOne({ eposta: eposta });
    if (!kullanici)
        return res
            .status(400)
            .json({"mesaj": "Böyle bir kullanıcı yok" });
    const sifreDogruMu = await bcrypt.compare(
        req.body.sifre,
        kullanici.sifre
    );
    if (!sifreDogruMu)
        return res
            .status(400)
            .json({  "mesaj": "Şifre yanlış" });
    const payload = {
        email: eposta,
        kad: kullanici.kad,
    }
    const token = jwt.sign(payload, 'secret', { expiresIn: '1h' });
    res.json({
        mesaj: 'Giriş başarılı!',
        token: token,
    });
});

module.exports = router;