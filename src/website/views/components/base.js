import { h, render } from './vendor/preact.mjs';
import htm from './vendor/htm.mjs';

export const html = htm.bind(h);

let sharedStylesheet = null;

async function loadSharedStylesheet() {
    if (sharedStylesheet) {
        return sharedStylesheet;
    }

    sharedStylesheet = new CSSStyleSheet();
    try {
        const response = await fetch('/static/bootstrap.min.css');
        if (!response.ok) {
            throw new Error(`Failed to load stylesheet: ${response.statusText}`);
        }
        const cssText = await response.text();

        sharedStylesheet.replaceSync(cssText);
        console.log('Shared stylesheet loaded and parsed.');
    } catch (error) {
        console.error('Error loading shared stylesheet:', error);
        sharedStylesheet = null;
    }
    return sharedStylesheet;
}

loadSharedStylesheet();

export class BaseWebComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        if (sharedStylesheet) {
            this.shadowRoot.adoptedStyleSheets = [sharedStylesheet];
        }
        this._renderComponent();
    }

    render(_html) {
        // Sub-components should override this to return a Node (e.g., a div, p, template content)
        // Example: return html`<div>Hello, World!</div>`;
        throw new Error('Sub-components must implement the render(...) method.');
    }

    _renderComponent() {
        const content = this.render(html);
        render(content, this.shadowRoot);
    }

    attributeChangedCallback(_name, _oldValue, _newValue) {
        this._renderComponent();
    }
}
