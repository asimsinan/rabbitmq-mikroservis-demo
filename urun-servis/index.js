const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const mongoose = require("mongoose");
const urunRota = require("./routes/index");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/urunler", urunRota);

mongoose
  .connect("mongodb://localhost:27017/rabbitmqdemo", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Ürün servisi MongoDB veritabanına bağlandı."))
  .catch((e) => console.log(e));

app.listen(PORT, () => {
  console.log(`Ürün servisi ${PORT} numaralı portta dinlemede`);
});
