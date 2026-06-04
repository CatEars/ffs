import { BaseWebComponent } from '../base.js';

class LogDropDown extends BaseWebComponent {
    static observedAttributes = ['header', 'text'];
    render(html) {
        const header = this.getAttribute('header');
        const text = this.getAttribute('text');
        return html`<drop-down>
            <style>
                pre {
                    display: flex;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
            </style>
            <h2 slot="header">${header}</h2>
            <pre>${text}</pre>
        </drop-down>`;
    }
}

export default LogDropDown;
