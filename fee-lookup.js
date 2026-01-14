// Fee Lookup Module
(function() {
    'use strict';
    
    console.log('Fee lookup script loaded'); // Debug log

    let feeData = null;
    let currentPath = [];
    let flattenedCategories = [];

    // Lazy getter for elements to ensure DOM is ready
    const getElements = () => ({
        categoryList: document.getElementById('categoryList'),
        categorySearch: document.getElementById('categorySearch'),
        categoryBreadcrumb: document.getElementById('categoryBreadcrumb'),
        breadcrumbNav: document.getElementById('breadcrumbNav'),
        transactionFeeInput: document.getElementById('transactionFee'),
        // searchClearBtn is handled dynamically
    });
    
    let searchClearBtn = null;

    // Initialize listeners
    function init() {
        console.log('Fee lookup module init');
        // Listen for the custom event dispatched by calc.html
        document.addEventListener('feeLookupModal:open', function() {
            console.log('Fee lookup modal opened');
            if (!feeData) {
                loadFeeData();
            }
            // Create clear button if not exists
            const els = getElements();
            if (!searchClearBtn && els.categorySearch) {
                const clearBtn = document.createElement('button');
                clearBtn.className = 'absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hidden';
                clearBtn.innerHTML = '<i class="bi bi-x-circle-fill"></i>';
                clearBtn.type = 'button';
                clearBtn.addEventListener('click', () => {
                    if(els.categorySearch) els.categorySearch.value = '';
                    clearBtn.classList.add('hidden');
                    if(feeData) renderCategories(feeData, currentPath);
                });
                els.categorySearch.parentElement.appendChild(clearBtn);
                searchClearBtn = clearBtn;
            }
            
            // Reset view when opening
            if (feeData) {
                renderCategories(feeData, []);
            }
        });
        
        // Setup search listener
        const els = getElements();
        if (els.categorySearch) {
             els.categorySearch.addEventListener('input', handleSearchInput);
        }

        // Also try to bind directly if element exists
        const directBtn = document.getElementById('lookupFeeBtn');
        if(directBtn) {
            directBtn.addEventListener('click', () => {
                if (!feeData) loadFeeData();
            });
        }
    }

    // Call init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Load fee.json data
    async function loadFeeData() {
        const els = getElements();
        try {
            console.log('Fetching fee.json...');
            const response = await fetch('fee.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            feeData = await response.json();
            console.log('Fee data loaded', feeData);
            flattenedCategories = flattenCategories(feeData);
            renderCategories(feeData);
        } catch (error) {
            console.error('Error loading fee data:', error);
            if (els.categoryList) {
                els.categoryList.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                        <i class="bi bi-exclamation-triangle text-4xl mb-3 text-red-500"></i>
                        <p>無法載入手續費資料</p>
                        <small class="text-xs mt-2">${error.message}</small>
                    </div>
                `;
            }
        }
    }

    // Flatten nested categories for search
    function flattenCategories(data, parentPath = []) {
        let result = [];
        
        function traverse(obj, path) {
            if (Array.isArray(obj)) {
                obj.forEach(item => traverse(item, path));
            } else if (typeof obj === 'object') {
                for (const [key, value] of Object.entries(obj)) {
                    const newPath = [...path, key];
                    
                    if (value && typeof value === 'object') {
                        if (value.general_seller_fee || value.mall_seller_fee) {
                            // This is a leaf category
                            result.push({
                                path: newPath,
                                name: key,
                                general_fee: value.general_seller_fee,
                                mall_fee: value.mall_seller_fee,
                                fullPath: newPath.join(' > ')
                            });
                        } else {
                            // This is a parent category, continue traversing
                            traverse(value, newPath);
                        }
                    }
                }
            }
        }
        
        traverse(data, parentPath);
        return result;
    }

    // Render categories at current path
    function renderCategories(data, path = []) {
        const els = getElements();
        if (!els.categoryList) return;

        currentPath = path;
        let current = data;

        // Navigate to current path
        if (Array.isArray(current)) {
            current = current[0];
        }
        
        for (const segment of path) {
            if (current[segment]) {
                current = current[segment];
            }
        }

        // Clear search when navigating
        if(els.categorySearch) els.categorySearch.value = '';
        if(searchClearBtn) searchClearBtn.classList.add('hidden');

        // Update breadcrumbs
        renderBreadcrumbs();

        // Get current seller type
        const isMall = document.querySelector('input[name="sellerType"]:checked')?.value === 'mall';

        // Get categories at current level
        const categories = [];
        
        if (typeof current === 'object' && !Array.isArray(current)) {
            for (const [key, value] of Object.entries(current)) {
                if (typeof value === 'object' && !value.general_seller_fee && !value.mall_seller_fee) {
                    // This is a parent category
                    categories.push({
                        name: key,
                        hasChildren: true,
                        fee: null
                    });
                } else if (value && (value.general_seller_fee || value.mall_seller_fee)) {
                    // This is a leaf category with fee
                    const fee = isMall ? value.mall_seller_fee : value.general_seller_fee;
                    categories.push({
                        name: key,
                        hasChildren: false,
                        fee: fee
                    });
                }
            }
        }

        // Render category list
        if (categories.length === 0) {
            els.categoryList.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                    <i class="bi bi-inbox text-4xl mb-3"></i>
                    <p>沒有可用的類別</p>
                </div>
            `;
            return;
        }

        els.categoryList.innerHTML = categories.map(cat => `
            <button type="button" 
                    class="category-item w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex justify-between items-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 group"
                    data-category="${cat.name}"
                    data-has-children="${cat.hasChildren}"
                    data-fee="${cat.fee || ''}">
                <span class="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${cat.name}</span>
                ${cat.hasChildren 
                    ? '<i class="bi bi-chevron-right text-gray-400 group-hover:text-blue-500"></i>' 
                    : `<span class="category-fee bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-sm font-semibold">${cat.fee}</span>`
                }
            </button>
        `).join('');

        // Add click handlers
        els.categoryList.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', handleCategoryClick);
        });
    }

    // Handle category click
    function handleCategoryClick(e) {
        const button = e.currentTarget;
        const categoryName = button.dataset.category;
        const hasChildren = button.dataset.hasChildren === 'true';
        const fee = button.dataset.fee;

        if (hasChildren) {
            // Navigate deeper
            renderCategories(feeData, [...currentPath, categoryName]);
        } else if (fee) {
            // Select this fee
            selectFee(fee, [...currentPath, categoryName]);
        }
    }

    // Select a fee and close modal
    function selectFee(fee, path) {
        const els = getElements();
        // Remove % sign if present
        const feeValue = parseFloat(fee.replace('%', ''));
        
        // Update the transaction fee input
        if (els.transactionFeeInput) {
            els.transactionFeeInput.value = feeValue;
            // Trigger input event to recalculate
            els.transactionFeeInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // Clear search input
        if(els.categorySearch) els.categorySearch.value = '';
        
        // Reset to initial view
        renderCategories(feeData, []);
        
        // Close modal
        if (typeof window.closeModal === 'function') {
            window.closeModal('feeLookupModal');
        } else {
            const modal = document.getElementById('feeLookupModal');
            if(modal) modal.classList.add('hidden');
        }
        
        console.log(`已選擇類別: ${path.join(' > ')} - ${fee}`);
    }

    // Render breadcrumbs
    function renderBreadcrumbs() {
        const els = getElements();
        if (!els.breadcrumbNav || !els.categoryBreadcrumb) return;

        if (currentPath.length === 0) {
            els.breadcrumbNav.classList.add('hidden');
            return;
        }

        els.breadcrumbNav.classList.remove('hidden');

        const breadcrumbs = [
            `<li><button class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium" data-path="">首頁</button></li>`
        ];

        currentPath.forEach((segment, index) => {
            // Add separator
            breadcrumbs.push(`<li><span class="text-gray-300 dark:text-gray-600">/</span></li>`);

            const isLast = index === currentPath.length - 1;
            const path = currentPath.slice(0, index + 1).join(',');
            
            if (isLast) {
                breadcrumbs.push(`<li><span class="text-gray-800 dark:text-gray-200 font-semibold" aria-current="page">${segment}</span></li>`);
            } else {
                breadcrumbs.push(`<li><button class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" data-path="${path}">${segment}</button></li>`);
            }
        });

        els.categoryBreadcrumb.innerHTML = breadcrumbs.join('');

        // Add click handlers to breadcrumb links
        els.categoryBreadcrumb.querySelectorAll('button').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pathStr = e.target.dataset.path;
                const path = pathStr ? pathStr.split(',') : [];
                renderCategories(feeData, path);
            });
        });
    }

    // Search functionality handler
    function handleSearchInput(e) {
        const searchTerm = e.target.value.trim().toLowerCase();
        const els = getElements();

        // Toggle clear button visibility
        if (searchClearBtn) {
            if (searchTerm.length > 0) {
                searchClearBtn.classList.remove('hidden');
            } else {
                searchClearBtn.classList.add('hidden');
            }
        }

        if (searchTerm.length === 0) {
            // Return to current path view
            renderCategories(feeData, currentPath);
            return;
        }

        // Get current seller type
        const isMall = document.querySelector('input[name="sellerType"]:checked')?.value === 'mall';

        // Search in flattened categories
        const results = flattenedCategories.filter(cat => 
            cat.name.toLowerCase().includes(searchTerm) || 
            cat.fullPath.toLowerCase().includes(searchTerm)
        );

        // Hide breadcrumbs during search
        if(els.breadcrumbNav) els.breadcrumbNav.classList.add('hidden');

        if (results.length === 0) {
            if(els.categoryList) {
                els.categoryList.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                        <i class="bi bi-search text-4xl mb-3"></i>
                        <p>找不到符合的類別</p>
                        <small class="opacity-75">請嘗試其他關鍵字</small>
                    </div>
                `;
            }
            return;
        }

        // Render search results
        if(els.categoryList) {
            els.categoryList.innerHTML = results.map(cat => {
                const highlightedName = highlightText(cat.name, searchTerm);
                const highlightedPath = highlightText(cat.fullPath, searchTerm);
                const fee = isMall ? cat.mall_fee : cat.general_fee;
                
                return `
                    <button type="button" 
                            class="category-item w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex justify-between items-center bg-white dark:bg-gray-800 group"
                            data-fee="${fee}"
                            data-path="${cat.path.join(',')}">
                        <div class="flex flex-col">
                            <div class="font-medium text-gray-800 dark:text-gray-200">${highlightedName}</div>
                            <small class="text-gray-500 dark:text-gray-400 mt-0.5">${highlightedPath}</small>
                        </div>
                        <span class="category-fee bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-sm font-semibold whitespace-nowrap ml-2">${fee}</span>
                    </button>
                `;
            }).join('');

            // Add click handlers for search results
            els.categoryList.querySelectorAll('.category-item').forEach(item => {
                item.addEventListener('click', () => {
                    const fee = item.dataset.fee;
                    const path = item.dataset.path.split(',');
                    selectFee(fee, path);
                });
            });
        }
    }

    // Highlight search term in text
    function highlightText(text, term) {
        if (!term) return text;
        
        try {
            // Escape special regex characters
            const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedTerm})`, 'gi');
            return text.replace(regex, '<span class="text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/50 rounded px-0.5">$1</span>');
        } catch (e) {
            return text;
        }
    }

})();
