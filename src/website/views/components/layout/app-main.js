import { BaseWebComponent } from "../base.js";

class AppMain extends BaseWebComponent {
    render(html) {
        return html`<section class="container"><slot></slot></section>`
    }
}

export default AppMain