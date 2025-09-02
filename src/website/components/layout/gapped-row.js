import { BaseWebComponent } from '../base.js';

class GappedRow extends BaseWebComponent {
    render(html) {
        return html`
            <style>
                div {
                    display: flex;
                    flex-direction: row;
                    gap: 1rem;
                    align-items: center;
                }
            </style>
            <div>
                <slot></slot>
            </div>
        `;
    }
}

export default GappedRow;
