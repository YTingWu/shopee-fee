export function getHeader(currentPage = 'home') {
    const navLinks = [
        { name: '首頁', path: 'index.html', id: 'home', icon: 'house-fill' },
        { name: '快速計算', path: 'calc.html', id: 'calc', icon: 'calculator-fill' },
        { name: '賣場設定', path: 'settings.html', id: 'settings', icon: 'gear-fill' },
        { name: '商品管理', path: 'management.html', id: 'management', icon: 'box-seam-fill' },
        { name: '說明', path: 'guide.html', id: 'guide', icon: 'info-circle-fill' }
    ];

    const navItems = navLinks.map(link => `
        <li>
            <a href="${link.path}" 
               class="nav-link ${currentPage === link.id ? 'active' : ''}"
               style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1rem; font-weight: 600; font-size: 0.95rem; border-radius: 10px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); text-decoration: none;
               ${currentPage === link.id ? 
                 'color: white; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);' : 
                 'color: var(--text-secondary);'}">
                <i class="bi bi-${link.icon}"></i>
                <span>${link.name}</span>
            </a>
        </li>
    `).join('');

    const isDark = document.documentElement.classList.contains('dark');
    const moonIcon = `<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>`;
    const sunIcon = `<path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.071 14.929a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zm1.414-10.607a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM3 11a1 1 0 100-2H2a1 1 0 000 2h1z"></path>`;

    return `
        <style>
            header nav {
                background: var(--bg-secondary);
                border-bottom: 1px solid var(--border-color);
                box-shadow: var(--shadow-sm);
                position: sticky;
                top: 0;
                z-index: 1000;
                backdrop-filter: blur(10px);
            }
            
            .nav-link:not(.active):hover {
                color: var(--primary) !important;
                background: rgba(238, 77, 45, 0.1);
            }
            
            #themeToggle {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-secondary);
                transition: all 0.2s;
                border: 2px solid transparent;
            }
            
            #themeToggle:hover {
                background: rgba(238, 77, 45, 0.1);
                color: var(--primary);
                border-color: var(--primary);
            }
            
            .logo-text {
                background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-weight: 900;
                font-size: 1.25rem;
            }
            
            @media (max-width: 768px) {
                nav ul {
                    background: var(--bg-secondary) !important;
                    border: 1px solid var(--border-color) !important;
                    margin-top: 1rem;
                    padding: 1rem !important;
                }
                
                nav ul li {
                    margin-bottom: 0.5rem;
                }
                
                .nav-link {
                    width: 100%;
                }
            }
        </style>
        <nav style="padding: 1rem 0;">
            <div class="container" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
                <a href="index.html" style="display: flex; align-items: center; gap: 0.75rem; text-decoration: none;">
                    <img src="favicon.svg" style="height: 40px;" alt="Logo" />
                    <span class="logo-text">蝦皮手續費計算機</span>
                </a>
                <div style="display: flex; align-items: center; gap: 1rem; order: 2;">
                    <button id="themeToggle" type="button">
                        <svg id="themeIcon" style="width: 20px; height: 20px;" fill="currentColor" viewBox="0 0 20 20">${isDark ? sunIcon : moonIcon}</svg>
                    </button>
                    <button data-collapse-toggle="navbar-cta" type="button" style="display: none; width: 40px; height: 40px; align-items: center; justify-content: center; border-radius: 10px; border: 2px solid var(--border-color); background: transparent; color: var(--text-secondary); cursor: pointer;">
                        <svg style="width: 20px; height: 20px;" fill="none" viewBox="0 0 17 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/></svg>
                    </button>
                </div>
                <div id="navbar-cta" style="width: 100%; order: 3; display: none;">
                    <ul style="display: flex; flex-direction: column; gap: 0.5rem; list-style: none; margin: 0; padding: 0;">
                        ${navItems}
                    </ul>
                </div>
            </div>
        </nav>
        <style>
            @media (min-width: 768px) {
                [data-collapse-toggle] {
                    display: none !important;
                }
                #navbar-cta {
                    display: block !important;
                    width: auto !important;
                    order: 1 !important;
                    margin-left: auto;
                    margin-right: 1rem;
                }
                #navbar-cta ul {
                    flex-direction: row !important;
                    gap: 0.5rem !important;
                }
            }
        </style>
    `;
}

export function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const htmlElement = document.documentElement;

    let savedTheme = localStorage.getItem('theme');
    
    // 如果沒有設定過，或者原本是 system，則根據目前系統偏好決定初始值
    if (!savedTheme || savedTheme === 'system') {
        savedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        const moonIcon = '<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>';
        const sunIcon = '<path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.071 14.929a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zm1.414-10.607a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM3 11a1 1 0 100-2H2a1 1 0 000 2h1z"></path>';
        
        if (theme === 'dark') {
            htmlElement.classList.add('dark');
            htmlElement.setAttribute('data-theme', 'dark');
            if (themeIcon) themeIcon.innerHTML = sunIcon;
        } else {
            htmlElement.classList.remove('dark');
            htmlElement.setAttribute('data-theme', 'light');
            if (themeIcon) themeIcon.innerHTML = moonIcon;
        }
    }

    // Apply initial theme
    applyTheme(savedTheme);

    // 移除對系統偏好改變的監聽，因為我們現在強行指定為 dark/light
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            savedTheme = savedTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', savedTheme);
            applyTheme(savedTheme);
        });
    }

    // Mobile menu toggle
    const navbarToggle = document.querySelector('[data-collapse-toggle="navbar-cta"]');
    const navbarMenu = document.getElementById('navbar-cta');

    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', () => {
            navbarMenu.classList.toggle('hidden');
            navbarMenu.classList.toggle('block');
            navbarToggle.setAttribute('aria-expanded', navbarMenu.classList.contains('block'));
        });
    }
}
