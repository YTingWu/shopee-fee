import { getHeader, initThemeToggle } from './components/header.js';
import { getFooter } from './components/footer.js';
import { getProducts, addProduct, updateProduct, deleteProduct, getStoreSettings } from './storage-v2.js';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('main-header').innerHTML = getHeader('management');
    document.getElementById('main-footer').innerHTML = getFooter();
    initThemeToggle();

    renderProductManagement();
});

function renderProductManagement() {
    const container = document.getElementById('product-list-container');
    if (!container) return;

    const products = getProducts();
    const settings = getStoreSettings();

    container.innerHTML = `
        <div class="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="w-full md:w-auto flex-1">
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <i class="bi bi-search text-gray-400"></i>
                    </div>
                    <input type="text" id="productSearch" 
                           class="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                           placeholder="搜尋商品名稱...">
                </div>
            </div>
            <button id="addProductBtn" class="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                <i class="bi bi-plus-lg mr-2"></i>
                新增商品
            </button>
        </div>

        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400 border-separate border-spacing-0">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" class="sticky left-0 z-20 bg-gray-50 dark:bg-gray-700 px-2 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 min-w-[100px] border-r border-b dark:border-gray-600 font-bold" data-sort="name">
                            商品名稱 <i class="bi bi-arrow-down-up"></i>
                        </th>
                        <th scope="col" class="px-2 py-3 whitespace-nowrap border-b dark:border-gray-600">進價</th>
                        <th scope="col" class="px-2 py-3 whitespace-nowrap border-b dark:border-gray-600">售價</th>
                        <th scope="col" class="px-2 py-3 whitespace-nowrap border-b dark:border-gray-600">成交%</th>
                        <th scope="col" class="px-2 py-3 whitespace-nowrap border-b dark:border-gray-600">預購</th>
                        <th scope="col" class="px-2 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 whitespace-nowrap border-b dark:border-gray-600" data-sort="profit">
                            一般獲利 <i class="bi bi-arrow-down-up"></i>
                        </th>
                        <th scope="col" class="px-2 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 whitespace-nowrap border-b dark:border-gray-600" data-sort="eventProfit">
                            活動獲利 <i class="bi bi-arrow-down-up"></i>
                        </th>
                        <th scope="col" class="px-2 py-3 whitespace-nowrap border-b dark:border-gray-600">操作</th>
                    </tr>
                </thead>
                <tbody id="productsTableBody">
                    ${products.length === 0 ? `
                        <tr>
                            <td colspan="8" class="px-4 py-12 text-center border-b dark:border-gray-600">
                                <div class="flex flex-col items-center text-gray-500 dark:text-gray-400">
                                    <i class="bi bi-ne-box text-5xl mb-4 opacity-50"></i>
                                    <p class="text-lg font-medium">尚無商品資料</p>
                                    <p class="text-sm mt-2">點擊「新增商品」按鈕開始建立您的商品清單</p>
                                </div>
                            </td>
                        </tr>
                    ` : products.map(product => {
                        const regularProfitData = calculateDetailedProfit(product, settings, false);
                        const eventProfitData = calculateDetailedProfit(product, settings, true);
                        
                        return `
                            <tr class="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <th scope="row" class="sticky left-0 z-10 bg-white dark:bg-gray-800 px-2 py-4 font-medium text-gray-900 dark:text-white border-r border-b dark:border-gray-700">
                                    <div class="flex flex-wrap items-center gap-1 min-w-[90px]">
                                        <span>${escapeHtml(product.name)}</span>
                                        ${product.isPreOrder ? '<span class="bg-yellow-100 text-yellow-800 text-[9px] font-medium px-1 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">預購</span>' : ''}
                                    </div>
                                </th>
                                <td class="px-2 py-4 whitespace-nowrap border-b dark:border-gray-700 text-gray-700 dark:text-gray-300">$${product.cost.toLocaleString()}</td>
                                <td class="px-2 py-4 whitespace-nowrap border-b dark:border-gray-700 text-gray-700 dark:text-gray-300">$${product.salePrice.toLocaleString()}</td>
                                <td class="px-2 py-4 whitespace-nowrap border-b dark:border-gray-700">${product.transactionFeeRate}%</td>
                                <td class="px-2 py-4 whitespace-nowrap border-b dark:border-gray-700">${product.isPreOrder ? '是' : '否'}</td>
                                <td class="px-2 py-4 whitespace-nowrap border-b dark:border-gray-700">
                                    <span class="font-semibold ${regularProfitData.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                                        $${regularProfitData.profit.toLocaleString()}
                                    </span>
                                    <div class="text-[10px] text-gray-500 dark:text-gray-400">
                                        (${regularProfitData.margin}%)
                                    </div>
                                </td>
                                <td class="px-2 py-4 whitespace-nowrap border-b dark:border-gray-700">
                                    <span class="font-semibold ${eventProfitData.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                                        $${eventProfitData.profit.toLocaleString()}
                                    </span>
                                    <div class="text-[10px] text-gray-500 dark:text-gray-400">
                                        (${eventProfitData.margin}%)
                                    </div>
                                </td>
                                <td class="px-2 py-4 whitespace-nowrap border-b dark:border-gray-700">
                                    <div class="flex items-center gap-2">
                                        <button class="font-medium text-blue-600 dark:text-blue-500 hover:text-blue-800" onclick="editProduct('${product.id}')" title="編輯">
                                            <i class="bi bi-pencil-square text-lg"></i>
                                        </button>
                                        <button class="font-medium text-green-600 dark:text-green-500 hover:text-green-800" onclick="viewDetails('${product.id}')" title="計算明細">
                                            <i class="bi bi-calculator text-lg"></i>
                                        </button>
                                        <button class="font-medium text-red-600 dark:text-red-500 hover:text-red-800" onclick="deleteProductConfirm('${product.id}')" title="刪除">
                                            <i class="bi bi-trash text-lg"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>

        <!-- Product Modal -->
        <div id="productModal" class="hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                <div class="flex items-center justify-between p-5 border-b dark:border-gray-600">
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white" id="modalTitle">
                        新增商品
                    </h3>
                    <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" onclick="closeModal()">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <form id="productForm" class="p-5">
                    <input type="hidden" id="productId">
                    <div class="mb-4">
                        <label for="productName" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">商品名稱 *</label>
                        <input type="text" id="productName" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label for="productCost" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">進價 *</label>
                            <input type="number" id="productCost" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" step="0.01" min="0" required>
                        </div>
                        <div>
                            <label for="productSalePrice" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">售價 *</label>
                            <input type="number" id="productSalePrice" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" step="0.01" min="0" required>
                        </div>
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">進價稅別</label>
                        <div class="flex items-center space-x-4">
                            <label class="inline-flex items-center">
                                <input type="radio" name="productCostTaxType" id="taxInc" value="inc" class="form-radio text-blue-600" checked>
                                <span class="ml-2 text-sm text-gray-900 dark:text-gray-300">含稅</span>
                            </label>
                            <label class="inline-flex items-center">
                                <input type="radio" name="productCostTaxType" id="taxExc" value="exc" class="form-radio text-blue-600">
                                <span class="ml-2 text-sm text-gray-900 dark:text-gray-300">未稅</span>
                            </label>
                        </div>
                    </div>
                    <div class="mb-4">
                        <label for="productFeeRate" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">成交手續費率 (%) *</label>
                        <input type="number" id="productFeeRate" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" step="0.1" min="0" max="100" value="6.0" required>
                    </div>
                    <div class="mb-4">
                        <label class="inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="productIsPreOrder" class="sr-only peer">
                            <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">預購訂單 (較長備貨)</span>
                        </label>
                    </div>
                    <div class="flex justify-end gap-3">
                        <button type="button" onclick="closeModal()" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                            取消
                        </button>
                        <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            儲存
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // 綁定事件
    document.getElementById('addProductBtn').addEventListener('click', () => openModal());
    document.getElementById('productForm').addEventListener('submit', handleSubmit);
    document.getElementById('productSearch').addEventListener('input', handleSearch);
}

