import { BaseWebComponent } from '../base.js';
import BaseRadio from './BaseRadio.js';

class RadioControl extends BaseWebComponent {
    static get observedAttributes() {
        return ['imgsrc', 'checked', 'name', 'text'];
    }

    render(html) {
        const imgSrc = this.getAttribute('imgsrc') || '';
        const checked = this.getAttribute('checked') || '';
        const name = this.getAttribute('name') || '';
        const text = this.getAttribute('text') || '';
        if (imgSrc) {
            return html`<${BaseRadio} name="${name}" checked="${checked}">
                <svg class="icon">
                    <use href="/static/svg/sprite_sheet.svg#${imgSrc}"></use>
                </svg>
            </${BaseRadio}>`;
        } else {
            return html`<${BaseRadio} name="${name}" checked="${checked}">
                ${text}
            </${BaseRadio}>`;
        }
    }
}

export default RadioControl;
