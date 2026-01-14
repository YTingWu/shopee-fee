import { getHeader, initThemeToggle } from './components/header.js';
import { getFooter } from './components/footer.js';
import { getStoreSettings, saveStoreSettings, getData, saveData, exportData, importData } from './storage-v2.js';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('main-header').innerHTML = getHeader('settings');
    document.getElementById('main-footer').innerHTML = getFooter();
    initThemeToggle();

    renderSettingsForm();
    document.getElementById('settings-form-container').addEventListener('change', handleSettingChange);
    document.getElementById('settings-form-container').addEventListener('click', handleButtonClick);
});

function renderSettingsForm() {
    const settings = getStoreSettings();
    const container = document.getElementById('settings-form-container');
    if (!container) return;

    container.innerHTML = `
        <form id="storeSettingsForm" class="space-y-8">
            <!-- Seller Type -->
            <div>
                <label class="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">賣家類型</label>
                <div class="flex flex-col sm:flex-row gap-4">
                    <label class="inline-flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <input type="radio" name="sellerType" value="general" class="form-radio h-5 w-5 text-primary" ${settings.sellerType === 'general' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700 dark:text-gray-300">一般賣家</span>
                    </label>
                    <label class="inline-flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <input type="radio" name="sellerType" value="mall" class="form-radio h-5 w-5 text-primary" ${settings.sellerType === 'mall' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700 dark:text-gray-300">商城賣家</span>
                    </label>
                </div>
            </div>

            <!-- Shipping Option -->
            <div>
                <label class="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">免運方案</label>
                <div class="flex flex-col sm:flex-row gap-4">
                    <label class="inline-flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <input type="radio" name="shippingOption" value="ship1" class="form-radio h-5 w-5 text-primary" ${settings.shippingOption === 'ship1' || settings.shippingOption === 'both' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700 dark:text-gray-300">方案一 (6%)</span>
                    </label>
                    <label class="inline-flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <input type="radio" name="shippingOption" value="ship2" class="form-radio h-5 w-5 text-primary" ${settings.shippingOption === 'ship2' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700 dark:text-gray-300">方案二 (+60元)</span>
                    </label>
                </div>
            </div>

            <!-- Cashback Program -->
            <div>
                <label class="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">蝦幣回饋方案</label>
                <div class="flex flex-col gap-3">
                    <label class="inline-flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <input type="radio" name="cashbackProgram" value="0" class="form-radio h-5 w-5 text-primary" ${settings.cashbackProgram === '0' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700 dark:text-gray-300">無參加</span>
                    </label>
                    <label class="inline-flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <input type="radio" name="cashbackProgram" value="1.5" class="form-radio h-5 w-5 text-primary" ${settings.cashbackProgram === '1.5' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700 dark:text-gray-300">5%蝦幣回饋方案 (1.5%)</span>
                    </label>
                    <label class="inline-flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <input type="radio" name="cashbackProgram" value="2.5" class="form-radio h-5 w-5 text-primary" ${settings.cashbackProgram === '2.5' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700 dark:text-gray-300">10%蝦幣回饋方案 (2.5%)</span>
                    </label>
                </div>
            </div>

            <!-- Tax Setting -->
            <div>
                <label class="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">稅務設定</label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label class="inline-flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <input type="radio" name="taxSetting" value="0" class="form-radio h-5 w-5 text-primary" ${settings.taxSetting === '0' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700 dark:text-gray-300">無</span>
                    </label>
                    <label class="inline-flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <input type="radio" name="taxSetting" value="1" class="form-radio h-5 w-5 text-primary" ${settings.taxSetting === '1' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700 dark:text-gray-300">稅籍登記 (1%)</span>
                    </label>
                    <label class="inline-flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <input type="radio" name="taxSetting" value="5" class="form-radio h-5 w-5 text-primary" ${settings.taxSetting === '5' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700 dark:text-gray-300">發票 (5%)</span>
                    </label>
                    <label class="inline-flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <input type="radio" name="taxSetting" value="5_plus" class="form-radio h-5 w-5 text-primary" ${settings.taxSetting === '5_plus' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700 dark:text-gray-300">蝦皮代開發票 (5% + 2.5元)</span>
                    </label>
                </div>
            </div>

            <!-- Input Tax Options -->
            <div id="inputTaxOptions" class="${(settings.taxSetting === '5' || settings.taxSetting === '5_plus') ? '' : 'hidden'} bg-gray-50 dark:bg-gray-700 p-5 rounded-xl border border-gray-200 dark:border-gray-600">
                <label class="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">進項發票設定 (扣抵稅額)</label>
                <div class="flex flex-col gap-3">
                    <label class="inline-flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <input type="checkbox" name="hasProductInvoice" class="form-checkbox h-5 w-5 text-primary rounded" ${settings.hasProductInvoice ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700 dark:text-gray-300">有商品進項發票</span>
                    </label>
                    <label class="inline-flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <input type="checkbox" name="hasFeeInvoice" class="form-checkbox h-5 w-5 text-primary rounded" ${settings.hasFeeInvoice ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700 dark:text-gray-300">有手續費進項發票</span>
                    </label>
                </div>
            </div>

            <div class="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                <button type="button" id="clearCacheBtn" class="w-full sm:w-auto px-6 py-2.5 bg-danger text-white font-medium rounded-lg hover:bg-danger-600 transition-colors shadow-sm order-3 sm:order-1">清除所有快取</button>
                <div class="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
                    <button type="button" id="exportSettingsBtn" class="flex-1 sm:w-auto px-6 py-2.5 bg-success text-white font-medium rounded-lg hover:bg-success-600 transition-colors shadow-sm">匯出設定</button>
                    <button type="button" id="importSettingsBtn" class="flex-1 sm:w-auto px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm">匯入設定</button>
                    <input type="file" id="importSettingsInput" accept=".json" class="hidden">
                </div>
            </div>
        </form>
    `;
    updateInputTaxOptionsVisibility(settings.taxSetting);
}

