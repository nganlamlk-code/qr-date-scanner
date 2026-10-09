QR DATE SCANNER V8 – SỬA CÁCH ĐỌC ẢNH
Điểm thay đổi quan trọng: dùng ZXing BrowserMultiFormatReader.decodeFromImageUrl cho từng ảnh cắt/đã xử lý, để thư viện tự tạo nguồn ảnh/luminance đúng cách; không tự truyền RGBA pixel vào RGBLuminanceSource.
Tự thử 8 vùng ảnh và 4 biến thể màu/độ tương phản.
Hỗ trợ EAN-13, EAN-8, UPC-A, UPC-E, QR.
Cài đặt: thay toàn bộ index.html trên GitHub repo bằng index.html trong ZIP rồi Commit changes.
URL: https://nganlamlk-code.github.io/qr-date-scanner/
Cần internet để tải thư viện từ CDN. Không thể đảm bảo đọc mọi ảnh; mã bị cong, lóa, thiếu mép hoặc độ phân giải thấp có thể vẫn thất bại.
