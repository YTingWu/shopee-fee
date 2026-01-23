// Storage V2 - 蝦皮手續費計算機 2.0 資料管理
// 管理 localStorage 中的賣場設定與商品資料

const STORAGE_KEY = 'shopee-fee-v2';
const OLD_STORAGE_KEY = 'shopee-fee-configs'; // V1 舊版

// 預設資料結構
const defaultData = {
    storeSettings: {
        sellerType: 'general',
        shippingOption: 'ship1', // 移除 'both' 選項
        cashbackProgram: '0',
        taxSetting: '0',
        hasProductInvoice: false,
        hasFeeInvoice: false
    },
    products: []
};

// === 核心資料操作 ===

// 取得所有資料
function getData() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            // 嘗試從舊版遷移
            migrateFromV1();
            return getData(); // 重新讀取
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data:', error);
        return { ...defaultData, products: [] };
    }
}

// 儲存所有資料
function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
}

// === 賣場設定操作 ===

// 取得賣場設定
function getStoreSettings() {
    const data = getData();
    return data.storeSettings || defaultData.storeSettings;
}

// 儲存賣場設定
function saveStoreSettings(settings) {
    const data = getData();
    data.storeSettings = { ...data.storeSettings, ...settings };
    return saveData(data);
}

// === 商品操作 (CRUD) ===

// 取得所有商品
function getProducts() {
    const data = getData();
    return data.products || [];
}

// 取得單一商品
function getProduct(id) {
    const products = getProducts();
    return products.find(p => p.id === id);
}

// 新增商品
function addProduct(product) {
    const data = getData();
    const newProduct = {
        id: generateUUID(),
        name: product.name,
        cost: parseFloat(product.cost) || 0,
        salePrice: parseFloat(product.salePrice) || 0,
        transactionFeeRate: parseFloat(product.transactionFeeRate) || 6.0,
        isPreOrder: product.isPreOrder || false,
        costTaxType: product.costTaxType || 'inc', // 預設為含稅
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    data.products.push(newProduct);
    return saveData(data) ? newProduct : null;
}

// 更新商品
function updateProduct(id, updates) {
    const data = getData();
    const index = data.products.findIndex(p => p.id === id);
    
    if (index === -1) return false;
    
    data.products[index] = {
        ...data.products[index],
        ...updates,
        id: data.products[index].id, // 保持 ID 不變
        createdAt: data.products[index].createdAt, // 保持建立時間不變
        updatedAt: new Date().toISOString()
    };
    
    return saveData(data);
}

// 刪除商品
function deleteProduct(id) {
    const data = getData();
    data.products = data.products.filter(p => p.id !== id);
    return saveData(data);
}

// === 資料匯入匯出 ===

// 匯出資料為 JSON
function exportData() {
    const data = getData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopee-fee-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// 匯入資料從 JSON
function importData(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        
        // 驗證資料結構
        if (!data.storeSettings || !Array.isArray(data.products)) {
            throw new Error('Invalid data structure');
        }
        
        // 儲存資料
        return saveData(data);
    } catch (error) {
        console.error('Error importing data:', error);
        return false;
    }
}

// 使用 Web Share API 分享資料
async function shareData() {
    const data = getData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const file = new File([blob], `shopee-fee-backup-${new Date().toISOString().split('T')[0]}.json`, {
        type: 'application/json'
    });
    
    if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                title: '蝦皮手續費計算機 - 資料備份',
                text: '我的蝦皮手續費計算機資料備份',
                files: [file]
            });
            return true;
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
            }
            return false;
        }
    } else {
        // 不支援 Web Share API，使用一般下載
        exportData();
        return true;
    }
}

// === 資料遷移 ===

