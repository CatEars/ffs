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

        const image = imageSrc.includes('/thumbnail')
            ? html`<img src="${imageSrc}" />`
            : html`<svg class="large-icon">
                  <use href="/static/svg/sprite_sheet.svg#${imageSrc}"></use>
              </svg>`;
        let href = '';
        let displayText = filename;
        if (fileType === 'directory') {
            href = `/home/?path=${calculatePath(root, filename)}`;
            displayText += '/';
        } else if (fileType === 'sound' || fileType === 'image' || fileType === 'video') {
            href = `/home/media/view?path=${encodeURIComponent(root + '/' + filename)}`;
            displayText = resolveEmojiForMediaFile(fileType) + ' ' + filename;
        } else {
            href = `/api/file?path=${encodeURIComponent(root + '/' + filename)}`;
        }
        return html`
            <style>
                a {
                    display: flex;
                    flex-direction: column;
                    text-decoration: none;
                    color: var(--font-color);
                }
                a > div {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 0rem;
                    padding-bottom: 0rem;
                    border: 1px solid grey;
                    border-top-left-radius: 5px;
                    border-top-right-radius: 5px;
                }
                a > span {
                    border: 1px solid grey;
                    border-top: none;
                    border-bottom-left-radius: 5px;
                    border-bottom-right-radius: 5px;
                    padding: 0.2rem;
                    overflow: hidden;
                    white-space: nowrap;
                    word-break: break-all;
                    text-overflow: ellipsis;
                    max-width: var(--file-card-max-size);
                }
            </style>
            <a href="${href}">
                <div>${image}</div>
                <span>${displayText}</span>
            </a>
        `;
    }
}

export default FileCard;
