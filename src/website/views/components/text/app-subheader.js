import { BaseWebComponent } from "../base.js";

class AppSubheader extends BaseWebComponent {
    render(html) {
        return html`<div class="row"><h2><slot></slot></h2></div>`
    }
}

export default AppSubheader