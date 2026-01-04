// Fee Lookup Module
(function() {
    'use strict';

    let feeData = null;
    let currentPath = [];
    let flattenedCategories = [];

    const elements = {
        categoryList: document.getElementById('categoryList'),
        categorySearch: document.getElementById('categorySearch'),
        categoryBreadcrumb: document.getElementById('categoryBreadcrumb'),
        breadcrumbNav: document.getElementById('breadcrumbNav'),
        transactionFeeInput: document.getElementById('transactionFee'),
        searchClearBtn: null // Will be created dynamically
    };

    // Load fee data when modal is first opened
    document.getElementById('feeLookupModal').addEventListener('show.bs.modal', function() {
        if (!feeData) {
            loadFeeData();
        }
        // Create clear button if not exists
        if (!elements.searchClearBtn) {
            const clearBtn = document.createElement('button');
            clearBtn.className = 'search-clear-btn';
            clearBtn.innerHTML = '<i class="bi bi-x-circle-fill"></i>';
            clearBtn.type = 'button';
            clearBtn.addEventListener('click', () => {
                elements.categorySearch.value = '';
                clearBtn.classList.remove('visible');
                renderCategories(feeData, currentPath);
            });
            elements.categorySearch.parentElement.style.position = 'relative';
            elements.categorySearch.parentElement.appendChild(clearBtn);
            elements.searchClearBtn = clearBtn;
        }
    });

    // Load fee.json data
    async function loadFeeData() {
        try {
            const response = await fetch('fee.json');
            feeData = await response.json();
            flattenedCategories = flattenCategories(feeData);
            renderCategories(feeData);
        } catch (error) {
            console.error('Error loading fee data:', error);
            elements.categoryList.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-exclamation-triangle"></i>
                    <p>無法載入手續費資料</p>
                </div>
            `;
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
        elements.categorySearch.value = '';

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
            elements.categoryList.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <p>沒有可用的類別</p>
                </div>
            `;
            return;
        }

        elements.categoryList.innerHTML = categories.map(cat => `
            <button type="button" 
                    class="list-group-item list-group-item-action category-item ${cat.hasChildren ? 'has-children' : 'leaf-category'}"
                    data-category="${cat.name}"
                    data-has-children="${cat.hasChildren}"
                    data-fee="${cat.fee || ''}">
                <span>${cat.name}</span>
                ${cat.fee ? `<span class="category-fee">${cat.fee}</span>` : ''}
            </button>
        `).join('');

        // Add click handlers
        elements.categoryList.querySelectorAll('.category-item').forEach(item => {
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
        // Remove % sign if present
        const feeValue = parseFloat(fee.replace('%', ''));
        
        // Update the transaction fee input
        elements.transactionFeeInput.value = feeValue;
        
        // Trigger input event to recalculate
        elements.transactionFeeInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Clear search input
        elements.categorySearch.value = '';
        
        // Reset to initial view
        renderCategories(feeData, []);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('feeLookupModal'));
        modal.hide();
        
        // Show success feedback
        console.log(`已選擇類別: ${path.join(' > ')} - ${fee}`);
    }

    // Render breadcrumbs
    function renderBreadcrumbs() {
        if (currentPath.length === 0) {
            elements.breadcrumbNav.style.display = 'none';
            return;
        }

        elements.breadcrumbNav.style.display = 'block';

        const breadcrumbs = [
            `<li class="breadcrumb-item"><a href="#" data-path="">首頁</a></li>`
        ];

        currentPath.forEach((segment, index) => {
            const isLast = index === currentPath.length - 1;
            const path = currentPath.slice(0, index + 1).join(',');
            
            if (isLast) {
                breadcrumbs.push(`<li class="breadcrumb-item active" aria-current="page">${segment}</li>`);
            } else {
                breadcrumbs.push(`<li class="breadcrumb-item"><a href="#" data-path="${path}">${segment}</a></li>`);
            }
        });

        elements.categoryBreadcrumb.innerHTML = breadcrumbs.join('');

        // Add click handlers to breadcrumb links
        elements.categoryBreadcrumb.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pathStr = e.target.dataset.path;
                const path = pathStr ? pathStr.split(',') : [];
                renderCategories(feeData, path);
            });
        });
    }

    // Search functionality
    elements.categorySearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim().toLowerCase();

        // Toggle clear button visibility
        if (elements.searchClearBtn) {
            if (searchTerm.length > 0) {
                elements.searchClearBtn.classList.add('visible');
            } else {
                elements.searchClearBtn.classList.remove('visible');
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
        elements.breadcrumbNav.style.display = 'none';

        if (results.length === 0) {
            elements.categoryList.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-search"></i>
                    <p>找不到符合的類別</p>
                    <small>請嘗試其他關鍵字</small>
                </div>
            `;
            return;
        }

        // Render search results
        elements.categoryList.innerHTML = results.map(cat => {
            const highlightedName = highlightText(cat.name, searchTerm);
            const highlightedPath = highlightText(cat.fullPath, searchTerm);
            const fee = isMall ? cat.mall_fee : cat.general_fee;
            
            return `
                <button type="button" 
                        class="list-group-item list-group-item-action category-item leaf-category"
                        data-fee="${fee}"
                        data-path="${cat.path.join(',')}">
                    <div>
                        <div>${highlightedName}</div>
                        <small class="text-muted d-block">${highlightedPath}</small>
                    </div>
                    <span class="category-fee">${fee}</span>
                </button>
            `;
        }).join('');

        // Add click handlers for search results
        elements.categoryList.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                const fee = item.dataset.fee;
                const path = item.dataset.path.split(',');
                selectFee(fee, path);
            });
        });
    });

    // Highlight search term in text
    function highlightText(text, term) {
        if (!term) return text;
        
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

})();
