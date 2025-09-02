import { BaseWebComponent } from '../base.js';
import { isAttributeTrue } from '../util.js';

class SwitchControl extends BaseWebComponent {
    static observedAttributes = ['checked'];

    render(html) {
        const checked = isAttributeTrue(this.getAttribute('checked'));
        const onChange = () => {
            this.dispatchEvent(
                new CustomEvent('change', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        checked: !checked,
                    },
                })
            );
        };
        return html`
            <style>
                label {
                    display: flex;
                    flex-direction: row;
                    gap: 1.5rem;
                }
            </style>
            <label>
                <input
                    type="checkbox"
                    role="switch"
                    id="switchCheckChecked"
                    checked="${checked}"
                    onchange="${() => onChange()}"
                />
                <slot></slot>
            </label>
        `;
    }
}

export default SwitchControl;
