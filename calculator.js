// Get all input elements
const costPriceInput = document.getElementById('costPrice');
const sellPriceInput = document.getElementById('sellPrice');
const profitMarginInput = document.getElementById('profitMargin');
const transactionFeeInput = document.getElementById('transactionFee');

const sellPriceContainer = document.getElementById('sellPriceContainer');
const profitMarginContainer = document.getElementById('profitMarginContainer');
const modeRadios = document.querySelectorAll('input[name="calcMode"]');
const shippingOptionRadios = document.querySelectorAll('input[name="shippingOption"]');
const suggestedPriceRows = document.querySelectorAll('.suggested-price-row');

// Floating Header Elements
const floatSellContainer = document.getElementById('floatSellContainer');
const floatMarginContainer = document.getElementById('floatMarginContainer');

// Summary Table Elements
const suggestedPriceColumns = document.querySelectorAll('.suggested-price-column');

// Get cashback program radio buttons
const cashbackRadios = document.querySelectorAll('input[name="cashbackProgram"]');
const taxRadios = document.querySelectorAll('input[name="taxSetting"]');
const preOrderRadios = document.querySelectorAll('input[name="preOrder"]');

let currentMode = 'profit'; // 'profit' or 'price'
let currentShippingOption = 'both'; // 'both', 'ship1', or 'ship2'

// Format number with thousand separators and no decimals
function formatCurrency(amount) {
    return '$ ' + Math.round(amount).toLocaleString('zh-TW');
}

// Mode switching logic
modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentMode = e.target.value;
        updateModeUI();
        calculateFees();
    });
});

// Shipping option switching logic
shippingOptionRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentShippingOption = e.target.value;
        updateShippingOptionUI();
    });
});

function updateModeUI() {
    if (currentMode === 'profit') {
        // Input Section
        sellPriceContainer.style.display = '';
        profitMarginContainer.style.display = 'none';
        
        // Result Cards
        suggestedPriceRows.forEach(row => row.style.display = 'none');
        
        // Floating Header
        floatSellContainer.style.display = '';
        floatMarginContainer.style.display = 'none';
        
        // Summary Table
        suggestedPriceColumns.forEach(col => col.style.display = 'none');
    } else {
        // Input Section
        sellPriceContainer.style.display = 'none';
        profitMarginContainer.style.display = '';
        
        // Result Cards
        suggestedPriceRows.forEach(row => row.style.display = '');
        
        // Floating Header
        floatSellContainer.style.display = 'none';
        floatMarginContainer.style.display = '';
        
        // Summary Table
        suggestedPriceColumns.forEach(col => col.style.display = '');
    }
}

function updateShippingOptionUI() {
    // Get all result cards
    const regularShip1 = document.querySelector('.col-md-6:has(.result-card.regular):nth-of-type(1)');
    const regularShip2 = document.querySelector('.col-md-6:has(.result-card.regular):nth-of-type(2)');
    const eventShip1 = document.querySelector('.col-md-6:has(.result-card.event):nth-of-type(3)');
    const eventShip2 = document.querySelector('.col-md-6:has(.result-card.event):nth-of-type(4)');
    
    // Get all summary table rows
    const summaryRows = document.querySelectorAll('.table tbody tr');
    
    if (currentShippingOption === 'both') {
        // Show all cards
        if (regularShip1) regularShip1.style.display = '';
        if (regularShip2) regularShip2.style.display = '';
        if (eventShip1) eventShip1.style.display = '';
        if (eventShip2) eventShip2.style.display = '';
        
        // Show all summary rows
        summaryRows.forEach(row => row.style.display = '');
    } else if (currentShippingOption === 'ship1') {
        // Show only ship1 cards
        if (regularShip1) regularShip1.style.display = '';
        if (regularShip2) regularShip2.style.display = 'none';
        if (eventShip1) eventShip1.style.display = '';
        if (eventShip2) eventShip2.style.display = 'none';
        
        // Show only ship1 summary rows (row 0 and 2)
        summaryRows.forEach((row, index) => {
            row.style.display = (index === 0 || index === 2) ? '' : 'none';
        });
    } else if (currentShippingOption === 'ship2') {
        // Show only ship2 cards
        if (regularShip1) regularShip1.style.display = 'none';
        if (regularShip2) regularShip2.style.display = '';
        if (eventShip1) eventShip1.style.display = 'none';
        if (eventShip2) eventShip2.style.display = '';
        
        // Show only ship2 summary rows (row 1 and 3)
        summaryRows.forEach((row, index) => {
            row.style.display = (index === 1 || index === 3) ? '' : 'none';
        });
    }
}

