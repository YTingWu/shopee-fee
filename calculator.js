// Get all input elements
const costPriceInput = document.getElementById('costPrice');
const costTaxTypeInput = document.getElementById('costTaxType');
const costTaxLabel = document.getElementById('costTaxLabel');
const costTaxSuffix = document.getElementById('costTaxSuffix');
const sellPriceInput = document.getElementById('sellPrice');
const profitMarginInput = document.getElementById('profitMargin');
const transactionFeeInput = document.getElementById('transactionFee');

const sellPriceContainer = document.getElementById('sellPriceContainer');
const profitMarginContainer = document.getElementById('profitMarginContainer');
const modeRadios = document.querySelectorAll('input[name="calcMode"]');
const shippingOptionRadios = document.querySelectorAll('input[name="shippingOption"]');
const sellerTypeRadios = document.querySelectorAll('input[name="sellerType"]');
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

// Get tax checkbox elements
const hasInputInvoice = document.getElementById('hasInputInvoice');
const canDeductFee = document.getElementById('canDeductFee');
const inputInvoiceContainer = document.getElementById('inputInvoiceContainer');
const feeDeductContainer = document.getElementById('feeDeductContainer');

let currentMode = 'profit'; // 'profit' or 'price'
let currentShippingOption = 'both'; // 'both', 'ship1', or 'ship2'
let currentSellerType = 'general'; // 'general' or 'mall'

// Format number with thousand separators and no decimals
function formatCurrency(amount) {
    return '$ ' + Math.round(amount).toLocaleString('zh-TW');
}

// URL Query String Management
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        mode: params.get('mode') || 'profit',
        shipping: params.get('shipping') || 'both',
        seller: params.get('seller') || 'general',
        cost: params.get('cost') || '',
        sell: params.get('sell') || '',
        margin: params.get('margin') || '5',
        fee: params.get('fee') || '6',
        preorder: params.get('preorder') || '0',
        cashback: params.get('cashback') || '0',
        tax: params.get('tax') || '0',
        costTax: params.get('costTax') || 'inc',
        inputInv: params.get('inputInv') === '1',
        deductFee: params.get('deductFee') === '1'
    };
}

function updateQueryString() {
    const params = new URLSearchParams();
    
    // Mode
    params.set('mode', currentMode);
    
    // Shipping Option
    params.set('shipping', currentShippingOption);
    
    // Seller Type
    params.set('seller', currentSellerType);
    
    // Cost Price
    if (costPriceInput.value) params.set('cost', costPriceInput.value);
    
    // Cost Tax
    params.set('costTax', costTaxTypeInput.checked ? 'inc' : 'exc');

    // Sell Price or Margin
    if (currentMode === 'profit' && sellPriceInput.value) {
        params.set('sell', sellPriceInput.value);
    } else if (currentMode === 'price' && profitMarginInput.value) {
        params.set('margin', profitMarginInput.value);
    }
    
    // Transaction Fee
    if (transactionFeeInput.value) params.set('fee', transactionFeeInput.value);
    
    // Pre-order
    let preOrderValue = '0';
    preOrderRadios.forEach(radio => {
        if (radio.checked) preOrderValue = radio.value;
    });
    params.set('preorder', preOrderValue);
    
    // Cashback
    let cashbackValue = '0';
    cashbackRadios.forEach(radio => {
        if (radio.checked) cashbackValue = radio.value;
    });
    params.set('cashback', cashbackValue);
    
    // Tax
    let taxValue = '0';
    taxRadios.forEach(radio => {
        if (radio.checked) taxValue = radio.value;
    });
    params.set('tax', taxValue);
    
    // Input Invoice (only if checked)
    if (hasInputInvoice && hasInputInvoice.checked) {
        params.set('inputInv', '1');
    }
    
    // Fee Deduction (only if checked)
    if (canDeductFee && canDeductFee.checked) {
        params.set('deductFee', '1');
    }
    
    // Update URL without reloading
    const newUrl = window.location.pathname + '?' + params.toString();
    window.history.replaceState({}, '', newUrl);
}

