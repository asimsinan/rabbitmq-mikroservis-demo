const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
const dogrulamaRota = require('./routes/dogrulama');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', dogrulamaRota);
mongoose.connect(
    'mongodb://localhost:27017/rabbitmqdemo',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
)
    .then(() => console.log('Doğrulama servisi MongoDB veritabanına bağlandı'))
    .catch(e => console.log(e));


app.listen(PORT, () => {
    console.log(`Doğrulama servisi ${PORT} numaralı portta dinlemede`);
}
);

