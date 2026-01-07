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

// Tax Options
const inputTaxOptions = document.getElementById('inputTaxOptions');
const hasProductInvoiceInput = document.getElementById('hasProductInvoice');
const hasFeeInvoiceInput = document.getElementById('hasFeeInvoice');

// Floating Header Elements
const floatSellContainer = document.getElementById('floatSellContainer');
const floatMarginContainer = document.getElementById('floatMarginContainer');
const suggestedPriceColumns = document.querySelectorAll('.suggested-price-column');

// Radio Groups
const cashbackRadios = document.querySelectorAll('input[name="cashbackProgram"]');
const taxRadios = document.querySelectorAll('input[name="taxSetting"]');
const preOrderRadios = document.querySelectorAll('input[name="preOrder"]');

let currentMode = 'profit'; 
let currentShippingOption = 'both'; 
let currentSellerType = 'general'; 

// Format number
function formatCurrency(amount) {
    return '$ ' + Math.round(amount).toLocaleString('zh-TW');
}

// URL Management
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
        hasProdInv: params.get('hasProdInv') === '1',
        hasFeeInv: params.get('hasFeeInv') === '1'
    };
}

function updateQueryString() {
    const params = new URLSearchParams();
    params.set('mode', currentMode);
    params.set('shipping', currentShippingOption);
    params.set('seller', currentSellerType);
    if (costPriceInput.value) params.set('cost', costPriceInput.value);
    params.set('costTax', costTaxTypeInput.checked ? 'inc' : 'exc');

    if (currentMode === 'profit' && sellPriceInput.value) {
        params.set('sell', sellPriceInput.value);
    } else if (currentMode === 'price' && profitMarginInput.value) {
        params.set('margin', profitMarginInput.value);
    }
    
    if (transactionFeeInput.value) params.set('fee', transactionFeeInput.value);
    
    let preOrderValue = '0';
    preOrderRadios.forEach(r => { if(r.checked) preOrderValue = r.value; });
    params.set('preorder', preOrderValue);
    
    let cashbackValue = '0';
    cashbackRadios.forEach(r => { if(r.checked) cashbackValue = r.value; });
    params.set('cashback', cashbackValue);
    
    let taxValue = '0';
    taxRadios.forEach(r => { if(r.checked) taxValue = r.value; });
    params.set('tax', taxValue);

    if (taxValue === '5' || taxValue === '5_plus') {
        if (hasProductInvoiceInput.checked) params.set('hasProdInv', '1');
        if (hasFeeInvoiceInput.checked) params.set('hasFeeInv', '1');
    }
    
    const newUrl = window.location.pathname + '?' + params.toString();
    window.history.replaceState({}, '', newUrl);
}

function loadFromQueryString() {
    const params = getQueryParams();
    
    currentMode = params.mode;
    document.getElementById(params.mode === 'profit' ? 'modeProfit' : 'modePrice').checked = true;
    
    currentShippingOption = params.shipping;
    if (params.shipping === 'ship1') document.getElementById('shipOne').checked = true;
    else if (params.shipping === 'ship2') document.getElementById('shipTwo').checked = true;
    else document.getElementById('shipBoth').checked = true;
    
    currentSellerType = params.seller;
    document.getElementById(params.seller === 'mall' ? 'sellerMall' : 'sellerGeneral').checked = true;
    
    if (params.cost) costPriceInput.value = params.cost;
    
    if (params.costTax === 'exc') {
        costTaxTypeInput.checked = false;
        costTaxLabel.textContent = '未稅';
        costTaxSuffix.textContent = '(未稅)';
    } else {
        costTaxTypeInput.checked = true;
        costTaxLabel.textContent = '含稅';
        costTaxSuffix.textContent = '(含稅)';
    }

    if (params.sell) sellPriceInput.value = params.sell;
    if (params.margin) profitMarginInput.value = params.margin;
    if (params.fee) transactionFeeInput.value = params.fee;
    
    if (params.preorder === '3') document.getElementById('isPreOrder').checked = true;
    else document.getElementById('noPreOrder').checked = true;
    
    if (params.cashback === '1.5') document.getElementById('cashback5').checked = true;
    else if (params.cashback === '2.5') document.getElementById('cashback10').checked = true;
    else document.getElementById('noCashback').checked = true;
    
    if (params.tax === '1') document.getElementById('businessTax').checked = true;
    else if (params.tax === '5') document.getElementById('invoiceTax').checked = true;
    else if (params.tax === '5_plus') document.getElementById('shopeeInvoice').checked = true;
    else document.getElementById('noTax').checked = true;

    hasProductInvoiceInput.checked = params.hasProdInv;
    hasFeeInvoiceInput.checked = params.hasFeeInv;
    
    updateTaxOptionsVisibility();
}

