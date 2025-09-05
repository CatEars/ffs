import { BaseWebComponent } from '../base.js';
import { isAttributeTrue } from '../util.js';

class IconHover extends BaseWebComponent {
    static observedAttributes = ['url', 'disabled'];

    render(html) {
        const url =
            this.getAttribute('url') ||
            (isAttributeTrue(this.getAttribute('disabled')) ? '' : '/static/svg/image.svg');
        const styles = html`<style>
            .outer {
                position: relative;
                height: 100%;
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
                width: var(--thumbnail-hover-max-width);
                height: var(--thumbnail-hover-max-width);
            }
            .outer:hover > label {
                visibility: visible;
            }
            .inner {
                height: 100%;
                display: flex;
                flex-direction: row;
                align-items: center;
            }
        </style>`;

        if (!url) {
            return html`${styles}
                <div class="outer">
                    <div class="inner">
                        <slot></slot>
                    </div>
                </div>`;
        }

        return html`
            ${styles}
            <div class="outer">
                <label>
                    <span class="icon-holder"></span>
                </label>
                <div class="inner">
                    <slot></slot>
                </div>
            </div>
        `;
    }
}

export default IconHover;
