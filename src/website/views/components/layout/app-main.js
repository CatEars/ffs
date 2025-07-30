import { BaseWebComponent } from '../base.js';

class AppMain extends BaseWebComponent {
    render(html) {
        return html`<style>
                ::slotted(.row) {
                    margin-bottom: 1rem;
                }
            </style>
            <section class="container">
                <slot></slot>
            </section>`;
    }
}

export default AppMain;