// Calculate required price based on target margin
function calculateRequiredPrice(cost, marginPercent, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, isEvent, isShip2) {
    const margin = marginPercent / 100;
    const transRate = transactionFeeRate / 100;
    const paymentRate = 0.025;
    const eventRate = (isEvent && cashbackRate === 0) ? 0.02 : 0; // Event surcharge logic
    const shipRate = isShip2 ? 0 : 0.06; // Ship1 is 6%, Ship2 is fixed
    const cashbackRateVal = cashbackRate / 100;
    const preOrderRateVal = preOrderRate / 100;
    
    let taxRate = 0;
    let taxFixed = 0;
    
    if (taxSetting === '1') taxRate = 0.01;
    else if (taxSetting === '5') taxRate = 0.05;
    else if (taxSetting === '5_plus') {
        taxRate = 0.05;
        taxFixed = 2.5;
    }

    const shipFixed = isShip2 ? 60 : 0;
    
    const totalRateOther = paymentRate + eventRate + shipRate + cashbackRateVal + preOrderRateVal + taxRate;
    const totalFixed = shipFixed + taxFixed;

    // Case 1: Price <= 35000
    // P = (C + Fixed) / (1 - TransRate - OtherRate - Margin)
    const denominator1 = 1 - transRate - totalRateOther - margin;
    if (denominator1 <= 0) return 0; // Impossible to achieve margin
    
    let price = (cost + totalFixed) / denominator1;
    
    if (price > 35000) {
        // Case 2: Price > 35000
        // P = (C + 35000*TransRate + Fixed) / (1 - OtherRate - Margin)
        const denominator2 = 1 - totalRateOther - margin;
        if (denominator2 <= 0) return 0;
        price = (cost + 35000 * transRate + totalFixed) / denominator2;
    }
    
    return Math.ceil(price); // Round up to ensure margin
}

// Calculate fees and profit
function calculateFees() {
    const costPrice = parseFloat(costPriceInput.value) || 0;
    const transactionFeeRate = parseFloat(transactionFeeInput.value) || 0;
    
    // Get selected cashback program rate
    let cashbackRate = 0;
    let cashbackLabel = '不參加';
    cashbackRadios.forEach(radio => {
        if (radio.checked) {
            cashbackRate = parseFloat(radio.value);
            if (radio.id === 'cashback5') cashbackLabel = '5%';
            else if (radio.id === 'cashback10') cashbackLabel = '10%';
            else cashbackLabel = '不參加';
        }
    });
    const hasCashback = cashbackRate > 0;

    // Get selected pre-order rate
    let preOrderRate = 0;
    let preOrderLabel = '否';
    preOrderRadios.forEach(radio => {
        if (radio.checked) {
            preOrderRate = parseFloat(radio.value);
            preOrderLabel = radio.value === '0' ? '否' : '是';
        }
    });
    const hasPreOrder = preOrderRate > 0;

    // Get selected tax setting
    let taxSetting = '0';
    taxRadios.forEach(radio => {
        if (radio.checked) taxSetting = radio.value;
    });
    const hasTax = taxSetting !== '0';

    // Determine Prices
    let prices = {};
    if (currentMode === 'profit') {
        const p = parseFloat(sellPriceInput.value) || 0;
        prices = {
            'regular-ship1': p,
            'regular-ship2': p,
            'event-ship1': p,
            'event-ship2': p
        };
    } else {
        const margin = parseFloat(profitMarginInput.value) || 0;
        prices = {
            'regular-ship1': calculateRequiredPrice(costPrice, margin, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, false, false),
            'regular-ship2': calculateRequiredPrice(costPrice, margin, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, false, true),
            'event-ship1': calculateRequiredPrice(costPrice, margin, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, true, false),
            'event-ship2': calculateRequiredPrice(costPrice, margin, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, true, true)
        };
        
        // Update Suggested Price UI in Result Cards
        document.getElementById('regular-ship1-suggested-price').textContent = formatCurrency(prices['regular-ship1']);
        document.getElementById('regular-ship2-suggested-price').textContent = formatCurrency(prices['regular-ship2']);
        document.getElementById('event-ship1-suggested-price').textContent = formatCurrency(prices['event-ship1']);
        document.getElementById('event-ship2-suggested-price').textContent = formatCurrency(prices['event-ship2']);
        
        // Update Suggested Price UI in Summary Table
        document.getElementById('summary-regular-ship1-suggested').textContent = formatCurrency(prices['regular-ship1']);
        document.getElementById('summary-regular-ship2-suggested').textContent = formatCurrency(prices['regular-ship2']);
        document.getElementById('summary-event-ship1-suggested').textContent = formatCurrency(prices['event-ship1']);
        document.getElementById('summary-event-ship2-suggested').textContent = formatCurrency(prices['event-ship2']);
    }

    // Calculate and Update Scenarios
    calculateScenario('regular-ship1', prices['regular-ship1'], costPrice, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, false, false);
    calculateScenario('regular-ship2', prices['regular-ship2'], costPrice, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, false, true);
    calculateScenario('event-ship1', prices['event-ship1'], costPrice, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, true, false);
    calculateScenario('event-ship2', prices['event-ship2'], costPrice, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, true, true);

    // Update Floating Header
    document.getElementById('floatCost').textContent = formatCurrency(costPrice);
    
    if (currentMode === 'profit') {
        document.getElementById('floatSell').textContent = formatCurrency(prices['regular-ship1']);
    } else {
        document.getElementById('floatMargin').textContent = profitMarginInput.value + '%';
    }
    
    const floatPreOrder = document.getElementById('floatPreOrder');
    floatPreOrder.textContent = preOrderLabel;
    floatPreOrder.className = hasPreOrder ? 'badge bg-warning text-dark' : 'badge bg-secondary';

    const floatCashback = document.getElementById('floatCashback');
    floatCashback.textContent = cashbackLabel;
    floatCashback.className = cashbackRate > 0 ? 'badge bg-warning text-dark' : 'badge bg-secondary';
}