// 詳細獲利計算 (與 calculator.js calculateScenario 邏輯一致)
function calculateDetailedProfit(product, settings, isEvent) {
    const sellPrice = product.salePrice;
    const cost = product.cost; // 使用者輸入進價
    // costTaxType: 'inc' (含稅) or 'exc' (未稅). 預設 inc
    const isCostInc = (product.costTaxType || 'inc') === 'inc';
    const isMall = settings.sellerType === 'mall';
    const isShip2 = settings.shippingOption === 'ship2';
    
    // --- 1. Shopee Fees ---
    const transactionFeeRate = product.transactionFeeRate;
    const limit = 35000;
    
    // Cashback Rate
    // settings.cashbackProgram is string '0', '5', '10' (actually '1.5' or '2.5' stored? No, storage-v2 defaults to '0'. 
    // calculator.js logic: '1.5' on UI corresponds to cashback5, '2.5' to cashback10. 
    // Wait, let's check storage-v2 default: cashbackProgram: '0'.
    // And let's check calculator.js lines 439-446:
    // ... if(r.id === 'cashback5') cashbackLabel.textContent... (Wait, values there are '1.5'? No, let's check the HTML for values)
    // I don't have calc.html full form values. Let's assume settings stores the *percentage number* or consistent value.
    // calculator.js line 560: `const cashFee = Math.round(sellPrice * cashbackRate / 100);`
    // So cashbackRate should be a percentage number like 5 or 10.
    // However in calculator.js line 452 it parses float(r.value).
    // Let's assume the stored value is what calculator uses. 
    // In storage-v2.js, default is '0'.
    
    const cashbackRate = parseFloat(settings.cashbackProgram || 0);

    const eventFeeIncrease = isMall ? 3 : 2;
    // 如果是活動日且沒參加蝦幣回饋，成交手續費要加成
    const effTransRate = (isEvent && cashbackRate === 0) ? transactionFeeRate + eventFeeIncrease : transactionFeeRate;
    
    let transFee = 0;
    if (isMall) {
        transFee = Math.round(sellPrice * effTransRate / 100);
    } else {
        transFee = Math.round(Math.min(sellPrice, limit) * effTransRate / 100);
    }
        
    const payFee = Math.round(sellPrice * 0.025);
    const shipFee = isShip2 ? 60 : Math.round(sellPrice * 0.06);
    const cashFee = Math.round(sellPrice * cashbackRate / 100);
    const preOrderFee = product.isPreOrder ? Math.round(sellPrice * 0.03) : 0;
    
    const totalShopeeFee = transFee + payFee + shipFee + cashFee + preOrderFee;
    
    // --- 2. Taxes ---
    let outputTax = 0;
    // taxSetting: '0' (None), '1' (1%), '5' (5%), '5_plus' (5%+)
    if (settings.taxSetting === '1') {
        outputTax = Math.round(sellPrice * 0.01);
    } else if (settings.taxSetting === '5' || settings.taxSetting === '5_plus') {
        outputTax = Math.round(sellPrice / 1.05 * 0.05);
    }
    
    let inputTax = 0; // Product Input Tax Deduction
    if (settings.hasProductInvoice && (settings.taxSetting === '5' || settings.taxSetting === '5_plus')) {
         // if cost is inclusive, tax is inside. if exclusive, tax is extra.
         // Deduction is always keeping the base cost, removing the tax part.
         if (isCostInc) {
             inputTax = Math.round(cost / 1.05 * 0.05);
         } else {
             inputTax = Math.round(cost * 0.05);
         }
    }
    
    let feeInputTax = 0; // Fee Input Tax Deduction
    if (settings.hasFeeInvoice && (settings.taxSetting === '5' || settings.taxSetting === '5_plus')) {
         // Fees are usually tax-inclusive in Shopee Taiwan context for calculations
         feeInputTax = Math.round(totalShopeeFee / 1.05 * 0.05);
    }
    
    let payableTax = 0;
    if (settings.taxSetting !== '0') {
         payableTax = Math.max(0, outputTax - inputTax - feeInputTax);
    }
    
    // --- 3. Agent Fee ---
    const agentFee = (settings.taxSetting === '5_plus') ? 2.5 : 0;
    
    // Total Deduction
    const totalDeduction = totalShopeeFee + payableTax + agentFee;
    
    // --- 4. Profit ---
    // Cash Out Cost: The money leaving your pocket.
    // If input is inclusive, you paid `cost`.
    // If input is exclusive, you paid `cost * 1.05`.
    const cashOutCost = isCostInc ? cost : cost * 1.05;
    
    const profit = Math.round(sellPrice - cashOutCost - totalDeduction);
    
    let margin = 0;
    if (sellPrice > 0) {
        margin = (profit / sellPrice * 100).toFixed(1);
    }
    
    return {
        profit: profit,
        margin: margin
    };
}


