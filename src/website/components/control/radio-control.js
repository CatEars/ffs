import { BaseWebComponent } from '../base.js';
import { isAttributeTrue } from '../util.js';

class RadioControl extends BaseWebComponent {
    static get observedAttributes() {
        return ['imgsrc', 'checked', 'text'];
    }

    render(html) {
        const imgSrc = this.getAttribute('imgsrc') || '';
        const checked = isAttributeTrue(this.getAttribute('checked') || '');
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
        const child = imgSrc
            ? html`<svg class="icon">
                  <use href="/static/svg/sprite_sheet.svg#${imgSrc}"></use>
              </svg>`
            : html`${text}`;
        return html`${styles} <label class="${checked ? 'checked' : ''}"> ${child} </label>`;
    }
}

export default RadioControl;
