const express = require("express");
const app = express();
const PORT = process.env.PORT || 3002;
const mongoose = require("mongoose");
const amqp = require("amqplib");
const Siparis = require("./models/Siparis");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var kanal, baglanti;

mongoose
  .connect("mongodb://localhost:27017/rabbitmqdemo", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Sipariş servisi MongoDB veritabanına bağlandı"))
  .catch((e) => console.log(e));

// RabbitMQ connection
async function connectToRabbitMQ() {
  const amqpSunucu = "amqp://guest:guest@localhost:5672";
  baglanti = await amqp.connect(amqpSunucu);
  kanal = await baglanti.createChannel();
  await kanal.assertQueue("siparis-servis-kuyruk");
}

siparisOlustur = (urunler, eposta) => {
  let toplam = 0;
  urunler.forEach((urun) => {
    toplam += urun.price;
  });

  const siparis = new Siparis({
    eposta: eposta,
    urunler: urunler,
    toplam: toplam,
  });
  siparis.save();
  return siparis;
};

connectToRabbitMQ().then(() => {
  kanal.consume("siparis-servis-kuyruk", (data) => {
    const { urunler,  eposta } = JSON.parse(data.content);
    const yeniSiparis = siparisOlustur(urunler, eposta);
    kanal.ack(data);
    kanal.sendToQueue(
      "urun-servis-kuyruk",
      Buffer.from(JSON.stringify(yeniSiparis))
    );
  });
});

app.listen(PORT, () => {
  console.log(`Sipariş servis ${PORT} numaralı portta dinlemede`);
});
