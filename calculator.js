// Get all input elements
const costPriceInput = document.getElementById('costPrice');
const sellPriceInput = document.getElementById('sellPrice');
const transactionFeeInput = document.getElementById('transactionFee');

// Get cashback program radio buttons
const cashbackRadios = document.querySelectorAll('input[name="cashbackProgram"]');
const taxRadios = document.querySelectorAll('input[name="taxSetting"]');
const preOrderRadios = document.querySelectorAll('input[name="preOrder"]');

// Format number with thousand separators and no decimals
function formatCurrency(amount) {
    return '$ ' + Math.round(amount).toLocaleString('zh-TW');
}

// Calculate fees and profit
function calculateFees() {
    const costPrice = parseFloat(costPriceInput.value) || 0;
    const sellPrice = parseFloat(sellPriceInput.value) || 0;
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
    let taxFee = 0;
    let hasTax = false;
    taxRadios.forEach(radio => {
        if (radio.checked) {
            if (radio.value === '1') {
                taxFee = Math.round(sellPrice * 0.01);
                hasTax = true;
            } else if (radio.value === '5') {
                taxFee = Math.round(sellPrice * 0.05);
                hasTax = true;
            } else if (radio.value === '5_plus') {
                taxFee = Math.round(sellPrice * 0.05 + 2.5);
                hasTax = true;
            }
        }
    });

    // Base fees
    const transactionPriceLimit = 35000;
    const transactionFee = Math.round(Math.min(sellPrice, transactionPriceLimit) * (transactionFeeRate / 100));
    const paymentFee = Math.round(sellPrice * 0.025);
    // Event surcharge is 0% if participating in cashback program, otherwise 2%
    const eventSurcharge = hasCashback ? 0 : Math.round(sellPrice * 0.02);
    const ship1Fee = Math.round(sellPrice * 0.06);
    const ship2Fee = 60;
    const cashbackFee = Math.round(sellPrice * (cashbackRate / 100));
    const preOrderFee = Math.round(sellPrice * (preOrderRate / 100));

    // Regular Day + Shipping Option 1
    const regularShip1Total = transactionFee + paymentFee + ship1Fee + cashbackFee + taxFee + preOrderFee;
    const regularShip1Profit = sellPrice - costPrice - regularShip1Total;

    // Regular Day + Shipping Option 2
    const regularShip2Total = transactionFee + paymentFee + ship2Fee + cashbackFee + taxFee + preOrderFee;
    const regularShip2Profit = sellPrice - costPrice - regularShip2Total;

    // Event Day + Shipping Option 1
    const eventShip1Total = transactionFee + paymentFee + eventSurcharge + ship1Fee + cashbackFee + taxFee + preOrderFee;
    const eventShip1Profit = sellPrice - costPrice - eventShip1Total;

    // Event Day + Shipping Option 2
    const eventShip2Total = transactionFee + paymentFee + eventSurcharge + ship2Fee + cashbackFee + taxFee + preOrderFee;
    const eventShip2Profit = sellPrice - costPrice - eventShip2Total;

    // Update Regular Day + Shipping Option 1
    document.getElementById('regular-ship1-transaction').textContent = formatCurrency(transactionFee);
    document.getElementById('regular-ship1-payment').textContent = formatCurrency(paymentFee);
    document.getElementById('regular-ship1-shipping').textContent = formatCurrency(ship1Fee);
    updateCashbackRow('regular-ship1', hasCashback, cashbackFee);
    updatePreOrderRow('regular-ship1', hasPreOrder, preOrderFee);
    updateTaxRow('regular-ship1', hasTax, taxFee);
    document.getElementById('regular-ship1-total').textContent = formatCurrency(regularShip1Total);
    document.getElementById('regular-ship1-profit').textContent = formatCurrency(regularShip1Profit);
    updateProfitStyle('regular-ship1-profit-row', regularShip1Profit);

    // Update Regular Day + Shipping Option 2
    document.getElementById('regular-ship2-transaction').textContent = formatCurrency(transactionFee);
    document.getElementById('regular-ship2-payment').textContent = formatCurrency(paymentFee);
    document.getElementById('regular-ship2-shipping').textContent = formatCurrency(ship2Fee);
    updateCashbackRow('regular-ship2', hasCashback, cashbackFee);
    updatePreOrderRow('regular-ship2', hasPreOrder, preOrderFee);
    updateTaxRow('regular-ship2', hasTax, taxFee);
    document.getElementById('regular-ship2-total').textContent = formatCurrency(regularShip2Total);
    document.getElementById('regular-ship2-profit').textContent = formatCurrency(regularShip2Profit);
    updateProfitStyle('regular-ship2-profit-row', regularShip2Profit);

    // Update Event Day + Shipping Option 1
    document.getElementById('event-ship1-transaction').textContent = formatCurrency(transactionFee);
    document.getElementById('event-ship1-payment').textContent = formatCurrency(paymentFee);
    document.getElementById('event-ship1-surcharge').textContent = formatCurrency(eventSurcharge);
    document.getElementById('event-ship1-shipping').textContent = formatCurrency(ship1Fee);
    updateCashbackRow('event-ship1', hasCashback, cashbackFee);
    updatePreOrderRow('event-ship1', hasPreOrder, preOrderFee);
    updateTaxRow('event-ship1', hasTax, taxFee);
    document.getElementById('event-ship1-total').textContent = formatCurrency(eventShip1Total);
    document.getElementById('event-ship1-profit').textContent = formatCurrency(eventShip1Profit);
    updateProfitStyle('event-ship1-profit-row', eventShip1Profit);

    // Update Event Day + Shipping Option 2
    document.getElementById('event-ship2-transaction').textContent = formatCurrency(transactionFee);
    document.getElementById('event-ship2-payment').textContent = formatCurrency(paymentFee);
    document.getElementById('event-ship2-surcharge').textContent = formatCurrency(eventSurcharge);
    document.getElementById('event-ship2-shipping').textContent = formatCurrency(ship2Fee);
    updateCashbackRow('event-ship2', hasCashback, cashbackFee);
    updatePreOrderRow('event-ship2', hasPreOrder, preOrderFee);
    updateTaxRow('event-ship2', hasTax, taxFee);
    document.getElementById('event-ship2-total').textContent = formatCurrency(eventShip2Total);
    document.getElementById('event-ship2-profit').textContent = formatCurrency(eventShip2Profit);
    updateProfitStyle('event-ship2-profit-row', eventShip2Profit);

    // Update Summary Table
    updateSummaryRow('regular-ship1', regularShip1Total, regularShip1Profit, sellPrice);
    updateSummaryRow('regular-ship2', regularShip2Total, regularShip2Profit, sellPrice);
    updateSummaryRow('event-ship1', eventShip1Total, eventShip1Profit, sellPrice);
    updateSummaryRow('event-ship2', eventShip2Total, eventShip2Profit, sellPrice);

    // Update Floating Header
    document.getElementById('floatCost').textContent = formatCurrency(costPrice);
    document.getElementById('floatSell').textContent = formatCurrency(sellPrice);
    
    const floatPreOrder = document.getElementById('floatPreOrder');
    floatPreOrder.textContent = preOrderLabel;
    if (hasPreOrder) {
        floatPreOrder.className = 'badge bg-warning text-dark';
    } else {
        floatPreOrder.className = 'badge bg-secondary';
    }

    const floatCashback = document.getElementById('floatCashback');
    floatCashback.textContent = cashbackLabel;
    if (cashbackRate > 0) {
        floatCashback.className = 'badge bg-warning text-dark';
    } else {
        floatCashback.className = 'badge bg-secondary';
    }
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

// Initial calculation
calculateFees();

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
