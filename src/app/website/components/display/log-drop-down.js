import { BaseWebComponent } from '../base.js';

class LogDropDown extends BaseWebComponent {
    static observedAttributes = ['header', 'text'];
    render(html) {
        const header = this.getAttribute('header');
        const text = this.getAttribute('text');
        return html`<drop-down>
            <h2 slot="header">${header}</h2>
            <pre>${text}</pre>
        </drop-down>`;
    }
}

export default LogDropDown;
