import { BaseWebComponent } from './base.js';

export class BaseFormComponent extends BaseWebComponent {
    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        this.setupCsrf();
    }

    async setupCsrf() {
        const forms = this.shadowRoot.querySelectorAll('form');
        const token = await getCookie('FFS-Csrf-Protection');

        for (const shadowForm of forms) {
            shadowForm.addEventListener('submit', (_event) => {
                if (token) {
                    let input = shadowForm.querySelector('input[name="ffs_csrf_protection"]');
                    if (!input) {
                        input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = 'ffs_csrf_protection';
                        shadowForm.appendChild(input);
                    }
                    input.value = token.value;
                }
            });
        }
    }
}
