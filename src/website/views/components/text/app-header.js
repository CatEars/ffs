import { BaseWebComponent } from '../base.js';

class AppHeader extends BaseWebComponent {
    render(html) {
        return html`
            <div class="row">
                <h1><slot></slot></h1>
            </div>
        `;
    }
}

export default AppHeader;
