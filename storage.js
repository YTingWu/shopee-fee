// storage.js - Handles saving/loading configurations and sidebar management

const STORAGE_KEY = 'shopee_calculator_configs_v1';
const TOGGLE_ID = 'sidebarToggle';
const CLOSE_BTN_ID = 'sidebarCloseBtn';
const OVERLAY_ID = 'sidebar-overlay'; // Must match HTML
const LIST_ID = 'savedConfigsList';
const SAVE_BTN_ID = 'saveConfigBtn';

let savedConfigs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

// DOM Elements (Lazy loaded or accessed directly when needed)
const sidebarToggle = document.getElementById(TOGGLE_ID);
const sidebarCloseBtn = document.getElementById(CLOSE_BTN_ID);
const sidebarOverlay = document.getElementById(OVERLAY_ID);
const sidebarList = document.getElementById(LIST_ID);
const saveConfigBtn = document.getElementById(SAVE_BTN_ID);

/* --- Sidebar UI Management --- */
// State Persistence for Sidebar
const SIDEBAR_STATE_KEY = 'shopee_sidebar_state';
let sidebarState = JSON.parse(localStorage.getItem(SIDEBAR_STATE_KEY) || '{"width": 280, "collapsed": false}');

function saveSidebarState() {
    localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(sidebarState));
}

function toggleSidebar() {
    // This is mainly for Mobile
    document.body.classList.toggle('toggled');
}

function toggleDesktopSidebar() {
    const wrapper = document.getElementById('wrapper');
    const showBtn = document.getElementById('desktopShowSidebarBtn');
    
    sidebarState.collapsed = !sidebarState.collapsed;
    saveSidebarState();

    if (sidebarState.collapsed) {
        wrapper.classList.add('desktop-collapsed');
        if (showBtn) showBtn.style.display = 'block';
    } else {
        wrapper.classList.remove('desktop-collapsed');
        if (showBtn) showBtn.style.display = 'none';
    }
}

function initSidebarEvents() {
    const toggle = document.getElementById(TOGGLE_ID); // Mobile Toggle
    const closeBtn = document.getElementById(CLOSE_BTN_ID); // Mobile Close
    const overlay = document.getElementById(OVERLAY_ID);
    
    // Desktop Elements
    const desktopCollapseBtn = document.getElementById('desktopSidebarCollapseBtn');
    const desktopShowBtn = document.getElementById('desktopShowSidebarBtn');
    const resizer = document.getElementById('resizer');

    // Mobile Events
    if (toggle) toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSidebar();
    });
    
    if (closeBtn) closeBtn.addEventListener('click', toggleSidebar);
    
    if (overlay) overlay.addEventListener('click', () => {
        document.body.classList.remove('toggled');
    });

    const saveBtn = document.getElementById(SAVE_BTN_ID);
    if (saveBtn) saveBtn.addEventListener('click', saveConfig);

    // Desktop Events
    if (desktopCollapseBtn) {
        desktopCollapseBtn.addEventListener('click', toggleDesktopSidebar);
    }
    if (desktopShowBtn) {
        desktopShowBtn.addEventListener('click', toggleDesktopSidebar);
    }

    // Initialize Desktop State (Restore width and collapse state)
    const wrapper = document.getElementById('wrapper');
    if (wrapper) {
        // Restore Width
        if (sidebarState.width) {
            document.documentElement.style.setProperty('--sidebar-width', `${sidebarState.width}px`);
        }
        // Restore Collapsed State
        if (sidebarState.collapsed) {
            wrapper.classList.add('desktop-collapsed');
            if (desktopShowBtn) desktopShowBtn.style.display = 'block';
        }
    }

    // Resizer Logic
    if (resizer) {
        let isResizing = false;
        
        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            resizer.classList.add('resizing');
            document.body.style.cursor = 'col-resize';
            e.preventDefault(); // Prevent text selection
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            // Calculate new width: mouse X position
            // Since sidebar is on the left, width = mouse X
            let newWidth = e.clientX;
            
            // Constraints
            if (newWidth < 200) newWidth = 200; // Min width
            if (newWidth > 600) newWidth = 600; // Max width
            
            document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
            sidebarState.width = newWidth;
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                resizer.classList.remove('resizing');
                document.body.style.cursor = '';
                saveSidebarState(); // Save width on stop
            }
        });
    }
}

