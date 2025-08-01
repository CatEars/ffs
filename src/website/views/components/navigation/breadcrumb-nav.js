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
                }),
            );
        };

        return html`
            <style>
            .breadcrumb-item > * {
                padding-left: 0.5em;
                padding-right: 0.5em;
            }
            </style>
            <div class="d-flex" style="height: 100%;">
                <div class="align-self-end">
                    <nav>
                        <ol class="breadcrumb">
                            ${preCrumbs.map(
                                (crumb, idx) =>
                                    html`
                                        <li class="breadcrumb-item">
                                            <a href="#" onclick="${() =>
                                                onIndexClick(idx)}">${crumb}</a>
                                        </li>
                                    `,
                            )}
                            <li class="breadcrumb-item active">
                                <span>${lastCrumb}</span>
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>
        `;
    }
}

export default BreadcrumbNav;
