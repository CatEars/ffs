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

        return html` <style>
                a {
                    color: var(--font-color);
                    font-size: 16px;
                    text-decoration: none;
                    line-height: 16px;
                    padding-left: 1rem;
                    padding-right: 1rem;
                    padding-bottom: 0.5rem;
                }
                div {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: end;
                    align-items: center;
                }
                div.selected {
                    background-color: gray;
                    border-left: 1px solid black;
                    border-bottom: 1px solid black;
                    border-right: 1px solid black;
                    border-bottom-left-radius: 5px;
                    border-bottom-right-radius: 5px;
                }
            </style>
            <div class="${selected ? 'selected' : ''}">
                <a href="${href}"><slot></slot></a>
            </div>`;
    }
}

export default HeaderTab;
