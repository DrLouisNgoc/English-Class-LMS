# ocr-pdf.ps1 — rút chữ ra khỏi một PDF bản SCAN (ảnh).
#
# Vì sao cần: nhiều sách trong document_books/ là bản scan, pdftotext trả về
# rỗng vì trong file không có chữ, chỉ có ảnh. Script này dựng ảnh từng trang
# (pdftoppm) rồi nhận dạng chữ trên ảnh (tesseract).
#
# PDF nào là bản chữ thì ĐỪNG dùng script này — chạy pdftotext nhanh hơn nhiều
# và chính xác tuyệt đối. Kiểm nhanh:
#     pdftotext -l 5 "ten-file.pdf" - | wc -c
# ra gần 0 nghĩa là bản scan, phải OCR.
#
# Dùng:
#     ./scripts/ocr-pdf.ps1 -Pdf "document_books/Tiếng Anh 7 Global Success.pdf" -First 10 -Last 14
#
# Mỗi trang mất khoảng 5-15 giây. Đừng OCR cả quyển sách vài trăm trang —
# tra mục lục lấy đúng khoảng trang của Unit cần rồi OCR bấy nhiêu thôi.

param(
  [Parameter(Mandatory = $true)][string]$Pdf,
  [Parameter(Mandatory = $true)][int]$First,
  [Parameter(Mandatory = $true)][int]$Last,
  # 300 đủ cho sách in thường. Chữ nhỏ hoặc mờ thì thử 400.
  [int]$Dpi = 300,
  # vie+eng đọc được cả hai thứ tiếng. Trang thuần tiếng Anh để "eng" cho nhanh.
  [string]$Lang = "vie+eng"
)

$ErrorActionPreference = "Stop"

$pdftoppm = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe\poppler-25.07.0\Library\bin\pdftoppm.exe"
$tesseract = Join-Path $env:ProgramFiles "Tesseract-OCR\tesseract.exe"

foreach ($tool in @($pdftoppm, $tesseract)) {
  if (-not (Test-Path $tool)) { throw "Không tìm thấy: $tool — xem docs/UNITS.md phần công cụ đọc PDF." }
}

# Bộ ngôn ngữ để ở thư mục riêng vì không có quyền ghi vào Program Files.
$env:TESSDATA_PREFIX = Join-Path $env:USERPROFILE "tessdata"

$work = Join-Path $env:TEMP ("ocr_" + [Guid]::NewGuid().ToString("N").Substring(0, 8))
New-Item -ItemType Directory -Force -Path $work | Out-Null

& $pdftoppm -r $Dpi -f $First -l $Last -png "$Pdf" (Join-Path $work "p")

foreach ($img in (Get-ChildItem (Join-Path $work "*.png") | Sort-Object Name)) {
  $base = Join-Path $work $img.BaseName
  & $tesseract "$($img.FullName)" "$base" -l $Lang 2>$null
  Write-Output ""
  Write-Output "----- $($img.BaseName) -----"
  Get-Content "$base.txt" -Encoding UTF8 | Where-Object { $_.Trim() }
}

Remove-Item $work -Recurse -Force -ErrorAction SilentlyContinue
