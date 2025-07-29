import AppHeader from './text/app-header.js';
import AppSubheader from './text/app-subheader.js';
import AppMain from './layout/app-main.js';
import MediaViewer from './media-viewer.js';
import SortRadio from './sort-radio.js';
import PaginateControl from './paginate-control.js';

const components = [
    ['app-header', AppHeader],
    ['app-subheader', AppSubheader],
    ['app-main', AppMain],
    ['media-viewer', MediaViewer],
    ['sort-radio', SortRadio],
    ['paginate-control', PaginateControl],
];

function register(name, Component) {
    console.log('Registering WebComponent', name);
    customElements.define(name, Component);
}

for (const [name, Component] of components) {
    register(name, Component);
}
