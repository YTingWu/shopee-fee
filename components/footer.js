export function getFooter() {
    return `
        <footer class="bg-white rounded-lg shadow m-4 dark:bg-gray-800 border-t dark:border-gray-700">
            <div class="container mx-auto p-4 md:flex md:items-center md:justify-between">
              <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2026 <a href="https://ytingwu.github.io/shopee-fee/" class="hover:underline">Bruce Wu</a>. All Rights Reserved.
            </span>
            <ul class="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
                <li>
                    <a href="https://www.instagram.com/bruce_baseball_" target="_blank" class="hover:underline me-4 md:me-6">
                        <i class="bi bi-instagram"></i> Instagram
                    </a>
                </li>
                <li>
                    <a href="https://www.threads.com/@bruce_baseball_" target="_blank" class="hover:underline me-4 md:me-6">
                        <i class="bi bi-threads"></i> Threads
                    </a>
                </li>
                <li>
                    <a href="https://github.com/YTingWu/shopee-fee" target="_blank" class="hover:underline me-4 md:me-6">
                        <i class="bi bi-github"></i> GitHub
                    </a>
                </li>
                <li>
                    <a href="guide.html" class="hover:underline">免責聲明</a>
                </li>
            </ul>
            </div>
            <div class="container mx-auto p-4 text-center">
                <div class="mb-2">
                    <a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/" target="_blank">
                        <img alt="創用 CC 授權條款" style="border-width:0;display:inline-block;" src="https://i.creativecommons.org/l/by-nc-nd/4.0/88x31.png" />
                    </a>
                </div>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                    本著作係採用 <a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/" target="_blank" class="hover:underline">創用 CC 姓名標示-非商業性-禁止改作 4.0 國際 授權條款</a> 授權.
                </span>
                <div class="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    v2.0.0
                </div>
            </div>
        </footer>
    `;
}
