# SABIS Çıktı Doldurucu

SABIS sınav sayfalarında Program Çıktıları ve Öğrenme Çıktıları seçimlerini tek tek yapmak yerine, bütün soru satırları için otomatik dolduran basit bir Chrome eklentisi.

## Neden?

SABIS'te bir sınavı yayına hazırlarken her soru için Program Çıktısı ve Öğrenme Çıktısı seçmek gerekiyor. Küçük sınavlarda bu idare edilebilir; ancak 20, 30 ya da daha fazla soruluk testlerde aynı seçimleri tekrar tekrar yapmak zaman kaybına dönüşüyor.

Bu eklenti, `Program/Öğrenme Çıktıları` sekmesinde tek bir butonla ilgili sınavdaki bütün mevcut çıktıları soru satırlarına ekler. Örneğin bir derste 9 Program Çıktısı ve 4 Öğrenme Çıktısı varsa, her soru için bu 13 seçimi otomatik olarak uygular.

## Ne Yapar?

- SABIS sınav detay sayfasındaki çıktı seçim tablosunu algılar.
- Her soru satırındaki tüm Program Çıktılarını seçer.
- Her soru satırındaki tüm Öğrenme Çıktılarını seçer.
- Eksik seçimleri SABIS'in kendi kayıt endpoint'lerine gönderir.
- Mevcut kayıtları silmez; sadece eksik olanları ekler.
- İşlem tamamlanınca sayfayı yenileyerek SABIS'in güncel rozetlerini gösterir.

## Nasıl Kullanılır?

1. SABIS'te ilgili dersin sınav detay sayfasına gidin.
2. `Program/Öğrenme Çıktıları` sekmesini açın.
3. Sağ altta görünen `SABIS Çıktı Doldurucu` panelindeki `Bütün çıktıları doldur` butonuna basın.
4. İşlem tamamlandığında sayfa yenilenir ve seçilen çıktılar SABIS üzerinde görünür.

## Kurulum

Bu eklenti şu an Chrome Web Store'da yayınlanmadı. Chrome Web Store geliştirici hesabı ücretli olduğu için şimdilik yerel olarak yüklenebilir.

1. Bu projeyi bilgisayarınıza indirin.
2. Chrome'da `chrome://extensions` sayfasını açın.
3. Sağ üstten `Developer mode` seçeneğini açın.
4. `Paketlenmemiş öğe yükle` butonuna basın.
5. `sabis-outcome-filler` klasörünü seçin.

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