// 從 V1 版本遷移資料
function migrateFromV1() {
    try {
        const oldData = localStorage.getItem(OLD_STORAGE_KEY);
        if (!oldData) {
            // 沒有舊資料，初始化新資料
            saveData(defaultData);
            return;
        }
        
        const oldConfigs = JSON.parse(oldData);
        const newData = { ...defaultData, products: [] };
        
        // 將舊的「設定」轉換為新的「商品」
        if (Array.isArray(oldConfigs)) {
            oldConfigs.forEach(config => {
                if (config.name && config.cost !== undefined && config.sell !== undefined) {
                    newData.products.push({
                        id: generateUUID(),
                        name: config.name,
                        cost: parseFloat(config.cost) || 0,
                        salePrice: parseFloat(config.sell) || 0,
                        transactionFeeRate: parseFloat(config.fee) || 6.0,
                        isPreOrder: config.preorder === '3',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                }
            });
        }
        
        // 儲存遷移後的資料
        saveData(newData);
        
        // 備份舊資料
        localStorage.setItem(OLD_STORAGE_KEY + '-backup', oldData);
        
        console.log('Successfully migrated from V1 to V2');
    } catch (error) {
        console.error('Error migrating from V1:', error);
        // 遷移失敗，初始化新資料
        saveData(defaultData);
    }
}

// === 輔助函數 ===

// 生成 UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 格式化金額
function formatCurrency(amount) {
    return '$ ' + Math.round(amount).toLocaleString('zh-TW');
}

// 計算商品獲利 (簡化版,用於商品列表顯示)
function calculateProductProfit(product, isEvent = false) {
    const settings = getStoreSettings();
    const isMall = settings.sellerType === 'mall';
    const cost = product.cost;
    const price = product.salePrice;
    const feeRate = product.transactionFeeRate;
    
    // 基本手續費
    let transactionFee = price * feeRate / 100;
    if (!isMall && price > 35000) {
        transactionFee = 35000 * feeRate / 100;
    }
    
    // 活動日加成 (如果未參加蝦幣回饋)
    if (isEvent && settings.cashbackProgram === '0') {
        const eventIncrease = isMall ? 3 : 2;
        transactionFee += price * eventIncrease / 100;
    }
    
    const paymentFee = price * 0.025;
    const shippingFee = price * 0.06; // 假設方案一
    const cashbackFee = price * parseFloat(settings.cashbackProgram || 0) / 100;
    const preOrderFee = product.isPreOrder ? price * 0.03 : 0;
    
    const totalFee = transactionFee + paymentFee + shippingFee + cashbackFee + preOrderFee;
    
    // 簡化稅務計算
    let tax = 0;
    if (settings.taxSetting === '1') {
        tax = price * 0.01;
    } else if (settings.taxSetting === '5' || settings.taxSetting === '5_plus') {
        tax = price * 0.05 / 1.05;
    }
    
    const profit = price - cost - totalFee - tax;
    const profitMargin = price > 0 ? (profit / price * 100) : 0;
    
    return {
        profit: Math.round(profit),
        profitMargin: profitMargin.toFixed(1),
        totalFee: Math.round(totalFee)
    };
}

// 搜尋商品
function searchProducts(keyword) {
    const products = getProducts();
    if (!keyword) return products;
    
    const lowerKeyword = keyword.toLowerCase();
    return products.filter(p => 
        p.name.toLowerCase().includes(lowerKeyword)
    );
}

// 排序商品
function sortProducts(products, sortBy, ascending = true) {
    const sorted = [...products].sort((a, b) => {
        let aVal, bVal;
        
        switch(sortBy) {
            case 'name':
                return ascending ? 
                    a.name.localeCompare(b.name) : 
                    b.name.localeCompare(a.name);
            
            case 'cost':
                aVal = a.cost;
                bVal = b.cost;
                break;
            
            case 'price':
                aVal = a.salePrice;
                bVal = b.salePrice;
                break;
            
            case 'fee':
                aVal = a.transactionFeeRate;
                bVal = b.transactionFeeRate;
                break;
            
            case 'regularProfit':
                aVal = calculateProductProfit(a, false).profit;
                bVal = calculateProductProfit(b, false).profit;
                break;
            
            case 'eventProfit':
                aVal = calculateProductProfit(a, true).profit;
                bVal = calculateProductProfit(b, true).profit;
                break;
            
            default:
                return 0;
        }
        
        return ascending ? aVal - bVal : bVal - aVal;
    });
    
    return sorted;
}

// 顯示提示訊息
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white transform transition-all duration-300 ${
        type === 'success' ? 'bg-success' : 
        type === 'error' ? 'bg-danger' : 
        'bg-primary'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 初始化資料 (頁面載入時呼叫)
function initStorage() {
    // 確保資料結構存在
    const data = getData();
    if (!data.storeSettings || !Array.isArray(data.products)) {
        migrateFromV1();
    }
}

// 頁面載入時自動初始化
if (typeof window !== 'undefined') {
    initStorage();
}

// === 導出函數 ===
export {
    // 資料操作
    getData,
    saveData,
    
    // 賣場設定
    getStoreSettings,
    saveStoreSettings,
    
    // 商品操作
    getProducts,
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    sortProducts,
    
    // 匯入匯出
    exportData,
    importData,
    shareData,
    
    // 工具函數
    generateUUID,
    showToast,
    initStorage,
    
    // 舊版資料遷移
    migrateFromV1
};
