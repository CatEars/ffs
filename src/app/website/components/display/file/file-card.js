import { BaseWebComponent } from '../../base.js';
import { embellishFilename, getNavigationLink } from './linking.js';

class FileCard extends BaseWebComponent {
    static observedAttributes = ['filename', 'root', 'image-src', 'file-type', 'svg-icon-name'];

    constructor() {
        super();
        this.imageRenderingStarted = false;
    }

    render(html) {
        const filename = this.getAttribute('filename') || '';
        const root = this.getAttribute('root') || '';
        const fileType = this.getAttribute('file-type') || '';
        const iconName = this.getAttribute('svg-icon-name') || '';
        const image = html`<svg class="large-icon">
            <use href="/static/svg/sprite_sheet.svg#${iconName}"></use>
        </svg>`;

        const href = getNavigationLink(root, filename, fileType);
        const displayText = embellishFilename(filename, fileType);

        return html`
            <style>
                a {
                    display: flex;
                    flex-grow: 1;
                    flex-direction: column;
                    text-decoration: none;
                    color: var(--font-color);
                    height: var(--file-card-max-height);
                    max-height: var(--file-card-max-height);
                }
                a > div {
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                    align-items: center;
                    justify-content: center;
                    min-height: 0;
                    overflow: hidden;
                    margin-bottom: 0rem;
                    padding-bottom: 0rem;
                    border: 1px solid grey;
                    border-top-left-radius: 5px;
                    border-top-right-radius: 5px;
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
                    flex-grow: 0;
                }
                div.loaded > svg {
                    display: none;
                }
            </style>
            <a href="${href}">
                <div class="image-container">${image}</div>
                <span>${displayText}</span>
            </a>
        `;
    }

    postRender(_html) {
        const imageSrc = this.getAttribute('image-src') || '';
        const container = this.shadowRoot.querySelector('.image-container');
        const hasImage = this.imageRenderingStarted;
        if (imageSrc && !hasImage) {
            this.imageRenderingStarted = true;
            const img = new Image();
            img.src = imageSrc;
            img.fetchPriority = 'low';
            img.onload = () => {
                container.appendChild(img);
                container.classList.add('loaded');
            };
        }
    }
}

export default FileCard;