function loadFromQueryString() {
    const params = getQueryParams();
    
    // Set Mode
    currentMode = params.mode;
    document.getElementById(params.mode === 'profit' ? 'modeProfit' : 'modePrice').checked = true;
    
    // Set Shipping Option
    currentShippingOption = params.shipping;
    if (params.shipping === 'ship1') {
        document.getElementById('shipOne').checked = true;
    } else if (params.shipping === 'ship2') {
        document.getElementById('shipTwo').checked = true;
    } else {
        document.getElementById('shipBoth').checked = true;
    }
    
    // Set Seller Type
    currentSellerType = params.seller;
    if (params.seller === 'mall') {
        document.getElementById('sellerMall').checked = true;
    } else {
        document.getElementById('sellerGeneral').checked = true;
    }
    
    // Set Cost Price
    if (params.cost) costPriceInput.value = params.cost;
    
    // Set Cost Tax
    if (params.costTax === 'exc') {
        costTaxTypeInput.checked = false;
        costTaxLabel.textContent = '未稅';
        costTaxSuffix.textContent = '(未稅)';
    } else {
        costTaxTypeInput.checked = true;
        costTaxLabel.textContent = '含稅';
        costTaxSuffix.textContent = '(含稅)';
    }

    // Set Sell Price or Margin
    if (params.sell) sellPriceInput.value = params.sell;
    if (params.margin) profitMarginInput.value = params.margin;
    
    // Set Transaction Fee
    if (params.fee) transactionFeeInput.value = params.fee;
    
    // Set Pre-order
    if (params.preorder === '3') {
        document.getElementById('isPreOrder').checked = true;
    } else {
        document.getElementById('noPreOrder').checked = true;
    }
    
    // Set Cashback
    if (params.cashback === '1.5') {
        document.getElementById('cashback5').checked = true;
    } else if (params.cashback === '2.5') {
        document.getElementById('cashback10').checked = true;
    } else {
        document.getElementById('noCashback').checked = true;
    }
    
    // Set Tax
    if (params.tax === '1') {
        document.getElementById('businessTax').checked = true;
    } else if (params.tax === '5') {
        document.getElementById('invoiceTax').checked = true;
    } else if (params.tax === '5_plus') {
        document.getElementById('shopeeInvoice').checked = true;
    } else {
        document.getElementById('noTax').checked = true;
    }
    
    // Set Input Invoice checkbox
    if (hasInputInvoice) {
        hasInputInvoice.checked = params.inputInv || false;
    }
    
    // Set Fee Deduction checkbox
    if (canDeductFee) {
        canDeductFee.checked = params.deductFee || false;
    }
    
    // Update tax checkbox visibility
    updateTaxCheckboxVisibility();
}

// Mode switching logic
modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentMode = e.target.value;
        updateModeUI();
        calculateFees();
        updateQueryString();
    });
});

// Shipping option switching logic
shippingOptionRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentShippingOption = e.target.value;
        updateShippingOptionUI();
        updateQueryString();
    });
});