function handleSettingChange(event) {
    const { name, value, type, checked } = event.target;
    let newSettings = {};

    if (type === 'radio') {
        newSettings[name] = value;
    } else if (type === 'checkbox') {
        newSettings[name] = checked;
    }

    const currentSettings = getStoreSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    saveStoreSettings(updatedSettings);

    if (name === 'taxSetting') {
        updateInputTaxOptionsVisibility(value);
    }
    console.log('Settings updated:', getStoreSettings());
}

function updateInputTaxOptionsVisibility(taxSetting) {
    const inputTaxOptions = document.getElementById('inputTaxOptions');
    if (inputTaxOptions) {
        if (taxSetting === '5' || taxSetting === '5_plus') {
            inputTaxOptions.classList.remove('hidden');
        } else {
            inputTaxOptions.classList.add('hidden');
        }
    }
}

function handleButtonClick(event) {
    if (event.target.id === 'exportSettingsBtn') {
        exportSettings();
    } else if (event.target.id === 'importSettingsBtn') {
        document.getElementById('importSettingsInput').click();
    } else if (event.target.id === 'clearCacheBtn') {
        clearAllCache();
    }
}

function clearAllCache() {
    if (confirm('確定要清除所有快取嗎？此動作將會「還原賣場設定」並「清除商品管理所有資料」，且無法復原。')) {
        localStorage.clear();
        alert('快取已清除，頁面將重新載入。');
        window.location.reload();
    }
}

document.getElementById('settings-form-container').addEventListener('change', (event) => {
    if (event.target.id === 'importSettingsInput') {
        importSettings(event.target.files[0]);
    }
});

function exportSettings() {
    exportData();
    alert('設定已匯出！');
}

function importSettings(file) {
    if (!file) {
        alert('請選擇一個 JSON 檔案。');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const success = importData(e.target.result);
        if (success) {
            alert('設定已成功匯入！');
            renderSettingsForm(); // Re-render form with new settings
        } else {
            alert('匯入失敗，請確認檔案格式是否正確。');
        }
    };
    reader.readAsText(file);
}
