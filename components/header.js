export function getHeader(currentPage = 'home') {
    const navLinks = [
        { name: '首頁', path: 'index.html', id: 'home' },
        { name: '快速計算', path: 'calc.html', id: 'calc' },
        { name: '賣場設定', path: 'settings.html', id: 'settings' },
        { name: '商品管理', path: 'management.html', id: 'management' },
        { name: '說明', path: 'guide.html', id: 'guide' }
    ];

    const navItems = navLinks.map(link => `
        <li>
            <a href="${link.path}" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent
                ${currentPage === link.id ? 'md:text-blue-700 dark:text-blue-500' : ''}">
                ${link.name}
            </a>
        </li>
    `).join('');

    // 取得當前主題以顯示正確的圖示
    const isDark = document.documentElement.classList.contains('dark');
    const moonIcon = `<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>`;
    const sunIcon = `<path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.071 14.929a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zm1.414-10.607a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM3 11a1 1 0 100-2H2a1 1 0 000 2h1z"></path>`;

    return `
        <nav class="bg-white border-gray-200 dark:bg-gray-900 border-b dark:border-gray-800">
            <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <a href="index.html" class="flex items-center space-x-3 rtl:space-x-reverse">
                    <img src="favicon.svg" class="h-8" alt="Shopee Fee Calculator Logo" />
                    <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">蝦皮手續費計算機</span>
                </a>
                <div class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse items-center">
                    <!-- Dark Mode Toggle -->
                    <button id="themeToggle" type="button" class="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5">
                        <svg id="themeIcon" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">${isDark ? sunIcon : moonIcon}</svg>
                    </button>
                    <button data-collapse-toggle="navbar-cta" type="button" class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-cta" aria-expanded="false">
                        <span class="sr-only">Open main menu</span>
                        <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/></svg>
                    </button>
                </div>
                <div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-cta">
                    <ul class="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                        ${navItems}
                    </ul>
                </div>
            </div>
        </nav>
    `;
}

export function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const htmlElement = document.documentElement;

    let savedTheme = localStorage.getItem('theme') || 'system'; // Default to system

    function applyTheme(theme) {
        const moonIcon = '<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>';
        const sunIcon = '<path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.071 14.929a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zm1.414-10.607a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM3 11a1 1 0 100-2H2a1 1 0 000 2h1z"></path>';
        
        if (theme === 'system') {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                htmlElement.classList.add('dark');
                htmlElement.setAttribute('data-theme', 'dark');
                if (themeIcon) themeIcon.innerHTML = sunIcon;
            } else {
                htmlElement.classList.remove('dark');
                htmlElement.setAttribute('data-theme', 'light');
                if (themeIcon) themeIcon.innerHTML = moonIcon;
            }
        } else if (theme === 'dark') {
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

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (savedTheme === 'system') {
            applyTheme('system');
        }
    });

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (savedTheme === 'dark') {
                savedTheme = 'light';
            } else if (savedTheme === 'light') {
                savedTheme = 'system';
            } else { // currentTheme === 'system'
                savedTheme = 'dark';
            }
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