/* --- Core Configuration Logic --- */

// Helper: Trigger event to notify calculator.js
function triggerEvent(element, type) {
    if (!element) return;
    const event = new Event(type, { bubbles: true });
    element.dispatchEvent(event);
}

function getCurrentStateFromDOM() {
    // We infer state by reading the same inputs calculator.js uses
    // We rely on getQueryParams() from calculator.js logic style, or just direct DOM read
    // Since we want to display a helpful title, we specifically grab costs/prices
    
    const costInput = document.getElementById('costPrice');
    const sellInput = document.getElementById('sellPrice');
    
    // We can just use the current URL search params if updated, 
    // OR we can rebuild the data object manually if the URL isn't guaranteed perfectly in sync yet
    // calculator.js updates URL on every change, so reading query string is safest
    const params = new URLSearchParams(window.location.search);
    const state = {};
    for (const [key, value] of params.entries()) {
        state[key] = value;
    }
    return state;
}

function saveConfig() {
    const costInput = document.getElementById('costPrice');
    const sellInput = document.getElementById('sellPrice');
    const cost = parseFloat(costInput?.value) || 0;
    
    // Attempt to find calculated sell price if in 'price' mode (margin mode)
    // We look for the first scenario's suggested price text
    let sell = parseFloat(sellInput?.value) || 0;
    const mode = document.querySelector('input[name="calcMode"]:checked')?.value;
    
    if (mode === 'price') {
        const resultEl = document.getElementById('regular-ship1-suggested-price');
        if (resultEl) {
             const txt = resultEl.innerText.replace(/[^\d.-]/g, ''); 
             sell = parseFloat(txt) || 0;
        }
    }

    // Dependency: formatCurrency is in calculator.js. If not available globally, we mock it.
    const currencyStr = (val) => '$ ' + Math.round(val).toLocaleString('zh-TW');

    const defaultTitle = `進價: ${currencyStr(cost)} 售價: ${currencyStr(sell)}`;
    const title = prompt('請輸入設定名稱:', defaultTitle);
    
    if (title === null) return; // Cancelled
    
    const currentState = getCurrentStateFromDOM();
    
    const config = {
        id: Date.now(),
        title: title || defaultTitle,
        date: new Date().toLocaleDateString(),
        data: currentState,
        summary: defaultTitle
    };
    
    savedConfigs.unshift(config); // Add to top
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedConfigs));
    
    renderSidebar();
    showToast('已儲存設定');
}

function loadConfig(id) {
    const config = savedConfigs.find(c => c.id === id);
    if (!config) return;
    
    applyStateToDOM(config.data);
    
    // Close mobile sidebar if open
    document.body.classList.remove('toggled');
    showToast('已載入設定: ' + config.title);
}

