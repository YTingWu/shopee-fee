export function getFooter() {
    return `
        <style>
            footer {
                background: var(--bg-secondary);
                border-top: 1px solid var(--border-color);
                margin-top: 4rem;
                padding: 3rem 0 2rem;
            }
            
            footer a {
                color: var(--text-secondary);
                text-decoration: none;
                transition: color 0.2s;
                display: inline-flex;
                align-items: center;
                gap: 0.375rem;
            }
            
            footer a:hover {
                color: var(--primary);
            }
            
            .footer-links {
                display: flex;
                flex-wrap: wrap;
                gap: 1.5rem;
                justify-content: center;
                margin-bottom: 1.5rem;
            }
            
            .footer-copyright {
                text-align: center;
                color: var(--text-tertiary);
                font-size: 0.875rem;
                margin-bottom: 1rem;
            }
            
            .footer-license {
                text-align: center;
                margin-top: 1.5rem;
                padding-top: 1.5rem;
                border-top: 1px solid var(--border-color);
            }
            
            .footer-license img {
                margin: 0 auto 0.75rem;
                display: block;
            }
            
            .footer-license p {
                color: var(--text-tertiary);
                font-size: 0.85rem;
                margin: 0.5rem 0;
            }
            
            .footer-version {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.375rem 0.875rem;
                background: var(--bg-tertiary);
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 600;
                color: var(--text-secondary);
                margin-top: 0.75rem;
            }
            
            @media (max-width: 768px) {
                .footer-links {
                    flex-direction: column;
                    gap: 1rem;
                    align-items: center;
                }
            }
        </style>
        <footer>
            <div class="container">
                <div class="footer-links">
                    <a href="https://www.instagram.com/bruce_baseball_" target="_blank" rel="noopener">
                        <i class="bi bi-instagram"></i>
                        <span>Instagram</span>
                    </a>
                    <a href="https://www.threads.com/@bruce_baseball_" target="_blank" rel="noopener">
                        <i class="bi bi-threads"></i>
                        <span>Threads</span>
                    </a>
                    <a href="https://github.com/YTingWu/shopee-fee" target="_blank" rel="noopener">
                        <i class="bi bi-github"></i>
                        <span>GitHub</span>
                    </a>
                    <a href="guide.html">
                        <i class="bi bi-info-circle"></i>
                        <span>免責聲明</span>
                    </a>
                </div>
                
                <div class="footer-copyright">
                    © 2026 <a href="https://ytingwu.github.io/shopee-fee/" style="font-weight: 600;">Bruce Wu</a>. All Rights Reserved.
                </div>
                
                <div class="footer-license">
                    <a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/" target="_blank">
                        <img alt="創用 CC 授權條款" style="border-width:0;" src="https://i.creativecommons.org/l/by-nc-nd/4.0/88x31.png" />
                    </a>
                    <p>
                        本著作係採用 <a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/" target="_blank">創用 CC 姓名標示-非商業性-禁止改作 4.0 國際 授權條款</a> 授權
                    </p>
                    <div class="footer-version">
                        <i class="bi bi-tag"></i>
                        <span>v2.0.0</span>
                    </div>
                </div>
            </div>
        </footer>
    `;
}
