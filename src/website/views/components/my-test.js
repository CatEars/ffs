import { BaseWebComponent } from './base.js';
import { h, render } from 'https://esm.sh/preact';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

class MyTestComponent extends BaseWebComponent {
    constructor() {
        super();
    }

    render() {
        const x = document.createElement('div');
        render(
            html`<div class="container">
                <div class="row row-cols-2">
                    <div class="col"><p>first</p></div>
                    <div class="col"><slot></slot></div>
                </div>
            </div>`,
            x
        );
        return x;
    }
}

customElements.define('my-test', MyTestComponent);