// Seller type switching logic
sellerTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentSellerType = e.target.value;
        calculateFees();
        updateQueryString();
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
function calculateRequiredPrice(cost, marginPercent, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, isEvent, isShip2, isMall, hasInputInv, canDeduct, costTaxType) {
    const margin = marginPercent / 100;
    const eventFeeIncrease = isMall ? 3 : 2;
    const effectiveTransactionRate = (isEvent && cashbackRate === 0) ? transactionFeeRate + eventFeeIncrease : transactionFeeRate;
    const transRate = effectiveTransactionRate / 100;
    const paymentRate = 0.025;
    const shipRate = isShip2 ? 0 : 0.06;
    const cashbackRateVal = cashbackRate / 100;
    const preOrderRateVal = preOrderRate / 100;
    
    const shipFixed = isShip2 ? 60 : 0;
    
    // For tax籍登記, use simple 1% tax
    if (taxSetting === '1') {
        const totalRateOther = paymentRate + shipRate + cashbackRateVal + preOrderRateVal + 0.01;
        const totalFixed = shipFixed;
        
        if (isMall) {
            const denominator = 1 - transRate - totalRateOther - margin;
            if (denominator <= 0) return 0;
            return Math.ceil((cost + totalFixed) / denominator);
        }
        
        const denominator1 = 1 - transRate - totalRateOther - margin;
        if (denominator1 <= 0) return 0;
        let price = (cost + totalFixed) / denominator1;
        
        if (price > 35000) {
            const denominator2 = 1 - totalRateOther - margin;
            if (denominator2 <= 0) return 0;
            price = (cost + 35000 * transRate + totalFixed) / denominator2;
        }
        return Math.ceil(price);
    }
    
    // For invoice tax (5% or 5_plus), use iterative calculation
    // Because input tax depends on fees, which depend on price
    let price = cost / (margin); // Initial guess
    
    for (let iteration = 0; iteration < 10; iteration++) {
        const oldPrice = price;
        
        // Calculate fees before tax
        const transactionFee = isMall ? price * transRate : Math.min(price, 35000) * transRate;
        const paymentFee = price * paymentRate;
        const shipFee = isShip2 ? shipFixed : price * shipRate;
        const cashbackFee = price * cashbackRateVal;
        const preOrderFee = price * preOrderRateVal;
        const totalFeeBeforeTax = transactionFee + paymentFee + shipFee + cashbackFee + preOrderFee;
        
        // Calculate output tax (sales tax)
        let outputTax = 0;
        if (taxSetting === '5' || taxSetting === '5_plus') {
            outputTax = price / 1.05 * 0.05;
            if (taxSetting === '5_plus') {
                outputTax += 3; // Shopee invoice fee
            }
        }
        
        // Calculate input tax (deductible)
        let inputTax = 0;
        if (hasInputInv && (taxSetting === '5' || taxSetting === '5_plus')) {
            // Cost input tax
            const costInput = costTaxType ? (cost / 1.05 * 0.05) : (cost * 0.05);
            inputTax = costInput;
            
            // Fee input tax (if deductible)
            if (canDeduct) {
                inputTax += totalFeeBeforeTax / 1.05 * 0.05;
            }
        }
        
        // Net tax
        const netTax = outputTax - inputTax;
        
        // Calculate required price
        // price = cost + totalFeeBeforeTax + netTax + margin * price
        // price * (1 - margin) = cost + totalFeeBeforeTax + netTax
        const totalCostAndFee = cost + totalFeeBeforeTax + netTax;
        price = totalCostAndFee / (1 - margin);
        
        // Check convergence
        if (Math.abs(price - oldPrice) < 0.01) {
            break;
        }
    }
    
    return Math.ceil(price);
}

// Calculate fees and profit
function calculateFees() {
    let costPrice = parseFloat(costPriceInput.value) || 0;
    const costTaxType = costTaxTypeInput.checked; // true = include tax, false = exclude tax
    
    // Adjust cost based on tax setting for profit calculation
    let adjustedCost = costPrice;
    if (!costTaxType) {
        adjustedCost = costPrice * 1.05;
    }

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

    // Get tax checkbox states
    const hasInputInv = hasInputInvoice ? hasInputInvoice.checked : false;
    const canDeduct = canDeductFee ? canDeductFee.checked : false;

    // Determine Prices
    let prices = {};
    const isMall = currentSellerType === 'mall';
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
            'regular-ship1': calculateRequiredPrice(adjustedCost, margin, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, false, false, isMall, hasInputInv, canDeduct, costTaxType),
            'regular-ship2': calculateRequiredPrice(adjustedCost, margin, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, false, true, isMall, hasInputInv, canDeduct, costTaxType),
            'event-ship1': calculateRequiredPrice(adjustedCost, margin, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, true, false, isMall, hasInputInv, canDeduct, costTaxType),
            'event-ship2': calculateRequiredPrice(adjustedCost, margin, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, true, true, isMall, hasInputInv, canDeduct, costTaxType)
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
    calculateScenario('regular-ship1', prices['regular-ship1'], adjustedCost, costPrice, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, false, false, isMall, hasInputInv, canDeduct, costTaxType);
    calculateScenario('regular-ship2', prices['regular-ship2'], adjustedCost, costPrice, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, false, true, isMall, hasInputInv, canDeduct, costTaxType);
    calculateScenario('event-ship1', prices['event-ship1'], adjustedCost, costPrice, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, true, false, isMall, hasInputInv, canDeduct, costTaxType);
    calculateScenario('event-ship2', prices['event-ship2'], adjustedCost, costPrice, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, true, true, isMall, hasInputInv, canDeduct, costTaxType);

    // Update Floating Header
    document.getElementById('floatCost').textContent = formatCurrency(adjustedCost);
    
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
    
    // Update event day transaction fee labels based on cashback participation
    const eventTransactionSuffix = (cashbackRate === 0) ? (isMall ? ' (+3%)' : ' (+2%)') : '';
    const eventShip1Label = document.getElementById('event-ship1-transaction-label');
    const eventShip2Label = document.getElementById('event-ship2-transaction-label');
    if (eventShip1Label) eventShip1Label.textContent = '成交手續費' + eventTransactionSuffix;
    if (eventShip2Label) eventShip2Label.textContent = '成交手續費' + eventTransactionSuffix;
}