function updateTaxOptionsVisibility() {
    let taxVal = '0';
    taxRadios.forEach(r => { if(r.checked) taxVal = r.value; });
    
    if (taxVal === '5' || taxVal === '5_plus') {
        inputTaxOptions.style.display = 'block';
    } else {
        inputTaxOptions.style.display = 'none';
        // Hide only if not active, but keep state for now.
    }
}

// Event Listeners
modeRadios.forEach(r => r.addEventListener('change', (e) => {
    currentMode = e.target.value;
    updateModeUI();
    calculateFees();
    updateQueryString();
}));
shippingOptionRadios.forEach(r => r.addEventListener('change', (e) => {
    currentShippingOption = e.target.value;
    updateShippingOptionUI();
    updateQueryString();
}));
sellerTypeRadios.forEach(r => r.addEventListener('change', (e) => {
    currentSellerType = e.target.value;
    calculateFees();
    updateQueryString();
}));
taxRadios.forEach(r => r.addEventListener('change', () => {
    updateTaxOptionsVisibility();
    calculateFees();
    updateQueryString();
}));

[costPriceInput, sellPriceInput, profitMarginInput, transactionFeeInput, costTaxTypeInput, hasProductInvoiceInput, hasFeeInvoiceInput].forEach(el => {
    if (el === costTaxTypeInput) {
        el.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            costTaxLabel.textContent = isChecked ? '含稅' : '未稅';
            costTaxSuffix.textContent = isChecked ? '(含稅)' : '(未稅)';
            calculateFees();
            updateQueryString();
        });
    } else if (el === hasProductInvoiceInput || el === hasFeeInvoiceInput) {
        el.addEventListener('change', () => {
            calculateFees();
            updateQueryString();
        });
    } else {
        el.addEventListener('input', () => {
            calculateFees();
            updateQueryString();
        });
    }
});

cashbackRadios.forEach(r => r.addEventListener('change', () => {
    calculateFees();
    updateQueryString();
}));
preOrderRadios.forEach(r => r.addEventListener('change', () => {
    calculateFees();
    updateQueryString();
}));

function updateModeUI() {
    if (currentMode === 'profit') {
        sellPriceContainer.style.display = '';
        profitMarginContainer.style.display = 'none';
        suggestedPriceRows.forEach(row => row.style.display = 'none');
        floatSellContainer.style.display = '';
        floatMarginContainer.style.display = 'none';
        suggestedPriceColumns.forEach(col => col.style.display = 'none');
    } else {
        sellPriceContainer.style.display = 'none';
        profitMarginContainer.style.display = '';
        suggestedPriceRows.forEach(row => row.style.display = '');
        floatSellContainer.style.display = 'none';
        floatMarginContainer.style.display = '';
        suggestedPriceColumns.forEach(col => col.style.display = '');
    }
}

function updateShippingOptionUI() {
    const cards = [
        document.querySelector('.col-md-6:has(.result-card.regular):nth-of-type(1)'),
        document.querySelector('.col-md-6:has(.result-card.regular):nth-of-type(2)'),
        document.querySelector('.col-md-6:has(.result-card.event):nth-of-type(3)'),
        document.querySelector('.col-md-6:has(.result-card.event):nth-of-type(4)')
    ];
    const summaryRows = document.querySelectorAll('.table tbody tr');
    
    const show = [true, true, true, true];
    if (currentShippingOption === 'ship1') show[1] = show[3] = false;
    else if (currentShippingOption === 'ship2') show[0] = show[2] = false;

    cards.forEach((card, i) => { if(card) card.style.display = show[i] ? '' : 'none'; });
    summaryRows.forEach((row, i) => { row.style.display = show[i] ? '' : 'none'; });
}

