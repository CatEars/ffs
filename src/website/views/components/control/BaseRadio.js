import { html } from '../base.js';

function BaseRadio(props) {
    const name = props.name;
    const checked = props.checked;
    return html`
        <div class="form-check form-check-inline">
            <input
                class="form-check-input"
                type="radio"
                name="${name}"
                id="${name}"
                checked="${checked}"
            />
            <label class="form-check-label" for="${name}">${props.children}</label>
        </div>
    `;
}

export default BaseRadio;
