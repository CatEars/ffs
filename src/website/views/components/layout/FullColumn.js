import { html } from '../base.js';

export default function FullColumn(props) {
    return html`
        <div class="col-12">${props.children}</div>
    `;
}
