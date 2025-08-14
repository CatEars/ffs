import { BaseWebComponent } from '../base.js';

class AppHeader extends BaseWebComponent {
    render(html) {
        return html`
            <style>
                header {
                    display: flex;
                    flex-direction: row;
                    gap: 1rem;
                    align-items: center;
                }
            </style>
            <header>
                <slot name="starter"></slot>
                <h1><slot></slot></h1>
                <slot name="ender"></slot>
            </header>
        `;
    }
}

export default AppHeader;