function applyStateToDOM(data) {
    // 1. Restore Mode
    if (data.mode) {
        const rad = document.querySelector(`input[name="calcMode"][value="${data.mode}"]`);
        if (rad && !rad.checked) {
            rad.checked = true;
            triggerEvent(rad, 'change');
        }
    }

    // 2. Shipping
    if (data.shipping) {
        const rad = document.querySelector(`input[name="shippingOption"][value="${data.shipping}"]`);
        if (rad && !rad.checked) {
            rad.checked = true;
            triggerEvent(rad, 'change');
        }
    }

    // 3. Seller Type
    if (data.seller) {
        const rad = document.querySelector(`input[name="sellerType"][value="${data.seller}"]`);
        if (rad && !rad.checked) {
            rad.checked = true;
            triggerEvent(rad, 'change');
        }
    }

    // 4. Inputs (Cost, Sell, Margin, Fee)
    const setInput = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
            el.value = val || '';
            triggerEvent(el, 'input');
        }
    };

    setInput('costPrice', data.cost);
    
    // Cost Tax Type (Checkbox)
    const costTaxInput = document.getElementById('costTaxType');
    if (costTaxInput) {
        const shouldBeChecked = (data.costTax !== 'exc'); // default inc
        if (costTaxInput.checked !== shouldBeChecked) {
            costTaxInput.checked = shouldBeChecked;
            triggerEvent(costTaxInput, 'change');
        }
    }

    setInput('sellPrice', data.sell);
    setInput('profitMargin', data.margin);
    setInput('transactionFee', data.fee);

    // 5. Preorder
    if (data.preorder) {
        // data.preorder is value '0' or '3'
        // Logic check: if data.preorder is '3', check #isPreOrder, else #noPreOrder
        const targetId = (data.preorder === '3') ? 'isPreOrder' : 'noPreOrder';
        const rad = document.getElementById(targetId);
        if (rad && !rad.checked) {
            rad.checked = true;
            triggerEvent(rad, 'change');
        }
    }

    // 6. Cashback
    if (data.cashback) {
        let targetId = 'noCashback';
        if (data.cashback === '1.5') targetId = 'cashback5';
        if (data.cashback === '2.5') targetId = 'cashback10';
        const rad = document.getElementById(targetId);
        if (rad && !rad.checked) {
            rad.checked = true;
            triggerEvent(rad, 'change');
        }
    }

    // 7. Tax Settings
    if (data.tax) {
        let targetId = 'noTax';
        if (data.tax === '1') targetId = 'businessTax';
        if (data.tax === '5') targetId = 'invoiceTax';
        if (data.tax === '5_plus') targetId = 'shopeeInvoice';
        const rad = document.getElementById(targetId);
        if (rad && !rad.checked) {
            rad.checked = true;
            triggerEvent(rad, 'change'); // This will trigger visibility updates for sub-options
        }
    }

    // 8. Invoice Details (checkboxes)
    // Need to wait slightly for tax setting to reveal options? 
    // Usually synchronous in calculator.js, but let's be safe
    // The previous triggerEvent on tax radio should update "inputTaxOptions" visibility immediately
    
    const setCheck = (id, isChecked) => {
        const el = document.getElementById(id);
        if (el && el.checked !== isChecked) {
            el.checked = isChecked;
            triggerEvent(el, 'change');
        }
    };

    // queryParams stores boolean as string '1' sometimes? 
    // In calculator.js getQueryParams: hasProdInv: params.get('hasProdInv') === '1'
    setCheck('hasProductInvoice', data.hasProdInv === '1');
    setCheck('hasFeeInvoice', data.hasFeeInv === '1');
}

function deleteConfig(id, event) {
    if (event) event.stopPropagation();
    if (!confirm('確定要刪除此設定嗎？')) return;
    
    savedConfigs = savedConfigs.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedConfigs));
    renderSidebar();
    showToast('已刪除設定');
}

// HTML Escaping
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}

function renderSidebar() {
    const listEl = document.getElementById(LIST_ID);
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    if (savedConfigs.length === 0) {
        listEl.innerHTML = '<div class="text-center p-4 text-muted"><small>尚未儲存任何設定</small></div>';
        return;
    }
    
    savedConfigs.forEach(config => {
        const item = document.createElement('a');
        item.className = 'sidebar-list-item list-group-item list-group-item-action';
        item.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="w-100">
                    <span class="config-title">${escapeHtml(config.title)}</span>
                    <div class="config-details">
                        <span>${escapeHtml(config.summary)}</span>
                        <span class="mx-1">•</span>
                        <span>${config.date}</span>
                    </div>
                </div>
                <button class="btn btn-link btn-sm delete-config-btn" title="刪除">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        
        // Click main area -> Load
        item.addEventListener('click', (e) => {
            loadConfig(config.id);
        });

        // Click delete btn -> Delete
        const delBtn = item.querySelector('.delete-config-btn');
        delBtn.addEventListener('click', (e) => {
            deleteConfig(config.id, e);
        });

        listEl.appendChild(item);
    });
}

function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toastHtml = `
        <div class="toast align-items-center text-white bg-dark border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    const template = document.createElement('div');
    template.innerHTML = toastHtml.trim();
    const toastEl = template.firstChild;
    
    container.appendChild(toastEl);
    
    // Assumes bootstrap is globally available
    if (window.bootstrap && window.bootstrap.Toast) {
        const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();
        toastEl.addEventListener('hidden.bs.toast', () => {
            toastEl.remove();
        });
    }
}

// Initialization on DOMReady
document.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    initSidebarEvents();
});
