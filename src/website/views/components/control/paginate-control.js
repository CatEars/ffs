import { BaseWebComponent } from '../base.js';

class PaginateControl extends BaseWebComponent {
    static observedAttributes = ['page', 'max-pages'];

    render(html) {
        const currentPage = Number.parseInt(this.getAttribute('page')) || 1;
        const maxPages = Number.parseInt(this.getAttribute('max-pages')) || 1;
        console.log('Rendering with', this.getAttribute('page'), this.getAttribute('max-pages'));
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

        return html`<nav>
            <ul class="pagination">
                <li class="page-item">
                    <a
                        href="#"
                        class="page-link ${currentPage === 1 ? 'disabled' : ''}"
                        onclick=${() => pre()}
                        >${'<'}</a
                    >
                </li>
                ${Array.from({ length: maxPages }).map(
                    (_, idx) => html`
                        <li class="page-item">
                            <a
                                href="#"
                                class="page-link ${currentPage === idx + 1 ? 'disabled' : ''}"
                                onclick=${() => to(idx + 1)}
                                >${idx + 1}</a
                            >
                        </li>
                    `
                )}
                <li class="page-item">
                    <a
                        href="#"
                        class="page-link ${currentPage === maxPages ? 'disabled' : ''}"
                        onclick=${() => post()}
                        >${'>'}</a
                    >
                </li>
            </ul>
        </nav>`;
    }
}

export default PaginateControl;
