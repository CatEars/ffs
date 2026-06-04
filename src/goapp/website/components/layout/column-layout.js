import { BaseWebComponent } from '../base.js';

class ColumnLayout extends BaseWebComponent {
    render(html) {
        return html`
            <style>
                div {
                    display: flex;
                    flex-direction: column;
                }
            </style>
            <div>
                <slot></slot>
            </div>
        `;
    }
}

export default ColumnLayout;
