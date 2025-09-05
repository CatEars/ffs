import { BaseWebComponent } from '../base.js';

class HorizontalRuler extends BaseWebComponent {
    render(html) {
        return html`
            <style>
                hr {
                    width: 100%;
                }
            </style>
            <hr />
        `;
    }
}

export default HorizontalRuler;
