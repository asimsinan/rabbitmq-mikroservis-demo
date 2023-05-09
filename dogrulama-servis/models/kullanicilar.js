const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const kullaniciSema = new Schema({
    kad: {
        type: String,
        required: true,
        unique: true
    },
    sifre: {
        type: String,
        required: true
    },
    eposta: {
        type: String,
        required: true,
        unique: true
    },
    olusturulmaTarihi: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("kullanici", kullaniciSema,"kullanicilar");