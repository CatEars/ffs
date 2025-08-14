import { BaseWebComponent } from '../base.js';

class SwitchControl extends BaseWebComponent {
    static observedAttributes = ['checked'];

    render(html) {
        const checked = !!(this.getAttribute('checked') || '');
        const onChange = () => {
            this.dispatchEvent(
                new CustomEvent('change', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        checked: !checked,
                    },
                }),
            );
        };
        return html`
            <div class="form-check form-check-inline form-switch">
                <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="switchCheckChecked"
                    checked="${checked}"
                    onchange="${() => onChange()}"
                />
                <label class="form-check-label" for="switchCheckChecked">
                    <slot></slot>
                </label>
            </div>
        `;
    }
}

export default SwitchControl;
