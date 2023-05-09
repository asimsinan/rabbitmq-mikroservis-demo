const Router = require("express").Router;
const router = new Router();
const Urun = require("../models/Urun");
const dogrulama = require("../dogrulama");
const amqp = require("amqplib");

var siparis, kanal, baglanti;

async function rabbitMQyaBaglan() {
  const amqpSunucu = "amqp://guest:guest@localhost:5672";
  baglanti = await amqp.connect(amqpSunucu);
  kanal = await baglanti.createChannel();
  await kanal.assertQueue("urun-servis-kuyruk");
}
rabbitMQyaBaglan();

router.post("/", dogrulama, async (req, res) => {
  const { ad, fiyat, detay } = req.body;
  if (!ad || !fiyat || !detay) {
    return res.status(400).json({
      mesaj: "Lütfen ürün adı, fiyat, detay girin!",
    });
  }
  const urun = await new Urun({ ...req.body });
  await urun.save();
  return res.status(201).json({
    mesaj: "Ürün başarıyla oluşturuldu",
    urun: urun,
  });
});

router.post("/satinal", dogrulama, async (req, res) => {
  const { urunlerId } = req.body;
  const urunler = await Urun.find({ _id: { $in: urunlerId } });

  kanal.sendToQueue(
    "siparis-servis-kuyruk",
    Buffer.from(
      JSON.stringify({
        urunler: urunler,
        eposta: req.user.eposta,
      })
    )
  );

  kanal.consume("urun-servis-kuyruk", (data) => {
    console.log("urun-servis-kuyruk tüketildi");
    siparis = JSON.parse(data.content);
    kanal.ack(data);
  });
  return res.status(201).json({
    mesaj: "Sipariş başarılı bir şekilde oluşturuldu",
    siparis: siparis,
  });
});

module.exports = router;
