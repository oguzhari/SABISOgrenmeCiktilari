# SABIS Çıktı Doldurucu

SABIS sınav sayfalarında Program Çıktıları ve Öğrenme Çıktıları seçimlerini tek tek yapmak yerine, bütün soru satırları için otomatik dolduran basit bir Chrome eklentisi.

## Önce Bunu Oku: En Kısa Kurulum

Bu eklenti Chrome Web Store'da yayınlı olmadığı için Chrome'a elle yüklenir. Göz korkutmasın; bir kere yapıyorsunuz, sonra SABIS sayfasında sağ altta panel olarak çıkıyor.

![Kurulum özeti](docs/images/install-guide.svg)

### 1. Projeyi indir

Bu GitHub sayfasında sağ üstteki yeşil `Code` butonuna basın.

Sonra `Download ZIP` seçeneğine tıklayın.

### 2. ZIP dosyasını aç

İnen ZIP dosyasına çift tıklayın. Bilgisayarınız dosyayı bir klasöre çıkaracaktır.

Klasörün içinde şunlar görünmeli:

- `manifest.json`
- `content.js`
- `content.css`
- `README.md`

Eğer `manifest.json` dosyasını görüyorsanız doğru yerdesiniz.

### 3. Chrome eklenti sayfasını aç

Chrome adres çubuğuna şunu yazın:

```text
chrome://extensions
```

Enter'a basın.

### 4. Developer mode'u aç

Açılan sayfanın sağ üstünde `Developer mode` anahtarı var. Onu açın.

Bu ayar sadece Chrome'a “ben dışarıdan eklenti yükleyeceğim” demek için gerekiyor.

### 5. Load unpacked ile klasörü seç

Sol üstte `Load unpacked` butonu çıkar. Chrome Türkçe ise bu buton `Paketlenmemiş öğe yükle` olarak görünebilir. Ona basın.

Az önce ZIP'ten çıkardığınız klasörü seçin.

Önemli: Seçtiğiniz klasörün içinde doğrudan `manifest.json` dosyası olmalı. Chrome bu dosyayı görmezse eklentiyi yükleyemez.

ZIP'ten çıkan klasörün içinde bir klasör daha varsa, içeri girip `manifest.json` dosyasını gördüğünüz klasörü seçin.

### 6. Klasörü silmeyin, taşımayın

Chrome bu eklentiyi seçtiğiniz klasörden çalıştırır.

Yani eklentiyi kurduktan sonra o klasörü silerseniz, başka yere taşırsanız ya da adını değiştirirseniz eklenti çalışmayabilir.

En iyisi klasörü bilgisayarınızda kalıcı bir yere koymak:

```text
Belgeler/SABIS-Cikti-Doldurucu
```

ve sonra Chrome'a o klasörü göstermek.

## SABIS'te Nasıl Kullanılır?

Kurulum bittikten sonra SABIS'te ilgili sınav sayfasına gidin.

![Kullanım özeti](docs/images/usage-guide.svg)

1. SABIS'te ilgili dersin sınav detay sayfasını açın.
2. `Program/Öğrenme Çıktıları` sekmesine girin.
3. Sağ altta `SABIS Çıktı Doldurucu` paneli görünür.
4. İstediğiniz modu seçin.
5. İşlem bitince sayfa yenilenir ve seçilen çıktılar görünür.

Panel görünmüyorsa şunları kontrol edin:

- Doğru SABIS sayfasında mısınız?
- `Program/Öğrenme Çıktıları` sekmesini açtınız mı?
- Chrome eklentiler sayfasında eklenti açık mı?
- Eklenti klasörünü silmiş veya taşımış olabilir misiniz?

## Bu Eklenti Kendi Kendini Siler mi?

Hayır. Eklenti kendi kendini silemez.

Ama şu durumlarda çalışmayı bırakabilir:

- Siz Chrome'dan eklentiyi kaldırırsanız.
- Eklentinin bulunduğu klasörü bilgisayardan silerseniz.
- Eklentinin bulunduğu klasörü başka yere taşırsanız.
- Chrome'da eklentiyi kapatırsanız.
- Kurumsal bir bilgisayarda Chrome dışarıdan yüklenen eklentileri engelliyorsa.

Kısaca: Klasörü yerinde tutarsanız ve Chrome'da eklenti açık kalırsa kullanmaya devam edersiniz.

## Hangi Buton Ne İşe Yarıyor?

### Bütün çıktıları doldur

En kolay mod. Hiçbir seçim yapmadan basarsınız. Sayfadaki tüm Program Çıktılarını ve tüm Öğrenme Çıktılarını bütün sorulara uygular.

### Seçilenleri tüm sorulara uygula

Panelde Program Çıktıları ve Öğrenme Çıktıları ayrı ayrı listelenir.

Hangilerini istiyorsanız onları işaretlersiniz. Sonra bu butona basarsınız. Seçtikleriniz tüm sorulara uygulanır.

### Her soruya rastgele ata

Program Çıktısı ve Öğrenme Çıktısı için ayrı sayı girersiniz.

Örneğin:

- PÇ adedi: `2`
- ÖÇ adedi: `1`

Bu durumda her soru için 2 rastgele Program Çıktısı ve 1 rastgele Öğrenme Çıktısı atanır.

## Çok Kısa Özet

1. GitHub'dan ZIP indir.
2. ZIP'i aç.
3. Chrome'da `chrome://extensions` aç.
4. `Developer mode` aç.
5. `Load unpacked` ile `manifest.json` bulunan klasörü seç.
6. SABIS'te `Program/Öğrenme Çıktıları` sekmesine gir.
7. Sağ alttaki panelden doldur.
8. Eklenti klasörünü silme.

## Neden?

