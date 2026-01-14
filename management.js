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
            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" class="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" data-sort="name">
                            商品名稱 <i class="bi bi-arrow-down-up"></i>
                        </th>
                        <th scope="col" class="px-6 py-3">進價</th>
                        <th scope="col" class="px-6 py-3">售價</th>
                        <th scope="col" class="px-6 py-3">成交費率</th>
                        <th scope="col" class="px-6 py-3">預購</th>
                        <th scope="col" class="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" data-sort="profit">
                            一般日獲利 <i class="bi bi-arrow-down-up"></i>
                        </th>
                        <th scope="col" class="px-6 py-3">操作</th>
                    </tr>
                </thead>
                <tbody id="productsTableBody">
                    ${products.length === 0 ? `
                        <tr>
                            <td colspan="7" class="px-6 py-12 text-center">
                                <div class="flex flex-col items-center text-gray-500 dark:text-gray-400">
                                    <i class="bi bi-inbox text-5xl mb-4 opacity-50"></i>
                                    <p class="text-lg font-medium">尚無商品資料</p>
                                    <p class="text-sm mt-2">點擊「新增商品」按鈕開始建立您的商品清單</p>
                                </div>
                            </td>
                        </tr>
                    ` : products.map(product => {
                        const regularProfit = calculateSimpleProfit(product, settings, false);
                        return `
                            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    ${escapeHtml(product.name)}
                                    ${product.isPreOrder ? '<span class="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">預購</span>' : ''}
                                </th>
                                <td class="px-6 py-4">$${product.cost.toLocaleString()}</td>
                                <td class="px-6 py-4">$${product.salePrice.toLocaleString()}</td>
                                <td class="px-6 py-4">${product.transactionFeeRate}%</td>
                                <td class="px-6 py-4">${product.isPreOrder ? '是' : '否'}</td>
                                <td class="px-6 py-4 font-semibold ${regularProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                                    $${regularProfit.toLocaleString()}
                                </td>
                                <td class="px-6 py-4">
                                    <button class="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-3" onclick="editProduct('${product.id}')">
                                        <i class="bi bi-pencil-square"></i> 編輯
                                    </button>
                                    <button class="font-medium text-red-600 dark:text-red-500 hover:underline" onclick="deleteProductConfirm('${product.id}')">
                                        <i class="bi bi-trash"></i> 刪除
                                    </button>
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
                        <label for="productFeeRate" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">成交費率 (%) *</label>
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

function calculateSimpleProfit(product, settings, isEvent) {
    const transactionFee = product.salePrice * (product.transactionFeeRate / 100);
    const paymentFee = product.salePrice * 0.025;
    const shippingFee = settings.shippingOption === 'ship2' ? 60 : product.salePrice * 0.06;
    const preOrderFee = product.isPreOrder ? product.salePrice * 0.03 : 0;
    const eventFee = isEvent ? product.salePrice * (settings.sellerType === 'mall' ? 0.03 : 0.02) : 0;
    
    const totalFee = transactionFee + paymentFee + shippingFee + preOrderFee + eventFee;
    return Math.round(product.salePrice - product.cost - totalFee);
}

function openModal(productId = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    
    form.reset();
    document.getElementById('productId').value = '';
    title.textContent = '新增商品';
    
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
        isPreOrder: document.getElementById('productIsPreOrder').checked
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

window.closeModal = closeModal;
