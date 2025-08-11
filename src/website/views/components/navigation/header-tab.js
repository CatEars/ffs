import { BaseWebComponent } from '../base.js';

class HeaderTab extends BaseWebComponent {
    static observedAttributes = ['href'];

    render(html) {
        const href = this.getAttribute('href') || '';
        let currentLocation = document.location.pathname;
        if (!currentLocation.endsWith('/')) {
            currentLocation += '/';
        }
        const selected = currentLocation.startsWith(href);
        console.log('HREF', href, 'LOCA', currentLocation, 'SEL', selected);

        return html` <style>
                a {
                    color: var(--font-color);
                    font-size: 16px;
                    text-decoration: none;
                    line-height: 16px;
                }
                div {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: end;
                    align-items: center;
                }
                a.selected {
                }
            </style>
            <div>
                <a href="${href}" class="${selected ? 'selected' : ''}"><slot></slot></a>
            </div>`;
    }
}

export default HeaderTab;
