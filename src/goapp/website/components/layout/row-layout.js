import { BaseWebComponent } from '../base.js';

class RowLayout extends BaseWebComponent {
    render(html) {
        return html`
            <style>
                div {
                    display: flex;
                    flex-direction: row;
                }
            </style>
            <div>
                <slot></slot>
            </div>
        `;
    }
}

export default RowLayout;
