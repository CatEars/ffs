import AppHeader from './text/app-header.js';
import AppSubheader from './text/app-subheader.js';
import AppMain from './layout/app-main.js';
import AutoColumn from './layout/auto-column.js';
import BreadcrumbNav from './navigation/breadcrumb-nav.js';
import FileCard from './display/file-card.js';
import HeaderTab from './navigation/header-tab.js';
import MediaViewer from './display/media-viewer.js';
import SwitchControl from './control/switch-control.js';
import RadioControl from './control/radio-control.js';
import PaginateControl from './control/paginate-control.js';
import { loadSharedStylesheets } from './base.js';

const components = [
    ['app-header', AppHeader],
    ['app-subheader', AppSubheader],
    ['app-main', AppMain],
    ['auto-column', AutoColumn],
    ['breadcrumb-nav', BreadcrumbNav],
    ['file-card', FileCard],
    ['header-tab', HeaderTab],
    ['media-viewer', MediaViewer],
    ['switch-control', SwitchControl],
    ['radio-control', RadioControl],
    ['paginate-control', PaginateControl],
];

function register(name, Component) {
    console.log('Registering WebComponent', name);
    customElements.define(name, Component);
}

loadSharedStylesheets().then((sharedStylesheets) => {
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, ...sharedStylesheets];
    for (const [name, Component] of components) {
        register(name, Component);
    }
});
