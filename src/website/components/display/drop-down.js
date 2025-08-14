import { BaseWebComponent } from '../base.js';

class DropDown extends BaseWebComponent {
    render(html) {
        return html`<style>
                .dropdown-toggle {
                    display: none;
                }
                .dropdown-toggle:not(:checked) + label > .icon-expanded {
                    display: none;
                }
                .dropdown-toggle:checked + label > .icon-collapsed {
                    display: none;
                }
                .dropdown-content {
                    display: none;
                }
                .dropdown-toggle:checked + label + .dropdown-content {
                    display: block;
                }
                .outer {
                    width: 100%;
                    border: 1px solid gray;
                }
                .dropdown-content {
                    margin-left: 1rem;
                    margin-right: 1rem;
                }
            </style>
            <div class="outer">
                <input
                    class="dropdown-toggle"
                    type="checkbox"
                    id="dropdown-toggle"
                    name="dropdown-toggle"
                />
                <label class="dropdown-label" for="dropdown-toggle">
                    <svg class="icon icon-collapsed">
                        <use href="/static/svg/sprite_sheet.svg#expand_content"></use>
                    </svg>
                    <svg class="icon icon-expanded">
                        <use href="/static/svg/sprite_sheet.svg#collapse_content"></use>
                    </svg>
                </label>

                <div class="dropdown-content">
                    <slot></slot>
                </div>
            </div>`;
    }
}

export default DropDown;
