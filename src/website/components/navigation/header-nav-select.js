import { BaseWebComponent } from '../base.js';

class HeaderNavSelect extends BaseWebComponent {
    render(html) {
        let currentLocation = document.location.pathname;
        if (!currentLocation.endsWith('/')) {
            currentLocation += '/';
        }

        const tabs = [
            { href: '/home/', label: 'Files' },
            { href: '/custom-commands/', label: 'Commands' },
            { href: '/share-file/', label: 'Share' },
            { href: '/logs/', label: 'Logs' },
        ];

        const navigate = (e) => {
            window.location.href = e.target.value;
        };

        return html`
            <style>
                select {
                    font-size: 16px;
                    padding: 0.5rem;
                    border-radius: 5px;
                    background-color: gray;
                    color: var(--font-color);
                    border: 1px solid black;
                    cursor: pointer;
                    width: 100%;
                }
            </style>
            <select onchange="${(e) => navigate(e)}">
                ${tabs.map(
                    (tab) =>
                        html`<option
                            value="${tab.href}"
                            selected=${currentLocation.startsWith(tab.href)}
                        >
                            ${tab.label}
                        </option>`
                )}
            </select>
        `;
    }
}

export default HeaderNavSelect;
