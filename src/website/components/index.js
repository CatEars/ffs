import { loadSharedStylesheets } from './base.js';
import AppHeader from './text/app-header.js';
import AppMain from './layout/app-main.js';
import AppSubheader from './text/app-subheader.js';
import BreadcrumbNav from './navigation/breadcrumb-nav.js';
import CliCommand from './display/cli-command.js';
import ColumnLayout from './layout/column-layout.js';
import DropDown from './display/drop-down.js';
import FileCard from './display/file/file-card.js';
import GappedRow from './layout/gapped-row.js';
import HeaderTab from './navigation/header-tab.js';
import HorizontalRuler from './layout/horizontal-ruler.js';
import IconHover from './display/icon-hover.js';
import LogDropDown from './display/log-drop-down.js';
import MediaViewer from './display/media-viewer.js';
import PaginateControl from './control/paginate-control.js';
import RadioControl from './control/radio-control.js';
import RowLayout from './layout/row-layout.js';
import SwitchControl from './control/switch-control.js';
import FileLink from './display/file/file-link.js';

const components = [
    ['app-header', AppHeader],
    ['app-main', AppMain],
    ['app-subheader', AppSubheader],
    ['breadcrumb-nav', BreadcrumbNav],
    ['cli-command', CliCommand],
    ['column-layout', ColumnLayout],
    ['drop-down', DropDown],
    ['file-card', FileCard],
    ['file-link', FileLink],
    ['gapped-row', GappedRow],
    ['header-tab', HeaderTab],
    ['horizontal-ruler', HorizontalRuler],
    ['icon-hover', IconHover],
    ['log-drop-down', LogDropDown],
    ['media-viewer', MediaViewer],
    ['paginate-control', PaginateControl],
    ['radio-control', RadioControl],
    ['row-layout', RowLayout],
    ['switch-control', SwitchControl],
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
