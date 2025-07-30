import { BaseWebComponent } from '../base.js';
import BaseRadio from './BaseRadio.js';

class SortRadio extends BaseWebComponent {
    static get observedAttributes() {
        return ['imgsrc', 'checked', 'name', 'text'];
    }

    render(html) {
        const imgSrc = this.getAttribute('imgsrc') || '';
        const checked = this.getAttribute('checked') || '';
        const name = this.getAttribute('name') || '';
        const text = this.getAttribute('text') || '';
        console.log('Rendering sort-radio', name, checked, imgSrc, text);
        if (imgSrc) {
            return html`<${BaseRadio} name="${name}" checked="${checked}">
                <img width="26" src="${imgSrc}" />
            </${BaseRadio}>`;
        } else {
            return html`<${BaseRadio} name="${name}" checked="${checked}">
                ${text}
            </${BaseRadio}>`;
        }
    }
}

export default SortRadio;
