import { BaseWebComponent } from '../base.js';

class BreadcrumbNav extends BaseWebComponent {
    static observedAttributes = ['trail'];

    render(html) {
        const trail = this.getAttribute('trail') || '';
        const crumbs = trail.split('/');

        const preCrumbs = crumbs.slice(0, crumbs.length - 1);
        const lastCrumb = crumbs[crumbs.length - 1];

        const onIndexClick = (idx) => {
            this.dispatchEvent(
                new CustomEvent('crumb-click', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        trail,
                        index: idx,
                    },
                })
            );
        };

        return html`
            <style>
                ol {
                    display: flex;
                    flex-direction: row;
                    align-content: center;
                    list-style-type: none;
                    gap: 1rem;
                }
                a {
                    color: var(--font-color);
                    text-decoration: underline;
                }
                li::after {
                    content: '/';
                    margin-left: 1rem;
                }
                li.breadcrumb-item > span {
                    cursor: default;
                }
            </style>
            <nav>
                <ol class="breadcrumb">
                    ${preCrumbs.map(
                        (crumb, idx) =>
                            html`
                                <li class="breadcrumb-item">
                                    <a href="#" onclick="${() => onIndexClick(idx)}">${crumb}</a>
                                </li>
                            `
                    )}
                    <li class="breadcrumb-item">
                        <span>${lastCrumb}</span>
                    </li>
                </ol>
            </nav>
        `;
    }
}

export default BreadcrumbNav;
