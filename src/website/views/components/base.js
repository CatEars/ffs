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
        sharedStylesheet = null; // Reset if loading failed
    }
    return sharedStylesheet;
}

loadSharedStylesheet();

export class BaseWebComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        const stylesheet = await loadSharedStylesheet();
        if (stylesheet) {
            this.shadowRoot.adoptedStyleSheets = [stylesheet];
        }
        this._renderComponent();
    }

    render() {
        // Sub-components should override this to return a Node (e.g., a div, p, template content)
        // Example: return document.createElement('div').textContent = 'Hello from sub-component';
        throw new Error('Sub-components must implement the render() method.');
    }

    _renderComponent() {
        // Clear existing content in case of re-render
        while (this.shadowRoot.firstChild) {
            this.shadowRoot.removeChild(this.shadowRoot.firstChild);
        }

        const content = this.render();
        if (content instanceof Node) {
            this.shadowRoot.appendChild(content);
        } else {
            console.warn('The render() method did not return a valid Node. Nothing rendered.');
        }
    }

    attributeChangedCallback(_name, _oldValue, _newValue) {
        this._renderComponent();
    }
}
