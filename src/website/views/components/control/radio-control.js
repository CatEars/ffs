import { BaseWebComponent } from '../base.js';
import BaseRadio from './BaseRadio.js';

class RadioControl extends BaseWebComponent {
    static get observedAttributes() {
        return ['imgsrc', 'checked', 'text'];
    }

    render(html) {
        const imgSrc = this.getAttribute('imgsrc') || '';
        const checked = this.getAttribute('checked') || '';
        const text = this.getAttribute('text') || '';
        const styles = html` <style>
            svg {
                color: gray;
                display: block;
            }
            .checked > svg {
                color: rgb(100, 150, 255);
            }
            label {
                user-select: none;
                color: gray;
            }
            label.checked {
                color: rgb(100, 150, 255);
            }
        </style>`;
        if (imgSrc) {
            return html`${styles}
            <${BaseRadio} checked="${checked}">
                <svg class="icon">
                    <use href="/static/svg/sprite_sheet.svg#${imgSrc}"></use>
                </svg>
            </${BaseRadio}>`;
        } else {
            return html`${styles}
            <${BaseRadio} checked="${checked}">
                ${text}
            </${BaseRadio}>`;
        }
    }
}

export default RadioControl;
