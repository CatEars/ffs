import { BaseWebComponent } from '../base.js';

function calculatePath(root, fileName) {
    if (fileName === '..') {
        const lastIndex = root.lastIndexOf('/');
        if (lastIndex === -1) {
            return root;
        }
        return root.substring(0, lastIndex);
    } else {
        return encodeURIComponent(`${root}/${fileName}`);
    }
}

function getBaseLinkTo(root, file) {
    return calculatePath(root, file);
}

function getMediaLinkTo(root, file) {
    return `/home/media/view?path=${getBaseLinkTo(root, file)}`;
}

function getHomeLinkTo(root, file) {
    return `/home/?path=${getBaseLinkTo(root, file)}`;
}

class FileLink extends BaseWebComponent {
    static observedAttributes = ['filename', 'root', 'file-type'];
    render(html) {
        const filename = this.getAttribute('filename') || '';
        const fileType = this.getAttribute('file-type') || '';
        const root = this.getAttribute('root') || '';
        console.log('FILE', fileType);
        if (fileType === 'directory') {
            return html`
                <a href=${getHomeLinkTo(root, filename)}>
                    <span>${filename}</span>
                </a>
            `;
        } else if (fileType === 'sound' || fileType === 'image' || fileType === 'video') {
            return html`
                <a href=${getMediaLinkTo(root, filename)}>
                    <span>${filename}</span>
                </a>
            `;
        } else {
            return html`<span>${filename}</span>`;
        }
    }
}

export default FileLink;
