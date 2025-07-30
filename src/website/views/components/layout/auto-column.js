import { BaseWebComponent } from '../base.js';

class AutoColumn extends BaseWebComponent {
    render(html) {
        return html`<div class="col col-sm-auto">
            <slot></slot>
        </div>`;
    }
}

export default AutoColumn;