function calculateRequiredPrice(cost, marginPercent, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, isEvent, isShip2, isMall, hasProdInv, hasFeeInv, isCostInc) {
    const margin = marginPercent / 100;
    const eventFeeIncrease = isMall ? 3 : 2;
    const effectiveTransactionRate = (isEvent && cashbackRate === 0) ? transactionFeeRate + eventFeeIncrease : transactionFeeRate;
    const transRate = effectiveTransactionRate / 100;
    const paymentRate = 0.025;
    const shipRate = isShip2 ? 0 : 0.06;
    const cashbackRateVal = cashbackRate / 100;
    const preOrderRateVal = preOrderRate / 100;
    const shipFixed = isShip2 ? 60 : 0;
    
    // Agent Fee
    const agentFee = (taxSetting === '5_plus') ? 2.5 : 0;

    // Shopee Fee Rate (Ratio of Price)
    const feeRate = transRate + paymentRate + shipRate + cashbackRateVal + preOrderRateVal;
    
    // Tax Rates
    let outputTaxRate = 0;
    if (taxSetting === '1') outputTaxRate = 0.01;
    else if (taxSetting === '5' || taxSetting === '5_plus') outputTaxRate = 0.05 / 1.05;

    // Input Tax Deductions
    let productInputTax = 0;
    if (hasProdInv && (taxSetting === '5' || taxSetting === '5_plus')) {
        if (isCostInc) productInputTax = cost / 1.05 * 0.05;
        else productInputTax = cost * 0.05;
    }
    
    let feeInputTaxRate = 0;
    let feeInputTaxFixed = 0;
    if (hasFeeInv && (taxSetting === '5' || taxSetting === '5_plus')) {
        const factor = 0.05 / 1.05;
        feeInputTaxRate = feeRate * factor;
        feeInputTaxFixed = shipFixed * factor;
    }

    // Cash Out Cost
    const cashOutCost = isCostInc ? cost : cost * 1.05;

    // Formula Check
    const taxRateLinear = outputTaxRate - feeInputTaxRate;
    const taxFixedDeduction = productInputTax + feeInputTaxFixed;
    
    const denominator_linear = 1 - margin - feeRate - taxRateLinear;
    const numerator_linear = cashOutCost + shipFixed - taxFixedDeduction + agentFee;

    if (denominator_linear <= 0) return 0; // Impossible
    
    // Check if simple calculation works (Linear assumption: Tax > 0)
    let price1 = numerator_linear / denominator_linear;
    
    // Check Tax at price1
    const taxAtP1 = (price1 * outputTaxRate) - productInputTax - (price1 * feeRate + shipFixed) * (0.05/1.05);
    
    // Case 2: Tax <= 0. Payable Tax is 0.
    const price2_denom = 1 - margin - feeRate;
    const price2_num = cashOutCost + shipFixed + agentFee;
    let price2 = (price2_denom > 0) ? price2_num / price2_denom : 0;
    
    let usePrice = (taxAtP1 >= 0) ? price1 : price2;
    
    // Handle General Seller Limit (35000) for Transaction Fee
    if (!isMall && usePrice > 35000) {
        // Recalculate with Fixed Trans Fee
        const fixedTransFee = 35000 * transRate;
        const feeRate_capped = feeRate - transRate;
        const feeFixed_capped = fixedTransFee + shipFixed;
        
        const feeInputTaxRate_capped = hasFeeInv ? feeRate_capped * (0.05/1.05) : 0;
        const feeInputTaxFixed_capped = hasFeeInv ? feeFixed_capped * (0.05/1.05) : 0;
        
        const taxRateLinear_capped = outputTaxRate - feeInputTaxRate_capped;
        const taxFixedDeduction_capped = productInputTax + feeInputTaxFixed_capped;
        
        const denom_capped = 1 - margin - feeRate_capped - taxRateLinear_capped;
        const num_capped = cashOutCost + feeFixed_capped - taxFixedDeduction_capped + agentFee;
        
        if (denom_capped > 0) {
             let price_capped_1 = num_capped / denom_capped;
             const taxAtCapped1 = (price_capped_1 * outputTaxRate) - productInputTax - (price_capped_1 * feeRate_capped + feeFixed_capped) * (0.05/1.05);
             if (taxAtCapped1 >= 0) {
                 usePrice = price_capped_1;
             } else {
                 const denom_capped_2 = 1 - margin - feeRate_capped;
                 const num_capped_2 = cashOutCost + feeFixed_capped + agentFee;
                 if (denom_capped_2 > 0) usePrice = num_capped_2 / denom_capped_2;
             }
        }
    }

    return Math.ceil(usePrice);
}

