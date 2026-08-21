# HƯỚNG DẪN XUẤT BÁO CÁO SANG FILE WORD (.DOCX) VÀ PDF CHUẨN ĐẸP

Bộ tài liệu báo cáo đồ án kết thúc môn đã được biên soạn đầy đủ, chi tiết và đạt độ dài tiêu chuẩn (> 50 trang A4) lưu tại thư mục:  
`d:\BaiTapAIMaketing\AI3D\docs_report\`

Dưới đây là 3 phương pháp đơn giản nhất để chuyển đổi sang file **Word (.docx)** hoặc **PDF** để in ấn và nộp cho Hội đồng / Giảng viên.

---

## PHƯƠNG PHÁP 1: Sử dụng Công cụ Pandoc (Khuyến nghị - Định dạng chuẩn nhất)

Nếu máy tính của bạn đã cài đặt **Pandoc** (hoặc cài qua `winget install JohnMacFarlane.Pandoc`):

Mở Terminal tại thư mục `d:\BaiTapAIMaketing\AI3D\docs_report\` và chạy lệnh:

```bash
# 1. Xuất toàn bộ đồ án ra file Microsoft Word (.docx)
pandoc TRANG_BIA_VA_DANH_MUC.md CH1_TONG_QUAN_VA_DAT_VAN_DE.md CH2_CO_SO_LY_THUYET_VA_CONG_NGHE.md CH3_PHAN_TICH_VA_THIET_KE_HE_THONG.md CH4_HIEN_THUC_HOA_VA_KET_QUA_THU_NGHIEM.md CH5_DANH_GIA_HIEU_QUA_ROI_VA_KET_LUAN.md TAI_LIEU_THAM_KHAO_VA_PHU_LUC.md -o BAO_CAO_DO_AN_FULL.docx

# 2. Hoặc xuất từ file tổng hợp
pandoc BAO_CAO_DO_AN_TONG_HOP_FULL.md -o BAO_CAO_DO_AN_FULL.docx
```

---

## PHƯƠNG PHÁP 2: Sử dụng Extension "Markdown PDF" hoặc "EVP - Enhanced View" trong VS Code

1. Trong VS Code, vào mục **Extensions (Ctrl + Shift + X)**, tìm và cài đặt extension **"Markdown PDF"** của tác giả *yzane*.
2. Mở file `d:\BaiTapAIMaketing\AI3D\docs_report\BAO_CAO_DO_AN_TONG_HOP_FULL.md`.
3. Nhấp chuột phải vào bất kỳ đâu trong file -> Chọn **Markdown PDF: Export (pdf)** hoặc **Markdown PDF: Export (docx)**.
4. File xuất ra sẽ tự động lưu cùng thư mục với đầy đủ mục lục, hình vẽ, khối mã nguồn và bảng biểu định dạng đẹp.

---

## PHƯƠNG PHÁP 3: Sử dụng Phần mềm Typora / MS Word Mở Trực Tiếp

1. Mở ứng dụng **Typora** hoặc **MarkText** (trình soạn thảo Markdown chuyên nghiệp WYSIWYG).
2. Mở file `BAO_CAO_DO_AN_TONG_HOP_FULL.md`.
3. Vào Menu `File` -> `Export` -> Chọn `Word (.docx)` hoặc `PDF`.
4. Mở file `.docx` trong Microsoft Word:
   - Chọn toàn bộ văn bản (`Ctrl + A`) -> Chỉnh font sang **Times New Roman**, cỡ chữ **13pt**.
   - Căn lề chuẩn: Top: 2cm, Bottom: 2cm, Left: 3cm, Right: 2cm.
   - Giãn dòng: **Line spacing 1.5 lines**, Spacing Before/After: **3pt - 6pt**.
   - Điền thông tin chính xác của bạn vào các vị trí `[HỌ VÀ TÊN SINH VIÊN]`, `[MSSV]`, `[GVHD]`.