function calculateScenario(prefix, sellPrice, costPrice, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, isEvent, isShip2) {
    // Base fees
    const transactionPriceLimit = 35000;
    const transactionFee = Math.round(Math.min(sellPrice, transactionPriceLimit) * (transactionFeeRate / 100));
    const paymentFee = Math.round(sellPrice * 0.025);
    
    // Event surcharge
    const eventSurcharge = (isEvent && cashbackRate === 0) ? Math.round(sellPrice * 0.02) : 0;
    
    // Shipping Fee
    const shipFee = isShip2 ? 60 : Math.round(sellPrice * 0.06);
    
    // Cashback Fee
    const cashbackFee = Math.round(sellPrice * (cashbackRate / 100));
    
    // PreOrder Fee
    const preOrderFee = Math.round(sellPrice * (preOrderRate / 100));
    
    // Tax Fee
    let taxFee = 0;
    if (taxSetting === '1') {
        taxFee = Math.round(sellPrice * 0.01);
    } else if (taxSetting === '5') {
        taxFee = Math.round(sellPrice * 0.05);
    } else if (taxSetting === '5_plus') {
        taxFee = Math.round(sellPrice * 0.05 + 2.5);
    }

    const totalFee = transactionFee + paymentFee + eventSurcharge + shipFee + cashbackFee + taxFee + preOrderFee;
    const profit = sellPrice - costPrice - totalFee;

    // Update UI
    document.getElementById(`${prefix}-transaction`).textContent = formatCurrency(transactionFee);
    document.getElementById(`${prefix}-payment`).textContent = formatCurrency(paymentFee);
    
    if (isEvent) {
        document.getElementById(`${prefix}-surcharge`).textContent = formatCurrency(eventSurcharge);
    }
    
    document.getElementById(`${prefix}-shipping`).textContent = formatCurrency(shipFee);
    
    updateCashbackRow(prefix, cashbackRate > 0, cashbackFee);
    updatePreOrderRow(prefix, preOrderRate > 0, preOrderFee);
    updateTaxRow(prefix, taxSetting !== '0', taxFee);
    
    document.getElementById(`${prefix}-total`).textContent = formatCurrency(totalFee);
    document.getElementById(`${prefix}-profit`).textContent = formatCurrency(profit);
    updateProfitStyle(`${prefix}-profit-row`, profit);
    
    updateSummaryRow(prefix, totalFee, profit, sellPrice);
}

