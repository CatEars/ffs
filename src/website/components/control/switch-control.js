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
                    height: 100%;
                    width: 100%;
                }
            </style>
            <div class="form-row">
                <label>
                    <input
                        type="checkbox"
                        role="switch"
                        id="switchCheckChecked"
                        checked="${checked}"
                        onchange="${() => onChange()}"
                    />
                </label>
                <div><slot></slot></div>
            </div>
        `;
    }
}

export default SwitchControl;
