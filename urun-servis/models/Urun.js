const mongoose = require('mongoose');
const Schema = mongoose.Schema

const urunSema = new Schema({
    ad: {
        type: String,
        required: true
    },
    fiyat: {
        type: Number,
        required: true
    },
    detay: {
        type: String,
        required: true
    }
}
    , { timestamps: true }
);

module.exports = mongoose.model("urun", urunSema,"urunler");