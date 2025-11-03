import { BaseWebComponent } from '../../base.js';
import { embellishFilename, getNavigationLink } from './linking.js';

function urlEncodeThumbnailComponent(url) {
    const x = url.split('path=')[1];
    return `/api/thumbnail?path=${encodeURIComponent(x)}`;
}

class FileCard extends BaseWebComponent {
    static observedAttributes = ['filename', 'root', 'image-src', 'file-type'];

    render(html) {
        const filename = this.getAttribute('filename') || '';
        const root = this.getAttribute('root') || '';
        const imageSrc = this.getAttribute('image-src') || '';
        const fileType = this.getAttribute('file-type') || '';

        const image = imageSrc.includes('/thumbnail')
            ? html`<img src="${urlEncodeThumbnailComponent(imageSrc)}" />`
            : html`<svg class="large-icon">
                  <use href="/static/svg/sprite_sheet.svg#${imageSrc}"></use>
              </svg>`;

        const href = getNavigationLink(root, filename, fileType);
        const displayText = embellishFilename(filename, fileType);

        return html`
            <style>
                a {
                    display: flex;
                    flex-direction: column;
                    text-decoration: none;
                    color: var(--font-color);
                    max-width: var(--file-card-max-width);
                    max-height: var(--file-card-max-height);
                }
                a > div {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-height: 0;
                    overflow: hidden;
                    margin-bottom: 0rem;
                    padding-bottom: 0rem;
                    border: 1px solid grey;
                    border-top-left-radius: 5px;
                    border-top-right-radius: 5px;
                    width: calc(100% - 2px);
                }
                img {
                    object-fit: cover;
                    width: 100%;
                    min-height: 0;
                }
                a > span {
                    border: 1px solid grey;
                    border-top: none;
                    border-bottom-left-radius: 5px;
                    border-bottom-right-radius: 5px;
                    overflow: hidden;
                    white-space: nowrap;
                    word-break: break-all;
                    text-overflow: ellipsis;
                    min-height: 1.5rem;
                    padding-left: 0.2rem;
                    padding-right: 0.2rem;
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
