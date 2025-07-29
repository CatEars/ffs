import { BaseWebComponent } from './base.js';

class MyTestComponent extends BaseWebComponent {
    render(html) {
        return html`<div class="container">
            <div class="row row-cols-2">
                <div class="col"><p>first</p></div>
                <div class="col"><slot></slot></div>
            </div>
        </div>`;
    }
}

customElements.define('my-test', MyTestComponent);
