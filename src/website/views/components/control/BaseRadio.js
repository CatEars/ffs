import { html } from '../base.js';

function BaseRadio(props) {
    const checked = props.checked;
    return html`<label class="${checked ? 'checked' : ''}">${props.children}</label> `;
}

export default BaseRadio;
