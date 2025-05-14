# Ürün Servisi (Product Service)

## Genel Bakış

Bu proje, bir e-ticaret sisteminin ürün yönetimi ve sipariş başlatma süreçlerini yöneten bir mikroservistir. Node.js, Express.js kullanılarak geliştirilmiştir ve MongoDB ile RabbitMQ entegrasyonuna sahiptir.

Servis, yeni ürünlerin oluşturulmasını ve kullanıcıların mevcut ürünleri "satın almasını" (sipariş sürecini başlatmasını) sağlar. Satın alma işlemi, RabbitMQ üzerinden başka bir servise bilgi göndererek asenkron olarak işlenir.

## Fonksiyonellik / API Uç Noktaları

## RabbitMQ Docker kapsayıcısının çalıştırılması
`docker run -p 5672:5672 rabbitmq`

### 1. Ürün Oluşturma

-   **Endpoint:** `POST /`
-   **Açıklama:** Yeni bir ürün oluşturur.
-   **Doğrulama:** Gereklidir. İstek yapan kullanıcının kimliği doğrulanmalıdır.
-   **İstek Gövdesi (Request Body):**
    ```json
    {
        "ad": "Örnek Ürün Adı",
        "fiyat": 19.99,
        "detay": "Bu ürün hakkında detaylı bilgi."
    }
    ```
-   **Başarılı Yanıt (201 Created):**
    ```json
    {
        "mesaj": "Ürün başarıyla oluşturuldu",
        "urun": {
            "_id": "...",
            "ad": "Örnek Ürün Adı",
            "fiyat": 19.99,
            "detay": "Bu ürün hakkında detaylı bilgi."
        }
    }
    ```
-   **Hata Yanıtı (400 Bad Request):**
    ```json
    {
        "mesaj": "Lütfen ürün adı, fiyat, detay girin!"
    }
    ```

### 2. Ürün Satın Alma (Sipariş Başlatma)

-   **Endpoint:** `POST /satinal`
-   **Açıklama:** Seçilen ürünler için bir satın alma süreci başlatır.
-   **Doğrulama:** Gereklidir. İstek yapan kullanıcının kimliği doğrulanmalıdır.
-   **İstek Gövdesi (Request Body):**
    ```json
    {
        "urunlerId": ["<urunId1>", "<urunId2>"]
    }
    ```
-   **İşlem Akışı:**
    1.  İstek gövdesinden alınan `urunlerId` listesindeki ürünler veritabanından (MongoDB) bulunur.
    2.  Bulunan ürünlerin detayları ve istek yapan kullanıcının e-posta adresi (`req.user.eposta`) ile birlikte bir mesaj RabbitMQ'da `siparis-servis-kuyruk` adlı kuyruğa gönderilir. Bu, bir "Sipariş Servisi" tarafından dinlenmektedir.
    3.  Servis, aynı zamanda RabbitMQ'da `urun-servis-kuyruk` adlı kuyruğu dinlemeye başlar. Bu kuyruktan gelen mesaj (mesela siparişin durumu veya detayı hakkında Sipariş Servisi'nden gelen bir yanıt) alınır ve işlenir.
-   **Başarılı Yanıt (201 Created):**
    ```json
    {
        "mesaj": "Sipariş başarılı bir şekilde oluşturuldu",
        "siparis": { /* urun-servis-kuyruk'tan alınan sipariş bilgisi */ }
    }
    ```

## İşlem Sırası (Satın Alma Akışı)

1.  Kullanıcı (veya istemci uygulama), `/satinal` endpoint'ine, satın alınmak istenen ürünlerin ID'lerini içeren bir POST isteği gönderir.
2.  `urun-servis`, bu ID'lere karşılık gelen ürün bilgilerini MongoDB veritabanından çeker.
3.  `urun-servis`, çekilen ürün bilgileri ve kullanıcının e-posta adresini içeren bir mesajı RabbitMQ'daki `siparis-servis-kuyruk` kuyruğuna yayınlar.
4.  Ayrı bir "Sipariş Servisi" (bu projede tanımlı değil, ancak varlığı varsayılıyor), `siparis-servis-kuyruk` kuyruğunu dinler, mesajı alır ve sipariş oluşturma işlemlerini gerçekleştirir.
5.  Sipariş Servisi, işlem tamamlandıktan veya bir güncelleme olduğunda, bir yanıt mesajını (sipariş detayları veya durumu) RabbitMQ'daki `urun-servis-kuyruk` kuyruğuna yayınlar.
6.  `urun-servis`, `urun-servis-kuyruk` kuyruğunu dinler, bu yanıt mesajını alır ve istemciye siparişin oluşturulduğuna dair bir onay ve alınan sipariş bilgisini döner.

## Kullanılan Teknolojiler

-   **Node.js:** Çalışma zamanı ortamı
-   **Express.js:** Web uygulama çatısı
-   **MongoDB:** NoSQL veritabanı (Mongoose ODM ile erişiliyor)
-   **RabbitMQ:** Mesaj kuyruk sistemi (amqplib kütüphanesi ile erişiliyor)

## Kurulum ve Çalıştırma

1.  **Ön Gereksinimler:**
    *   Node.js ve npm (veya yarn) yüklü olmalıdır.
    *   MongoDB sunucusu çalışır durumda olmalıdır.
    *   RabbitMQ sunucusu çalışır durumda olmalıdır (`amqp://guest:guest@localhost:5672` adresinden erişilebilir olmalıdır).

2.  **Bağımlılıkların Yüklenmesi:**
    Proje kök dizininde aşağıdaki komutu çalıştırın:
    ```bash
    npm install
    ```
    veya
    ```bash
    yarn install
    ```

3.  **Çalıştırma:**
    Proje kök dizininde (genellikle `package.json` dosyasındaki script ile):
    ```bash
    npm start
    ```
    veya uygulamanın ana dosyasını doğrudan çalıştırarak (örneğin, `node server.js` veya `node app.js` gibi, projenin giriş noktasına bağlı olarak).

## Kuyruk İsimleri

-   **`siparis-servis-kuyruk`:** Ürün servisi tarafından, satın alınan ürün bilgilerinin sipariş servisine gönderildiği kuyruk.
-   **`urun-servis-kuyruk`:** Sipariş servisi tarafından, işlenen sipariş bilgilerinin ürün servisine geri gönderildiği kuyruk.