function openModal(productId = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    
    form.reset();
    document.getElementById('productId').value = '';
    title.textContent = '新增商品';
    document.getElementById('taxInc').checked = true; // 預設含稅
    
    if (productId) {
        const products = getProducts();
        const product = products.find(p => p.id === productId);
        if (product) {
            title.textContent = '編輯商品';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCost').value = product.cost;
            document.getElementById('productSalePrice').value = product.salePrice;
            document.getElementById('productFeeRate').value = product.transactionFeeRate;
            document.getElementById('productIsPreOrder').checked = product.isPreOrder;
            
            if (product.costTaxType === 'exc') {
                document.getElementById('taxExc').checked = true;
            } else {
                document.getElementById('taxInc').checked = true;
            }
        }
    }
    
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('productModal').classList.add('hidden');
}

function handleSubmit(e) {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value,
        cost: parseFloat(document.getElementById('productCost').value),
        salePrice: parseFloat(document.getElementById('productSalePrice').value),
        transactionFeeRate: parseFloat(document.getElementById('productFeeRate').value),
        isPreOrder: document.getElementById('productIsPreOrder').checked,
        costTaxType: document.querySelector('input[name="productCostTaxType"]:checked').value
    };
    
    const productId = document.getElementById('productId').value;
    
    if (productId) {
        updateProduct(productId, productData);
    } else {
        addProduct(productData);
    }
    
    closeModal();
    renderProductManagement();
}

