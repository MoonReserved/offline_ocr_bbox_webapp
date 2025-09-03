# OCR 本地端小工具

## 專案說明
本專案提供一個 **純本地端運行的 HTML + JavaScript 工具**，能夠直接在瀏覽器中進行 OCR（光學文字辨識），並且支援區塊框選功能。  
設計目的為 **加速同仁在受理案件時的文字錄入流程**，同時確保 **個人資料不會外洩**，所有辨識皆在使用者裝置端完成，不會傳送至任何外部伺服器。

## 功能特色
- 支援多張圖片一次上傳與處理  
- 可在圖片上框選需要的文字段落  
- 辨識語言支援：
  - English  
  - Chinese (Simplified)  
  - Chinese (Traditional)  
- **完全離線運行**，OCR 過程不需網路  
- 確保 **案件個資安全**，無資料外洩風險  

## 使用方式
1. 開啟 `index.html`  
2. 上傳需要辨識的圖片（僅能吃圖片檔，並且建議使用掃描功能的相機去拍攝，確保辨識品質）
3. 點擊「Start OCR」開始辨識  
4. 在圖片上點選框框以選取需要的文字  
5. 選取的文字會顯示在輸出框，可複製保存
6. 使用後，請務必人工核對確保結果100%正確  

## 技術與授權
本專案基於 [Tesseract.js](https://github.com/naptha/tesseract.js) (Apache License 2.0)  
並整合 HTML5 Canvas 與 JavaScript 製作。  

## 版權聲明
Powered by Tesseract.js (Apache License 2.0)  
© 2025 大溪分局三元派出所 所長黃郁翔 All rights reserved
