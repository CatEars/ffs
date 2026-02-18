import { BaseWebComponent } from '../base.js';

class PaginateControl extends BaseWebComponent {
    static observedAttributes = ['page', 'max-pages'];

    render(html) {
        const currentPage = Number.parseInt(this.getAttribute('page')) || 1;
        const maxPages = Number.parseInt(this.getAttribute('max-pages')) || 1;
        const to = (page) => {
            if (page < 1 || page > maxPages || page === currentPage) {
                return;
            }
            this.dispatchEvent(
                new CustomEvent('page-shift', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        page,
                    },
                })
            );
        };
        const pre = () => {
            to(currentPage - 1);
        };

        const post = () => {
            to(currentPage + 1);
        };

        // Generate page numbers to display with ellipses
        const getPageNumbers = () => {
            const pages = [];
            const delta = 2; // Show 2 pages on each side of current page
            
            // Calculate if we need ellipses
            // Threshold calculation: delta*2 (adjacent pages) + 1 (current) + 2 (first + last) = 7
            // If maxPages <= 7, all pages fit comfortably without ellipses
            const ELLIPSIS_THRESHOLD = delta * 2 + 1 + 2;
            const needsEllipses = maxPages > ELLIPSIS_THRESHOLD;
            
            if (!needsEllipses) {
                for (let i = 1; i <= maxPages; i++) {
                    pages.push(i);
                }
                return pages;
            }
            
            // Otherwise, show pages with ellipses
            for (let i = 1; i <= maxPages; i++) {
                // Always show first page, last page, current page, and pages within delta
                if (
                    i === 1 ||
                    i === maxPages ||
                    (i >= currentPage - delta && i <= currentPage + delta)
                ) {
                    pages.push(i);
                }
            }
            
            return pages;
        };

        const pageNumbers = getPageNumbers();

        return html`
            <style>
                li {
                    list-style-type: none;
                }

                nav {
                    border: 1px white;
                    border-radius: 3px;
                }
                ul {
                    display: flex;
                    flex-direction: row;
                    gap: 1rem;
                }
                a {
                    text-decoration: underline;
                    color: var(--font-color);
                }
                a.disabled {
                    opacity: var(--disabled-opacity);
                    pointer-events: none;
                }
                .ellipsis {
                    color: var(--font-color);
                    opacity: var(--disabled-opacity);
                }
            </style>
            <nav>
                <ul>
                    <li>
                        <a
                            href="#"
                            class="${currentPage === 1 ? 'disabled' : ''}"
                            onclick="${() => pre()}"
                            >${'<'}</a
                        >
                    </li>
                    ${pageNumbers.map((pageNum, idx) => {
                        const prevPageNum = idx > 0 ? pageNumbers[idx - 1] : 0;
                        const showEllipsis = pageNum - prevPageNum > 1;
                        
                        return html`
                            ${showEllipsis ? html`<li class="ellipsis">...</li>` : ''}
                            <li>
                                <a
                                    href="#"
                                    class="${currentPage === pageNum ? 'disabled' : ''}"
                                    onclick="${() => to(pageNum)}"
                                    >${pageNum}</a
                                >
                            </li>
                        `;
                    })}
                    <li>
                        <a
                            href="#"
                            class="${currentPage === maxPages ? 'disabled' : ''}"
                            onclick="${() => post()}"
                            >${'>'}</a
                        >
                    </li>
                </ul>
            </nav>
        `;
    }
}

export default PaginateControl;