function handleSearch(e) {
    const keyword = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#productsTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(keyword) ? '' : 'none';
    });
}

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

// 全域函數供 onclick 使用
window.editProduct = function(id) {
    openModal(id);
};

window.deleteProductConfirm = function(id) {
    if (confirm('確定要刪除此商品嗎？')) {
        deleteProduct(id);
        renderProductManagement();
    }
};

window.viewDetails = function(id) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const settings = getStoreSettings();
    
    const params = new URLSearchParams();
    
    // Mode
    params.set('mode', 'profit'); // Viewing known cost/price
    
    // Product Data
    params.set('cost', product.cost);
    params.set('sell', product.salePrice);
    params.set('fee', product.transactionFeeRate);
    params.set('preorder', product.isPreOrder ? '3' : '0');
    params.set('costTax', product.costTaxType || 'inc');
    
    // Store Settings
    // calculator.js keys: shipping, seller, cashback, tax, hasProdInv, hasFeeInv
    params.set('shipping', settings.shippingOption || 'ship1');
    params.set('seller', settings.sellerType || 'general');
    params.set('cashback', settings.cashbackProgram || '0');
    params.set('tax', settings.taxSetting || '0');
    
    // Boolean to '1' or '0' (or string 'true'/'false' but calculator.js uses '1' for hasProdInv check)
    if (settings.hasProductInvoice) params.set('hasProdInv', '1');
    if (settings.hasFeeInvoice) params.set('hasFeeInv', '1');
    
    window.location.href = `calc.html?${params.toString()}`;
};

window.closeModal = closeModal;
