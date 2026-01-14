// Calc-Page.js - 快速計算頁面邏輯
// 整合原有計算邏輯並添加商品選擇器

// === 初始化 ===
document.addEventListener('DOMContentLoaded', function() {
    loadProductSidebar();
    initCalcEventListeners();
    loadStoreSettingsToForm();
});

// === 側邊欄相關 ===
function loadProductSidebar(searchKeyword = '') {
    const products = searchProducts(searchKeyword);
    const productList = document.getElementById('productList');
    
    if (!productList) return;
    
    if (products.length === 0) {
        if (searchKeyword) {
            productList.innerHTML = `
                <div class="p-8 text-center text-gray-500 dark:text-slate-400">
                    <i data-lucide="search-x" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                    <p class="text-sm">找不到符合的商品</p>
                </div>
            `;
        } else {
            productList.innerHTML = `
                <div class="p-8 text-center text-gray-500 dark:text-slate-400">
                    <i data-lucide="package-x" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                    <p class="text-sm">尚無商品</p>
                    <a href="management.html" class="text-xs text-primary hover:underline mt-2 inline-block">
                        前往新增商品
                    </a>
                </div>
            `;
        }
        lucide.createIcons();
        return;
    }
    
    productList.innerHTML = products.map(product => `
        <div class="product-item p-4" onclick="selectProduct('${product.id}')">
            <div class="flex justify-between items-start mb-1">
                <h3 class="font-medium text-gray-900 dark:text-white text-sm">${escapeHtml(product.name)}</h3>
                ${product.isPreOrder ? '<span class="text-xs bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400 px-2 py-0.5 rounded">預購</span>' : ''}
            </div>
            <div class="text-xs text-gray-600 dark:text-slate-400 space-y-1">
                <div>進價: ${formatCurrency(product.cost)}</div>
                <div>售價: ${formatCurrency(product.salePrice)}</div>
                <div>費率: ${product.transactionFeeRate}%</div>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

function selectProduct(productId) {
    const product = getProduct(productId);
    if (!product) return;
    
    // 填入表單
    document.getElementById('costPrice').value = product.cost;
    document.getElementById('sellPrice').value = product.salePrice;
    document.getElementById('transactionFee').value = product.transactionFeeRate;
    
    // 設定預購
    const preOrderRadio = document.querySelector(`input[name="preOrder"][value="${product.isPreOrder ? '3' : '0'}"]`);
    if (preOrderRadio) preOrderRadio.checked = true;
    
    // 關閉側邊欄 (mobile)
    if (window.innerWidth < 768) {
        document.getElementById('productSidebar').classList.remove('open');
    }
    
    // 觸發計算
    calculateFees();
    
    showToast(`已載入商品：${product.name}`, 'success');
}

// === 計算相關 ===
function initCalcEventListeners() {
    // 側邊欄搜尋
    const sidebarSearch = document.getElementById('sidebarSearch');
    if (sidebarSearch) {
        sidebarSearch.addEventListener('input', (e) => {
            loadProductSidebar(e.target.value);
        });
    }
    
    // 側邊欄切換 (mobile)
    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebar = document.getElementById('productSidebar');
    
    if (toggleSidebarBtn && sidebar) {
        toggleSidebarBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
        });
    }
    
    if (closeSidebarBtn && sidebar) {
        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }
    
    // 計算模式切換
    const modeRadios = document.querySelectorAll('input[name="calcMode"]');
    modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateCalcModeUI(e.target.value);
            calculateFees();
        });
    });
    
    // 輸入變更
    const inputs = ['costPrice', 'sellPrice', 'profitMargin', 'transactionFee'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculateFees);
        }
    });
    
    // Radio 變更
    const radioGroups = ['sellerType', 'preOrder', 'cashbackProgram'];
    radioGroups.forEach(name => {
        const radios = document.querySelectorAll(`input[name="${name}"]`);
        radios.forEach(radio => {
            radio.addEventListener('change', calculateFees);
        });
    });
}

function updateCalcModeUI(mode) {
    const sellPriceContainer = document.getElementById('sellPriceContainer');
    const profitMarginContainer = document.getElementById('profitMarginContainer');
    
    if (mode === 'profit') {
        sellPriceContainer.classList.remove('hidden');
        profitMarginContainer.classList.add('hidden');
    } else {
        sellPriceContainer.classList.add('hidden');
        profitMarginContainer.classList.remove('hidden');
    }
}

function loadStoreSettingsToForm() {
    const settings = getStoreSettings();
    
    // 載入賣家類型
    const sellerTypeRadio = document.querySelector(`input[name="sellerType"][value="${settings.sellerType}"]`);
    if (sellerTypeRadio) sellerTypeRadio.checked = true;
    
    // 載入蝦幣回饋
    const cashbackRadio = document.querySelector(`input[name="cashbackProgram"][value="${settings.cashbackProgram}"]`);
    if (cashbackRadio) cashbackRadio.checked = true;
}

function calculateFees() {
    const mode = document.querySelector('input[name="calcMode"]:checked')?.value || 'profit';
    const costPrice = parseFloat(document.getElementById('costPrice').value) || 0;
    const sellPrice = parseFloat(document.getElementById('sellPrice').value) || 0;
    const profitMargin = parseFloat(document.getElementById('profitMargin').value) || 5;
    const transactionFeeRate = parseFloat(document.getElementById('transactionFee').value) || 6;
    const sellerType = document.querySelector('input[name="sellerType"]:checked')?.value || 'general';
    const preOrderRate = parseFloat(document.querySelector('input[name="preOrder"]:checked')?.value) || 0;
    const cashbackRate = parseFloat(document.querySelector('input[name="cashbackProgram"]:checked')?.value) || 0;
    
    // 取得賣場設定
    const settings = getStoreSettings();
    const isMall = sellerType === 'mall';
    
    // 顯示結果
    renderResults({
        mode,
        costPrice,
        sellPrice,
        profitMargin,
        transactionFeeRate,
        isMall,
        preOrderRate,
        cashbackRate,
        taxSetting: settings.taxSetting || '0',
        hasProductInvoice: settings.hasProductInvoice || false,
        hasFeeInvoice: settings.hasFeeInvoice || false,
        costTaxType: settings.costTaxType || 'inc'
    });
}

function renderResults(params) {
    const container = document.getElementById('resultsContainer');
    if (!container) return;
    
    // 簡化版結果顯示 (詳細計算邏輯參考原 calculator.js)
    const scenarios = [
        { key: 'regular-ship1', label: '一般日 + 方案一 (6%)', isEvent: false, isShip2: false },
        { key: 'regular-ship2', label: '一般日 + 方案二 (+60元)', isEvent: false, isShip2: true },
        { key: 'event-ship1', label: '活動日 + 方案一 (6%)', isEvent: true, isShip2: false },
        { key: 'event-ship2', label: '活動日 + 方案二 (+60元)', isEvent: true, isShip2: true }
    ];
    
    const results = scenarios.map(scenario => {
        const result = calculateScenario({
            ...params,
            isEvent: scenario.isEvent,
            isShip2: scenario.isShip2
        });
        return { ...scenario, ...result };
    });
    
    container.innerHTML = `
        <div class="grid md:grid-cols-2 gap-6">
            ${results.map(result => `
                <div class="result-card">
                    <div class="result-card-header ${result.isEvent ? 'event' : 'regular'}">
                        <i data-lucide="${result.isEvent ? 'star' : 'calendar'}" class="w-5 h-5 inline-block mr-2"></i>
                        ${result.label}
                    </div>
                    <div class="p-6 space-y-3">
                        ${params.mode === 'price' ? `
                            <div class="flex justify-between items-center text-lg font-bold text-primary dark:text-primary-400">
                                <span>建議售價</span>
                                <span>${formatCurrency(result.suggestedPrice || 0)}</span>
                            </div>
                        ` : ''}
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600 dark:text-slate-400">總手續費</span>
                            <span class="font-semibold">${formatCurrency(result.totalFee || 0)}</span>
                        </div>
                        <div class="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-slate-700">
                            <span class="text-lg font-bold">獲利</span>
                            <span class="text-lg font-bold ${(result.profit || 0) >= 0 ? 'text-success' : 'text-danger'}">
                                ${formatCurrency(result.profit || 0)}
                            </span>
                        </div>
                        <div class="text-sm text-gray-500 dark:text-slate-400 text-right">
                            獲利率: ${result.profitMargin || 0}%
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    lucide.createIcons();
}

function calculateScenario(params) {
    const { 
        mode, costPrice, sellPrice, profitMargin, transactionFeeRate, 
        isMall, preOrderRate, cashbackRate, isEvent, isShip2,
        taxSetting, hasProductInvoice, hasFeeInvoice, costTaxType
    } = params;
    
    // 計算實際售價
    let actualPrice = sellPrice;
    if (mode === 'price') {
        // 用獲利率反推售價 (簡化版本)
        const margin = profitMargin / 100;
        const baseRate = transactionFeeRate / 100 + 0.025 + (isShip2 ? 0 : 0.06);
        actualPrice = Math.ceil(costPrice / (1 - margin - baseRate));
    }
    
    // 計算手續費
    const eventFeeIncrease = (isEvent && cashbackRate === 0) ? (isMall ? 3 : 2) : 0;
    let transactionFee = actualPrice * (transactionFeeRate + eventFeeIncrease) / 100;
    if (!isMall && actualPrice > 35000) {
        transactionFee = 35000 * (transactionFeeRate + eventFeeIncrease) / 100;
    }
    
    const paymentFee = actualPrice * 0.025;
    const shippingFee = isShip2 ? 60 : actualPrice * 0.06;
    const cashbackFee = actualPrice * cashbackRate / 100;
    const preOrderFee = actualPrice * preOrderRate / 100;
    
    const totalFee = transactionFee + paymentFee + shippingFee + cashbackFee + preOrderFee;
    
    // 簡化稅務計算
    let tax = 0;
    if (taxSetting === '1') {
        tax = actualPrice * 0.01;
    } else if (taxSetting === '5' || taxSetting === '5_plus') {
        tax = actualPrice * 0.05 / 1.05;
    }
    
    const actualCost = costTaxType === 'inc' ? costPrice : costPrice * 1.05;
    const profit = actualPrice - actualCost - totalFee - tax;
    const profitMarginCalc = actualPrice > 0 ? (profit / actualPrice * 100) : 0;
    
    return {
        suggestedPrice: mode === 'price' ? actualPrice : null,
        totalFee: Math.round(totalFee),
        profit: Math.round(profit),
        profitMargin: profitMarginCalc.toFixed(1)
    };
}

// === 輔助函數 ===
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
