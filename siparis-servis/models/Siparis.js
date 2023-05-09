const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const siparisSema = new Schema(
  {
    eposta: String,
    urunler: [
      {
        urunid: String,
      },
    ],
    toplam: {
      type: Number,
      required: true,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("siparis", siparisSema,"siparisler");