function calculateScenario(prefix, sellPrice, adjustedCostPrice, originalCostPrice, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, isEvent, isShip2, isMall, hasInputInv, canDeduct, costTaxType) {
    // Base fees
    const transactionPriceLimit = 35000;
    const eventFeeIncrease = isMall ? 3 : 2;
    const effectiveTransactionRate = (isEvent && cashbackRate === 0) ? transactionFeeRate + eventFeeIncrease : transactionFeeRate;
    
    // Mall seller: no limit, General seller: 35000 limit
    const transactionFee = isMall ? 
        Math.round(sellPrice * (effectiveTransactionRate / 100)) :
        Math.round(Math.min(sellPrice, transactionPriceLimit) * (effectiveTransactionRate / 100));
    
    const paymentFee = Math.round(sellPrice * 0.025);
    
    // Shipping Fee
    const shipFee = isShip2 ? 60 : Math.round(sellPrice * 0.06);
    
    // Cashback Fee
    const cashbackFee = Math.round(sellPrice * (cashbackRate / 100));
    
    // PreOrder Fee
    const preOrderFee = Math.round(sellPrice * (preOrderRate / 100));
    
    // Calculate fees before tax (for input tax calculation)
    const totalFeeBeforeTax = transactionFee + paymentFee + shipFee + cashbackFee + preOrderFee;
    
    // Tax Calculation
    let taxFee = 0;
    let outputTax = 0;
    let inputTax = 0;
    
    if (taxSetting === '1') {
        // 稅籍登記 - simple 1% tax
        taxFee = Math.round(sellPrice * 0.01);
    } else if (taxSetting === '5' || taxSetting === '5_plus') {
        // 發票 or 蝦皮代開發票 - calculate output and input tax
        
        // Output tax (sales tax from selling price)
        outputTax = Math.round(sellPrice / 1.05 * 0.05);
        if (taxSetting === '5_plus') {
            outputTax += 3; // Shopee invoice service fee (rounded from 2.5)
        }
        
        // Input tax (deductible tax)
        if (hasInputInv) {
            // Cost input tax
            const costInputTax = costTaxType ? 
                Math.round(originalCostPrice / 1.05 * 0.05) : 
                Math.round(originalCostPrice * 0.05);
            inputTax = costInputTax;
            
            // Fee input tax (if deductible)
            if (canDeduct) {
                const feeInputTax = Math.round(totalFeeBeforeTax / 1.05 * 0.05);
                inputTax += feeInputTax;
            }
        }
        
        // Net tax to pay
        taxFee = outputTax - inputTax;
    }

    const totalFee = totalFeeBeforeTax + taxFee;
    const profit = sellPrice - adjustedCostPrice - totalFee;

    // Update UI
    document.getElementById(`${prefix}-transaction`).textContent = formatCurrency(transactionFee);
    document.getElementById(`${prefix}-payment`).textContent = formatCurrency(paymentFee);
    document.getElementById(`${prefix}-shipping`).textContent = formatCurrency(shipFee);
    
    updateCashbackRow(prefix, cashbackRate > 0, cashbackFee);
    updatePreOrderRow(prefix, preOrderRate > 0, preOrderFee);
    updateTaxRows(prefix, taxSetting, outputTax, inputTax, taxFee);
    
    // Calculate fee percentage and update label
    const feePercentage = sellPrice > 0 ? (totalFee / sellPrice * 100).toFixed(1) : '0.0';
    const totalLabel = document.getElementById(`${prefix}-total-label`);
    if (totalLabel) {
        totalLabel.textContent = `總手續費 (${feePercentage}%)`;
    }
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

// Update tax row(s) visibility and value
function updateTaxRows(prefix, taxSetting, outputTax, inputTax, netTax) {
    const taxRow = document.getElementById(`${prefix}-tax-row`);
    const taxValue = document.getElementById(`${prefix}-tax`);
    const outputTaxRow = document.getElementById(`${prefix}-output-tax-row`);
    const outputTaxValue = document.getElementById(`${prefix}-output-tax`);
    const inputTaxRow = document.getElementById(`${prefix}-input-tax-row`);
    const inputTaxValue = document.getElementById(`${prefix}-input-tax`);
    
    if (taxSetting === '1') {
        // 稅籍登記 - show single tax row
        if (taxRow && taxValue) {
            taxRow.style.display = '';
            taxValue.textContent = formatCurrency(netTax);
        }
        if (outputTaxRow) outputTaxRow.style.display = 'none';
        if (inputTaxRow) inputTaxRow.style.display = 'none';
    } else if (taxSetting === '5' || taxSetting === '5_plus') {
        // 發票 or 蝦皮代開發票 - show output and input tax rows
        if (taxRow) taxRow.style.display = 'none';
        
        if (outputTaxRow && outputTaxValue) {
            outputTaxRow.style.display = '';
            outputTaxValue.textContent = '-' + formatCurrency(outputTax).substring(2); // Remove "$ " and add "-"
        }
        
        if (inputTaxRow && inputTaxValue) {
            inputTaxRow.style.display = '';
            inputTaxValue.textContent = '+' + formatCurrency(inputTax).substring(2); // Remove "$ " and add "+"
        }
    } else {
        // 無稅 - hide all tax rows
        if (taxRow) taxRow.style.display = 'none';
        if (outputTaxRow) outputTaxRow.style.display = 'none';
        if (inputTaxRow) inputTaxRow.style.display = 'none';
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
costPriceInput.addEventListener('input', () => {
    calculateFees();
    updateQueryString();
});
costTaxTypeInput.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    costTaxLabel.textContent = isChecked ? '含稅' : '未稅';
    costTaxSuffix.textContent = isChecked ? '(含稅)' : '(未稅)';
    calculateFees();
    updateQueryString();
});
sellPriceInput.addEventListener('input', () => {
    calculateFees();
    updateQueryString();
});
profitMarginInput.addEventListener('input', () => {
    calculateFees();
    updateQueryString();
});
transactionFeeInput.addEventListener('input', () => {
    calculateFees();
    updateQueryString();
});

// Add event listeners for cashback program radio buttons
cashbackRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        calculateFees();
        updateQueryString();
    });
});

