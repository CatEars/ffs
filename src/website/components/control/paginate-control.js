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
                    color: rgba(255, 255, 255, 0.4);
                    pointer-events: none;
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
                    ${Array.from({ length: maxPages }).map(
                        (_, idx) =>
                            html`
                                <li>
                                    <a
                                        href="#"
                                        class="${currentPage === idx + 1 ? 'disabled' : ''}"
                                        onclick="${() => to(idx + 1)}"
                                        >${idx + 1}</a
                                    >
                                </li>
                            `
                    )}
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
