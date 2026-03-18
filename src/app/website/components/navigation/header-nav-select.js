class HeaderNavSelect extends HTMLElement {
    connectedCallback() {
        const shadow = this.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = `
            slot { display: none; }
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
        `;

        const select = document.createElement('select');
        select.addEventListener('change', (e) => {
            window.location.href = e.target.value;
        });

        const slot = document.createElement('slot');
        slot.addEventListener('slotchange', () => this._buildOptions(select));

        shadow.appendChild(style);
        shadow.appendChild(select);
        shadow.appendChild(slot);

        this._buildOptions(select);
    }

    _buildOptions(select) {
        let currentLocation = document.location.pathname;
        if (!currentLocation.endsWith('/')) {
            currentLocation += '/';
        }

        select.replaceChildren();

        for (const child of this.children) {
            if (child instanceof HTMLOptionElement) {
                const opt = child.cloneNode(true);
                opt.selected = currentLocation.startsWith(child.value);
                select.appendChild(opt);
            }
        }
    }
}

export default HeaderNavSelect;