// Add event listeners for tax setting radio buttons
taxRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        updateTaxCheckboxVisibility();
        calculateFees();
        updateQueryString();
    });
});

// Update tax checkbox visibility based on selected tax setting
function updateTaxCheckboxVisibility() {
    let selectedTax = '0';
    taxRadios.forEach(radio => {
        if (radio.checked) selectedTax = radio.value;
    });
    
    // Show/hide input invoice checkbox (for "無" option)
    if (inputInvoiceContainer) {
        if (selectedTax === '0') {
            inputInvoiceContainer.style.display = '';
        } else {
            inputInvoiceContainer.style.display = 'none';
        }
    }
    
    // Show/hide fee deduction checkbox (for "發票" and "蝦皮代開發票" options)
    if (feeDeductContainer) {
        if (selectedTax === '5' || selectedTax === '5_plus') {
            feeDeductContainer.style.display = '';
        } else {
            feeDeductContainer.style.display = 'none';
        }
    }
}

// Add event listeners for tax checkboxes
if (hasInputInvoice) {
    hasInputInvoice.addEventListener('change', () => {
        calculateFees();
        updateQueryString();
    });
}

if (canDeductFee) {
    canDeductFee.addEventListener('change', () => {
        calculateFees();
        updateQueryString();
    });
}

// Add event listeners for pre-order radio buttons
preOrderRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        calculateFees();
        updateQueryString();
    });
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
loadFromQueryString();
updateModeUI();
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
