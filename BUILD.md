# 蝦皮手續費計算機 2.0 - 開發文件

## 專案結構

```
shopee-fee/
├── dist/
│   └── output.css          # Tailwind 編譯後的 CSS
├── src/
│   └── input.css           # Tailwind 源文件
├── components/
│   ├── header.js           # 共用 Header 組件
│   └── footer.js           # 共用 Footer 組件
├── index.html              # 首頁
├── calc.html               # 快速計算頁面
├── management.html         # 商品管理頁面
├── settings.html           # 賣場設定頁面
├── guide.html              # 使用說明頁面
├── storage-v2.js           # 資料管理模組
├── management.js           # 商品管理邏輯
├── settings.js             # 賣場設定邏輯
├── calc-page.js            # 快速計算邏輯
├── calculator.js           # 舊版計算邏輯 (保留)
├── fee-lookup.js           # 費率查詢功能
├── fee.json                # 費率資料
├── tailwind.config.js      # Tailwind 配置
└── package.json            # 專案配置
```

## 開發環境設定

### 1. 安裝依賴

```bash
npm install
```

### 2. 編譯 Tailwind CSS

**開發模式 (監聽檔案變更)**
```bash
npm run watch
```

**生產模式 (編譯並壓縮)**
```bash
npm run build
```

## 技術棧

- **樣式框架**: Tailwind CSS v3.4.1
- **圖標庫**: Lucide Icons (CDN)
- **JavaScript**: Vanilla JavaScript (ES6+)
- **儲存**: localStorage
- **部署**: GitHub Pages

## 資料結構

### localStorage 格式

```javascript
{
  "storeSettings": {
    "sellerType": "general",        // 賣家類型: general | mall
    "shippingOption": "both",       // 免運方案: both | ship1 | ship2
    "cashbackProgram": "0",         // 蝦幣回饋: 0 | 1.5 | 2.5
    "taxSetting": "0",              // 稅務設定: 0 | 1 | 5 | 5_plus
    "hasProductInvoice": false,     // 有商品進項發票
    "hasFeeInvoice": false,         // 有手續費進項發票
    "costTaxType": "inc"            // 進價稅務: inc | exc
  },
  "products": [
    {
      "id": "uuid",
      "name": "商品名稱",
      "cost": 100,
      "salePrice": 200,
      "transactionFeeRate": 6.0,
      "isPreOrder": false,
      "createdAt": "2026-01-14T...",
      "updatedAt": "2026-01-14T..."
    }
  ]
}
```

## 主要功能

### 1. 商品管理 (management.html)
- 新增/編輯/刪除商品
- 搜尋商品名稱
- 依各欄位排序
- 顯示一般日和活動日獲利

### 2. 賣場設定 (settings.html)
- 設定賣家類型
- 設定預設免運方案
- 設定預設蝦幣回饋
- 設定稅務相關選項
- 匯出/匯入資料 (JSON)

### 3. 快速計算 (calc.html)
- 從側邊欄選擇商品快速填入
- 兩種計算模式:
  - 用售價算獲利
  - 用獲利率算售價
- 顯示四種情境結果:
  - 一般日 + 方案一
  - 一般日 + 方案二
  - 活動日 + 方案一
  - 活動日 + 方案二

## 深色模式

深色模式透過 Tailwind 的 `dark:` 前綴實現，切換方式:

```javascript
// 切換深色模式
document.documentElement.classList.toggle('dark');
localStorage.setItem('theme', 'dark');
```

## 部署到 GitHub Pages

1. 確保已編譯 CSS:
```bash
npm run build
```

2. 提交所有變更:
```bash
git add .
git commit -m "Update to v2.0"
git push origin main
```

3. 在 GitHub 專案設定中啟用 GitHub Pages (選擇 main branch)

## 瀏覽器支援

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+

## 注意事項

1. 所有資料儲存在 localStorage，請提醒用戶定期備份
2. localStorage 容量限制約 5-10MB，一般使用足夠
3. Lucide Icons 使用 CDN，需要網路連線
4. 編譯後的 CSS 檔案必須提交到 Git

## 授權

本專案採用 CC BY-NC-ND 4.0 授權條款。