// Update summary table row
function updateSummaryRow(prefix, totalFee, profit, sellPrice) {
    document.getElementById(`summary-${prefix}-total`).textContent = formatCurrency(totalFee);
    
    const profitElement = document.getElementById(`summary-${prefix}-profit`);
    profitElement.textContent = formatCurrency(profit);
    
    // Update profit color
    if (profit < 0) {
        profitElement.classList.remove('text-success');
        profitElement.classList.add('text-danger');
    } else {
        profitElement.classList.remove('text-danger');
        profitElement.classList.add('text-success');
    }

    // Calculate and update margin
    const marginElement = document.getElementById(`summary-${prefix}-margin`);
    if (sellPrice > 0) {
        const margin = (profit / sellPrice) * 100;
        marginElement.textContent = margin.toFixed(1) + '%';
        
        if (margin < 0) {
            marginElement.classList.remove('text-muted', 'text-success');
            marginElement.classList.add('text-danger');
        } else {
            marginElement.classList.remove('text-danger', 'text-muted');
            marginElement.classList.add('text-success');
        }
    } else {
        marginElement.textContent = '0%';
        marginElement.classList.remove('text-danger', 'text-success');
        marginElement.classList.add('text-muted');
    }
}

// Update cashback row visibility and value
function updateCashbackRow(prefix, hasCashback, cashbackFee) {
    const row = document.getElementById(`${prefix}-cashback-row`);
    const value = document.getElementById(`${prefix}-cashback`);
    
    if (hasCashback) {
        row.style.display = '';
        value.textContent = formatCurrency(cashbackFee);
    } else {
        row.style.display = 'none';
    }
}

// Update pre-order row visibility and value
function updatePreOrderRow(prefix, hasPreOrder, preOrderFee) {
    const row = document.getElementById(`${prefix}-preorder-row`);
    const value = document.getElementById(`${prefix}-preorder`);
    
    if (hasPreOrder) {
        row.style.display = '';
        value.textContent = formatCurrency(preOrderFee);
    } else {
        row.style.display = 'none';
    }
}

// Update tax row visibility and value
function updateTaxRow(prefix, hasTax, taxFee) {
    const row = document.getElementById(`${prefix}-tax-row`);
    const value = document.getElementById(`${prefix}-tax`);
    
    if (hasTax) {
        row.style.display = '';
        value.textContent = formatCurrency(taxFee);
    } else {
        row.style.display = 'none';
    }
}

// Update profit row style based on positive/negative value
function updateProfitStyle(elementId, profit) {
    const element = document.getElementById(elementId);
    if (profit < 0) {
        element.classList.add('negative');
    } else {
        element.classList.remove('negative');
    }
}

// Add event listeners for real-time calculation
costPriceInput.addEventListener('input', calculateFees);
sellPriceInput.addEventListener('input', calculateFees);
profitMarginInput.addEventListener('input', calculateFees);
transactionFeeInput.addEventListener('input', calculateFees);

// Add event listeners for cashback program radio buttons
cashbackRadios.forEach(radio => {
    radio.addEventListener('change', calculateFees);
});

// Add event listeners for tax setting radio buttons
taxRadios.forEach(radio => {
    radio.addEventListener('change', calculateFees);
});

// Add event listeners for pre-order radio buttons
preOrderRadios.forEach(radio => {
    radio.addEventListener('change', calculateFees);
});

// Floating Header Logic
const floatingHeader = document.getElementById('floatingHeader');
const inputSection = document.querySelector('.input-section');

window.addEventListener('scroll', () => {
    const inputRect = inputSection.getBoundingClientRect();
    if (inputRect.bottom < 0) {
        floatingHeader.classList.add('visible');
    } else {
        floatingHeader.classList.remove('visible');
    }
});

floatingHeader.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Theme Toggle Logic
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const htmlElement = document.documentElement;

// Check for saved theme preference or system preference
const savedTheme = localStorage.getItem('theme');
const currentTheme = savedTheme || 'light';

// Apply initial theme
applyTheme(currentTheme);

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
    const newTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
});

function applyTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
        themeIcon.classList.remove('bi-moon-fill');
        themeIcon.classList.add('bi-sun-fill');
    } else {
        themeIcon.classList.remove('bi-sun-fill');
        themeIcon.classList.add('bi-moon-fill');
    }
}

// Initial calculation
updateShippingOptionUI();
calculateFees();

// Initialize Bootstrap tooltips
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
            trigger: 'click hover',
            html: true
        });
    });
    
    // Close tooltip when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('[data-bs-toggle="tooltip"]')) {
            tooltipTriggerList.forEach(function(tooltipTriggerEl) {
                const tooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
                if (tooltip) {
                    tooltip.hide();
                }
            });
        }
    });
});
