import { html } from '../base.js';

function BaseRadio(props) {
    const name = props.name;
    const checked = props.checked;
    return html`
        <style>
            div {
                display: flex;
                flex-direction: row;
                align-items: center;
            }
            input {
                margin-top: 0px;
                margin-bottom: 0px;
            }
        </style>
        <div>
            <input type="radio" name="${name}" id="${name}" checked="${checked}" />
            <label for="${name}">${props.children}</label>
        </div>
    `;
}

export default BaseRadio;
