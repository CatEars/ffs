import { BaseWebComponent } from '../base.js';

class AppMain extends BaseWebComponent {
    render(html) {
        return html`
            <style>
                main {
                    display: flex;
                    flex-direction: column;
                    margin-left: 1rem;
                }
            </style>
            <main>
                <slot></slot>
            </main>
        `;
    }
}

export default AppMain;
