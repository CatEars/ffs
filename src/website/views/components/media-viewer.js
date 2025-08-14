import { BaseWebComponent } from './base.js';

class MediaViewer extends BaseWebComponent {
    static get observedAttributes() {
        return ['src'];
    }

    render(html) {
        const src = this.getAttribute('src');
        if (!src) {
            return;
        }
        const mimeType = src.endsWith('mp4')
            ? 'video/mp4'
            : src.endsWith('m4v')
            ? 'video/m4v'
            : src.endsWith('png')
            ? 'image/png'
            : src.endsWith('jpg') || src.endsWith('jpeg')
            ? 'image/jpg'
            : src.endsWith('gif')
            ? 'image/gif'
            : '';

        const srcPath = `/api/file?path=${encodeURIComponent(src)}`;

        return html`<div>
            <style>
                .media-holder {
                    max-height: 90vh;
                    max-width: 90vw;
                }
            </style>
            ${mimeType.startsWith('image')
                ? html`<img class="media-holder" src=${srcPath} />`
                : html`<video controls class="col-12 media-holder">
                      <source src="${srcPath}" type="${mimeType}" />
                  </video>`}
        </div> `;
    }
}

export default MediaViewer;
