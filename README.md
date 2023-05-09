# RabbitMQ NodeJS Mikroservis Demo
Bu örnek [E-commerce Microservice](https://github.com/ondiekelijah/E-commerce-Microservice) örneğinden alınmıştır.

## Paketlerin yüklenmesi
```bash
ana klasörde npm install
cd dogrulama-servis && npm install
cd urun-servis && npm install
cd siparis-servis && npm install
```

## RabbitMQ Docker kapsayıcısının çalıştırılması
`docker run -p 5672:5672 rabbitmq`

## Servislerin çalıştırılması
* Her bir klasöre cd ile girerek
`npm start` komutunu çalıştırın.
* request.json içindeki istekleri Thunder Client aracılığı ile çalıştırabilirsiniz.
* Önce Ürün Ekle servisiyle ürün ekleyin.
* Sonra Kayıt Ol servisiyle kullanıcı oluşturun.
* Giriş Yap servisiyle giriş yaparak token oluşturun.
* Ürün Satın Al servisine token bilgisini ekleyerek eklediğiniz ürünleri satın alma isteği gönderin.

