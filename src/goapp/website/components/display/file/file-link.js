import { BaseWebComponent } from '../../base.js';
import { getNavigationLink } from './linking.js';

class FileLink extends BaseWebComponent {
    static observedAttributes = ['filename', 'root', 'file-type'];
    render(html) {
        const filename = this.getAttribute('filename') || '';
        const fileType = this.getAttribute('file-type') || '';
        const root = this.getAttribute('root') || '';
        return html`
            <a href=${getNavigationLink(root, filename, fileType)}>
                <span>${filename}</span>
            </a>
        `;
    }
}

export default FileLink;