function calculateFees() {
    let costPrice = parseFloat(costPriceInput.value) || 0;
    const isCostInc = costTaxTypeInput.checked;
    const transactionFeeRate = parseFloat(transactionFeeInput.value) || 0;
    
    let cashbackRate = 0;
    let cashbackLabel = '不參加';
    cashbackRadios.forEach(r => {
        if (r.checked) {
            cashbackRate = parseFloat(r.value);
            if (r.id === 'cashback5') cashbackLabel = '5%';
            else if (r.id === 'cashback10') cashbackLabel = '10%';
        }
    });

    let preOrderRate = 0;
    let preOrderLabel = '否';
    preOrderRadios.forEach(r => {
        if (r.checked) {
            preOrderRate = parseFloat(r.value);
            if (preOrderRate > 0) preOrderLabel = '是';
        }
    });

    let taxSetting = '0';
    taxRadios.forEach(r => { if(r.checked) taxSetting = r.value; });
    
    const hasProdInv = hasProductInvoiceInput.checked;
    const hasFeeInv = hasFeeInvoiceInput.checked;

    const isMall = currentSellerType === 'mall';
    
    let prices = {};
    if (currentMode === 'profit') {
        const p = parseFloat(sellPriceInput.value) || 0;
        prices = { 'regular-ship1': p, 'regular-ship2': p, 'event-ship1': p, 'event-ship2': p };
    } else {
        const margin = parseFloat(profitMarginInput.value) || 0;
        prices = {
            'regular-ship1': calculateRequiredPrice(costPrice, margin, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, false, false, isMall, hasProdInv, hasFeeInv, isCostInc),
            'regular-ship2': calculateRequiredPrice(costPrice, margin, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, false, true, isMall, hasProdInv, hasFeeInv, isCostInc),
            'event-ship1': calculateRequiredPrice(costPrice, margin, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, true, false, isMall, hasProdInv, hasFeeInv, isCostInc),
            'event-ship2': calculateRequiredPrice(costPrice, margin, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, true, true, isMall, hasProdInv, hasFeeInv, isCostInc)
        };
        
        ['regular-ship1', 'regular-ship2', 'event-ship1', 'event-ship2'].forEach(key => {
            const el = document.getElementById(`${key}-suggested-price`);
            if(el) el.textContent = formatCurrency(prices[key]);
            const elSum = document.getElementById(`summary-${key}-suggested`);
            if(elSum) elSum.textContent = formatCurrency(prices[key]);
        });
    }

    calculateScenario('regular-ship1', prices['regular-ship1'], costPrice, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, false, false, isMall, hasProdInv, hasFeeInv, isCostInc);
    calculateScenario('regular-ship2', prices['regular-ship2'], costPrice, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, false, true, isMall, hasProdInv, hasFeeInv, isCostInc);
    calculateScenario('event-ship1', prices['event-ship1'], costPrice, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, true, false, isMall, hasProdInv, hasFeeInv, isCostInc);
    calculateScenario('event-ship2', prices['event-ship2'], costPrice, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, true, true, isMall, hasProdInv, hasFeeInv, isCostInc);

    // Floating Header
    const cashOutCost = isCostInc ? costPrice : costPrice * 1.05;
    document.getElementById('floatCost').textContent = formatCurrency(cashOutCost);
    
    if (currentMode === 'profit') {
        document.getElementById('floatSell').textContent = formatCurrency(prices['regular-ship1']);
    } else {
        document.getElementById('floatMargin').textContent = profitMarginInput.value + '%';
    }
    const floatPre = document.getElementById('floatPreOrder');
    floatPre.textContent = preOrderLabel;
    floatPre.className = preOrderRate > 0 ? 'badge bg-warning text-dark' : 'badge bg-secondary';
    
    const floatCash = document.getElementById('floatCashback');
    floatCash.textContent = cashbackLabel;
    floatCash.className = cashbackRate > 0 ? 'badge bg-warning text-dark' : 'badge bg-secondary';
    
    const eventFeeIncrease = isMall ? 3 : 2;
    const suffix = (cashbackRate === 0) ? ` (+${eventFeeIncrease}%)` : '';
    
    ['regular-ship1', 'regular-ship2', 'event-ship1', 'event-ship2'].forEach(k => {
        const l = document.getElementById(`${k}-transaction-label`);
        if(l) {
            if (k.startsWith('event')) {
                l.textContent = '成交手續費' + suffix;
            } else {
                l.textContent = '成交手續費';
            }
        }
    });
}

