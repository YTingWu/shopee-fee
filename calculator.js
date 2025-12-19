// Get all input elements
const costPriceInput = document.getElementById('costPrice');
const sellPriceInput = document.getElementById('sellPrice');
const transactionFeeInput = document.getElementById('transactionFee');

// Get cashback program radio buttons
const cashbackRadios = document.querySelectorAll('input[name="cashbackProgram"]');

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

    // Base fees
    const transactionPriceLimit = 35000;
    const transactionFee = Math.round(Math.min(sellPrice, transactionPriceLimit) * (transactionFeeRate / 100));
    const paymentFee = Math.round(sellPrice * 0.025);
    // Event surcharge is 0% if participating in cashback program, otherwise 2%
    const eventSurcharge = hasCashback ? 0 : Math.round(sellPrice * 0.02);
    const ship1Fee = Math.round(sellPrice * 0.06);
    const ship2Fee = 60;
    const cashbackFee = Math.round(sellPrice * (cashbackRate / 100));

    // Regular Day + Shipping Option 1
    const regularShip1Total = transactionFee + paymentFee + ship1Fee + cashbackFee;
    const regularShip1Profit = sellPrice - costPrice - regularShip1Total;

    // Regular Day + Shipping Option 2
    const regularShip2Total = transactionFee + paymentFee + ship2Fee + cashbackFee;
    const regularShip2Profit = sellPrice - costPrice - regularShip2Total;

    // Event Day + Shipping Option 1
    const eventShip1Total = transactionFee + paymentFee + eventSurcharge + ship1Fee + cashbackFee;
    const eventShip1Profit = sellPrice - costPrice - eventShip1Total;

    // Event Day + Shipping Option 2
    const eventShip2Total = transactionFee + paymentFee + eventSurcharge + ship2Fee + cashbackFee;
    const eventShip2Profit = sellPrice - costPrice - eventShip2Total;

    // Update Regular Day + Shipping Option 1
    document.getElementById('regular-ship1-transaction').textContent = formatCurrency(transactionFee);
    document.getElementById('regular-ship1-payment').textContent = formatCurrency(paymentFee);
    document.getElementById('regular-ship1-shipping').textContent = formatCurrency(ship1Fee);
    updateCashbackRow('regular-ship1', hasCashback, cashbackFee);
    document.getElementById('regular-ship1-total').textContent = formatCurrency(regularShip1Total);
    document.getElementById('regular-ship1-profit').textContent = formatCurrency(regularShip1Profit);
    updateProfitStyle('regular-ship1-profit-row', regularShip1Profit);

    // Update Regular Day + Shipping Option 2
    document.getElementById('regular-ship2-transaction').textContent = formatCurrency(transactionFee);
    document.getElementById('regular-ship2-payment').textContent = formatCurrency(paymentFee);
    document.getElementById('regular-ship2-shipping').textContent = formatCurrency(ship2Fee);
    updateCashbackRow('regular-ship2', hasCashback, cashbackFee);
    document.getElementById('regular-ship2-total').textContent = formatCurrency(regularShip2Total);
    document.getElementById('regular-ship2-profit').textContent = formatCurrency(regularShip2Profit);
    updateProfitStyle('regular-ship2-profit-row', regularShip2Profit);

    // Update Event Day + Shipping Option 1
    document.getElementById('event-ship1-transaction').textContent = formatCurrency(transactionFee);
    document.getElementById('event-ship1-payment').textContent = formatCurrency(paymentFee);
    document.getElementById('event-ship1-surcharge').textContent = formatCurrency(eventSurcharge);
    document.getElementById('event-ship1-shipping').textContent = formatCurrency(ship1Fee);
    updateCashbackRow('event-ship1', hasCashback, cashbackFee);
    document.getElementById('event-ship1-total').textContent = formatCurrency(eventShip1Total);
    document.getElementById('event-ship1-profit').textContent = formatCurrency(eventShip1Profit);
    updateProfitStyle('event-ship1-profit-row', eventShip1Profit);

    // Update Event Day + Shipping Option 2
    document.getElementById('event-ship2-transaction').textContent = formatCurrency(transactionFee);
    document.getElementById('event-ship2-payment').textContent = formatCurrency(paymentFee);
    document.getElementById('event-ship2-surcharge').textContent = formatCurrency(eventSurcharge);
    document.getElementById('event-ship2-shipping').textContent = formatCurrency(ship2Fee);
    updateCashbackRow('event-ship2', hasCashback, cashbackFee);
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

// Floating Header Logic
const floatingHeader = document.getElementById('floatingHeader');
const inputSection = document.querySelector('.input-section');

window.addEventListener('scroll', () => {
    if (window.innerWidth <= 768) { // Only for mobile
        const inputRect = inputSection.getBoundingClientRect();
        if (inputRect.bottom < 0) {
            floatingHeader.classList.add('visible');
        } else {
            floatingHeader.classList.remove('visible');
        }
    } else {
        floatingHeader.classList.remove('visible');
    }
});

floatingHeader.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Initial calculation
calculateFees();
