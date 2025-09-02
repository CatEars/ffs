import { BaseWebComponent } from '../base.js';
import { isAttributeTrue } from '../util.js';

class IconHover extends BaseWebComponent {
    static observedAttributes = ['url', 'disabled'];

    render(html) {
        const url =
            this.getAttribute('url') ||
            (isAttributeTrue(this.getAttribute('disabled')) ? '' : '/static/svg/image.svg');
        if (!url) {
            return html`<slot></slot>`;
        }

        return html`
            <style>
                div {
                    position: relative;
                }
                label {
                    position: absolute;
                    visibility: hidden;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    left: 2rem;
                    top: -30px;
                    padding-top: 1rem;
                    padding-bottom: 1rem;
                    padding-left: 1rem;
                    padding-right: 1rem;
                    border: 1px solid grey;
                    background-color: var(--background-color);
                }
                .icon-holder {
                    background-image: url('${url}');
                    background-size: cover;
                    background-repeat: no-repeat;
                    width: 128px;
                    height: 128px;
                }
                div:hover > label {
                    visibility: visible;
                }
            </style>
            <div>
                <label>
                    <span class="icon-holder"></span>
                </label>
                <slot></slot>
            </div>
        `;
    }
}

export default IconHover;