function calculateScenario(prefix, sellPrice, costPrice, transactionFeeRate, cashbackRate, preOrderRate, taxSetting, isEvent, isShip2, isMall, hasProdInv, hasFeeInv, isCostInc) {
    // 1. Shopee Fees
    const limit = 35000;
    const eventFeeIncrease = isMall ? 3 : 2;
    const effTransRate = (isEvent && cashbackRate === 0) ? transactionFeeRate + eventFeeIncrease : transactionFeeRate;
    
    const transFee = isMall ? 
        Math.round(sellPrice * effTransRate / 100) : 
        Math.round(Math.min(sellPrice, limit) * effTransRate / 100);
        
    const payFee = Math.round(sellPrice * 0.025);
    const shipFee = isShip2 ? 60 : Math.round(sellPrice * 0.06);
    const cashFee = Math.round(sellPrice * cashbackRate / 100);
    const preFee = Math.round(sellPrice * preOrderRate / 100);
    
    const totalShopeeFee = transFee + payFee + shipFee + cashFee + preFee;
    
    // 2. Taxes
    let outputTax = 0;
    if (taxSetting === '1') outputTax = Math.round(sellPrice * 0.01);
    else if (taxSetting === '5' || taxSetting === '5_plus') outputTax = Math.round(sellPrice / 1.05 * 0.05);
    
    let inputTax = 0; // Product Input
    if (hasProdInv && (taxSetting === '5' || taxSetting === '5_plus')) {
         inputTax = isCostInc ? Math.round(costPrice / 1.05 * 0.05) : Math.round(costPrice * 0.05);
    }
    
    let feeInputTax = 0; // Fee Input
    if (hasFeeInv && (taxSetting === '5' || taxSetting === '5_plus')) {
         feeInputTax = Math.round(totalShopeeFee / 1.05 * 0.05);
    }
    
    let payableTax = 0;
    if (taxSetting !== '0') {
         payableTax = Math.max(0, outputTax - inputTax - feeInputTax);
    }
    
    // 3. Agent Fee
    const agentFee = (taxSetting === '5_plus') ? 2.5 : 0;
    
    // Total Deduction
    const totalDeduction = totalShopeeFee + payableTax + agentFee;
    
    // 4. Profit
    const cashOutCost = isCostInc ? costPrice : costPrice * 1.05;
    const profit = sellPrice - cashOutCost - totalDeduction;

    // --- Update UI ---
    
    // Group 1
    document.getElementById(`${prefix}-transaction`).textContent = formatCurrency(transFee);
    document.getElementById(`${prefix}-payment`).textContent = formatCurrency(payFee);
    document.getElementById(`${prefix}-shipping`).textContent = formatCurrency(shipFee);
    
    const elPre = document.getElementById(`${prefix}-preorder`);
    const rowPre = document.getElementById(`${prefix}-preorder-row`);
    if(preOrderRate > 0) { rowPre.style.display=''; elPre.textContent=formatCurrency(preFee); } else rowPre.style.display='none';
    
    const elCash = document.getElementById(`${prefix}-cashback`);
    const rowCash = document.getElementById(`${prefix}-cashback-row`);
    if(cashbackRate > 0) { rowCash.style.display=''; elCash.textContent=formatCurrency(cashFee); } else rowCash.style.display='none';
    
    document.getElementById(`${prefix}-shopee-total`).textContent = formatCurrency(totalShopeeFee);

    const shopeePercentEl = document.getElementById(`${prefix}-shopee-percent`);
    if (shopeePercentEl) {
        if (sellPrice > 0) {
            const pct = (totalShopeeFee / sellPrice * 100).toFixed(1);
            shopeePercentEl.textContent = `(${pct}%)`;
        } else {
            shopeePercentEl.textContent = '(0%)';
        }
    }

    // Group 2
    document.getElementById(`${prefix}-payable-tax`).textContent = formatCurrency(payableTax);

    const taxPercentEl = document.getElementById(`${prefix}-tax-percent`);
    if (taxPercentEl) {
        if (sellPrice > 0) {
            const pct = (payableTax / sellPrice * 100).toFixed(1);
            taxPercentEl.textContent = `(${pct}%)`;
        } else {
            taxPercentEl.textContent = '(0%)';
        }
    }
    
    const elOut = document.getElementById(`${prefix}-output-tax`);
    const groupTax = document.getElementById(`collapse-${prefix}-tax`).closest('.fee-group');
    if (taxSetting === '0') {
        groupTax.style.display = 'none';
    } else {
        groupTax.style.display = '';
        elOut.textContent = formatCurrency(outputTax);
        
        const rowIn = document.getElementById(`${prefix}-input-tax-row`);
        if(hasProdInv && (taxSetting === '5'||taxSetting === '5_plus')) { rowIn.style.display=''; document.getElementById(`${prefix}-input-tax`).textContent = '- ' + formatCurrency(inputTax); } else rowIn.style.display='none';
        
        const rowFeeIn = document.getElementById(`${prefix}-fee-input-tax-row`);
        if(hasFeeInv && (taxSetting === '5'||taxSetting === '5_plus')) { rowFeeIn.style.display=''; document.getElementById(`${prefix}-fee-input-tax`).textContent = '- ' + formatCurrency(feeInputTax); } else rowFeeIn.style.display='none';
    }

    // Agent Fee
    const rowAgent = document.getElementById(`${prefix}-agent-fee-row`);
    if((taxSetting === '5_plus')) { rowAgent.style.display=''; document.getElementById(`${prefix}-agent-fee`).textContent = formatCurrency(agentFee); } else rowAgent.style.display='none';

    // Total Deduction
    document.getElementById(`${prefix}-deduction`).textContent = formatCurrency(totalDeduction);
    const deductionPercentEl = document.getElementById(`${prefix}-deduction-percent`);
    if (deductionPercentEl) {
         if (sellPrice > 0) {
            const pct = (totalDeduction / sellPrice * 100).toFixed(1);
            deductionPercentEl.textContent = `(${pct}%)`;
        } else {
            deductionPercentEl.textContent = '(0%)';
        }
    }

    const rowDeduction = document.getElementById(`${prefix}-deduction`).closest('.deduction-row');
    if (taxSetting === '0') {
        rowDeduction.style.display = 'none';
    } else {
        rowDeduction.style.display = 'flex';
    }

    // Profit
    const elProfit = document.getElementById(`${prefix}-profit`);
    elProfit.textContent = formatCurrency(profit);
    const rowProfit = document.getElementById(`${prefix}-profit-row`);
    if(profit < 0) rowProfit.classList.add('negative'); else rowProfit.classList.remove('negative');
    
    // Summary
    document.getElementById(`summary-${prefix}-total`).textContent = formatCurrency(totalDeduction);
    document.getElementById(`summary-${prefix}-profit`).textContent = formatCurrency(profit);
    
    const profitEl = document.getElementById(`summary-${prefix}-profit`);
    profitEl.className = profit < 0 ? 'fw-bold text-danger text-nowrap' : 'fw-bold text-success text-nowrap';
    
    const marginEl = document.getElementById(`summary-${prefix}-margin`);
    if (sellPrice > 0) {
        const m = (profit / sellPrice) * 100;
        marginEl.textContent = m.toFixed(1) + '%';
        marginEl.className = m < 0 ? 'text-danger text-nowrap' : 'text-success text-nowrap';
    } else {
        marginEl.textContent = '0%';
        marginEl.className = 'text-muted text-nowrap';
    }
}