SABIS'te bir sınavı yayına hazırlarken her soru için Program Çıktısı ve Öğrenme Çıktısı seçmek gerekiyor. Küçük sınavlarda bu idare edilebilir; ancak 20, 30 ya da daha fazla soruluk testlerde aynı seçimleri tekrar tekrar yapmak zaman kaybına dönüşüyor.

Bu eklenti, `Program/Öğrenme Çıktıları` sekmesinde tek bir butonla ilgili sınavdaki bütün mevcut çıktıları soru satırlarına ekler. Örneğin bir derste 9 Program Çıktısı ve 4 Öğrenme Çıktısı varsa, her soru için bu 13 seçimi otomatik olarak uygular.

## Ne Yapar?

- SABIS sınav detay sayfasındaki çıktı seçim tablosunu algılar.
- Her soru satırındaki tüm Program Çıktılarını seçer.
- Her soru satırındaki tüm Öğrenme Çıktılarını seçer.
- İstenirse yalnızca panelde işaretlenen Program ve Öğrenme Çıktılarını tüm sorulara uygular.
- İstenirse her soru için belirlenen adet kadar rastgele Program ve Öğrenme Çıktısı atar.
- Eksik seçimleri SABIS'in kendi kayıt endpoint'lerine gönderir.
- Mevcut kayıtları silmez; sadece eksik olanları ekler.
- İşlem tamamlanınca sayfayı yenileyerek SABIS'in güncel rozetlerini gösterir.

## Nasıl Kullanılır?

1. SABIS'te ilgili dersin sınav detay sayfasına gidin.
2. `Program/Öğrenme Çıktıları` sekmesini açın.
3. Sağ altta görünen `SABIS Çıktı Doldurucu` panelinden ihtiyacınız olan modu seçin.
4. İşlem tamamlandığında sayfa yenilenir ve seçilen çıktılar SABIS üzerinde görünür.

## Doldurma Modları

### 1. Bütün çıktıları doldur

Her soru satırı için listede bulunan tüm Program Çıktılarını ve tüm Öğrenme Çıktılarını ekler. En hızlı kullanım budur.

### 2. Seçilenlerle doldur

Panelde, mevcut SABIS listesinden gelen Program Çıktıları ve Öğrenme Çıktıları ayrı ayrı gösterilir. İstediğiniz PÇ ve ÖÇ seçeneklerini işaretleyip `Seçilenleri tüm sorulara uygula` butonuna basabilirsiniz.

Örneğin yalnızca PÇ 1, PÇ 3 ve ÖÇ 2 seçilirse, bu seçimler tüm soru satırlarına uygulanır.

### 3. Rastgele doldur

Program Çıktıları ve Öğrenme Çıktıları için ayrı adet girilir. Eklenti her soru için mevcut seçenekler arasından belirtilen sayı kadar rastgele seçim yapar.

Örneğin PÇ adedi `2`, ÖÇ adedi `1` girilirse, her soru satırına 2 rastgele Program Çıktısı ve 1 rastgele Öğrenme Çıktısı atanır.

## Kurulum

Bu eklenti şu an Chrome Web Store'da yayınlanmadı. Chrome Web Store geliştirici hesabı ücretli olduğu için şimdilik yerel olarak yüklenebilir.

1. Bu projeyi bilgisayarınıza indirin.
2. Chrome'da `chrome://extensions` sayfasını açın.
3. Sağ üstten `Developer mode` seçeneğini açın.
4. `Load unpacked` veya `Paketlenmemiş öğe yükle` butonuna basın.
5. İçinde `manifest.json` dosyası bulunan klasörü seçin.

Kurulumdan sonra SABIS sınav sayfasını yenileyin. Panel otomatik olarak görünecektir.

## Yerel HTML ile Test Etme

SABIS sayfasını HTML olarak kaydedip test etmek isterseniz:

1. Chrome'da `chrome://extensions` sayfasına gidin.
2. Bu eklentinin detaylarını açın.
3. `Allow access to file URLs` iznini aktif edin.
4. Kaydettiğiniz HTML dosyasını Chrome'da açın.

Yerel HTML üzerinde eklenti sadece ekranı günceller. Canlı SABIS sitesine kayıt isteği göndermez.

## Güvenlik ve Sınırlar

- Eklenti yalnızca `https://abs.sakarya.edu.tr/Ders/Detay/*` adreslerinde çalışacak şekilde ayarlanmıştır.
- Kullanıcı adı, şifre veya kişisel veri toplamaz.
- Harici bir sunucuya veri göndermez.
- Sadece açık olan SABIS sayfasındaki mevcut seçimleri otomatikleştirir.
- SABIS arayüzü veya endpoint yapısı değişirse eklentinin güncellenmesi gerekebilir.

## Teknik Özet

Eklenti, SABIS sayfasındaki `select.selectPcikti` ve `select.selectOcikti` alanlarını bulur. Her soru satırı için seçilebilir tüm option değerlerini işaretler ve SABIS'in kullandığı kayıt yollarına AJAX isteği gönderir:

- `/Ders/Sinav/KaydetProgramCiktilari`
- `/Ders/Sinav/KaydetOgrenmeCiktilari`

Manifest V3 kullanan küçük bir content script eklentisidir. Ek bir build adımı veya bağımlılık gerektirmez.

## Proje Durumu

İlk sürüm, kaydedilmiş SABIS HTML örnekleri üzerinde test edildi. Özellikle çok sorulu sınavlarda tekrar eden çıktı seçme işini azaltmak için geliştirildi.

## Not

Bu proje resmi bir Sakarya Üniversitesi veya SABIS ürünü değildir. Günlük kullanımda zaman kazandırmak için hazırlanmış bağımsız bir yardımcı araçtır.
