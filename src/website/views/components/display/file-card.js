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

function resolveEmojiForMediaFile(fileType) {
    if (fileType === 'sound') {
        return '🎵';
    } else if (fileType === 'image') {
        return '📷';
    } else if (fileType === 'video') {
        return '📽️';
    } else {
        return '';
    }
}

class FileCard extends BaseWebComponent {
    static observedAttributes = ['filename', 'root', 'image-src', 'file-type'];

    render(html) {
        const filename = this.getAttribute('filename') || '';
        const root = this.getAttribute('root') || '';
        const imageSrc = this.getAttribute('image-src') || '';
        const fileType = this.getAttribute('file-type') || '';

        const styling = html`
            <style>
                .clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2; /* Limit to 2 lines */
                    line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            </style>
        `;
        if (fileType === 'directory') {
            return html`${styling}
                <div class="card">
                    <a
                        class="text-decoration-none"
                        href="/home/?path=${calculatePath(root, filename)}"
                    >
                        <img height="125" class="card-img-top" src="${imageSrc}" />
                        <div class="card-body">
                            <span class="card-text clamp-2">${filename}/</span>
                        </div>
                    </a>
                </div>`;
        } else if (fileType === 'sound' || fileType === 'image' || fileType === 'video') {
            const href = `/home/media/view?path=${encodeURIComponent(root + '/' + filename)}`;
            const displayText = resolveEmojiForMediaFile(fileType) + ' ' + filename;
            return html`${styling}
                <div class="card">
                    <a class="text-decoration-none" href="${href}">
                        <img height="125" class="card-img-top" src="${imageSrc}" />
                        <div class="card-body pointer">
                            <span class="card-text clamp-2">${displayText}</span>
                        </div>
                    </a>
                </div>`;
        } else {
            return html`${styling}
                <div class="card">
                    <a
                        class="text-decoration-none"
                        href="/api/file?path=${encodeURIComponent(root + '/' + filename)}"
                        download="${filename}"
                    >
                        <img height="125" class="card-img-top" src="${imageSrc}" />
                        <div class="card-body pointer">
                            <span class="card-text clamp-2">${filename}</span>
                        </div>
                    </a>
                </div>`;
        }
    }
}

export default FileCard;