// Styling & Init
const floatingHeader = document.getElementById('floatingHeader');
const inputSection = document.querySelector('.input-section');
window.addEventListener('scroll', () => {
    if (inputSection.getBoundingClientRect().bottom < 0) floatingHeader.classList.add('visible');
    else floatingHeader.classList.remove('visible');
});
floatingHeader.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const htmlElement = document.documentElement;
let savedTheme = localStorage.getItem('theme') || 'light';
function applyTheme(t){ htmlElement.setAttribute('data-theme', t); themeIcon.className = t==='dark'?'bi bi-sun-fill fs-4':'bi bi-moon-fill fs-4'; }
applyTheme(savedTheme);
themeToggle.addEventListener('click', () => { savedTheme = savedTheme==='dark'?'light':'dark'; applyTheme(savedTheme); localStorage.setItem('theme', savedTheme); });

// Init Bootstrap Tooltips
document.addEventListener('DOMContentLoaded', function() {
    [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(el => new bootstrap.Tooltip(el));
    document.addEventListener('click', function(e) {
        if (!e.target.closest('[data-bs-toggle="tooltip"]')) {
            [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).forEach(el => bootstrap.Tooltip.getInstance(el)?.hide());
        }
    });
});

// Start
loadFromQueryString();
updateModeUI();
updateShippingOptionUI();
calculateFees();
