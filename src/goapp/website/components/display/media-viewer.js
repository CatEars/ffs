import { BaseWebComponent } from '../base.js';

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
            ? 'video/mp4'
            : src.endsWith('png')
            ? 'image/png'
            : src.endsWith('jpg') || src.endsWith('jpeg')
            ? 'image/jpg'
            : src.endsWith('gif')
            ? 'image/gif'
            : '';

        const srcPath = `/api/file?path=${encodeURIComponent(src)}`;

        return html`
            <style>
                .media-holder {
                    max-height: 90vh;
                    max-width: 90vw;
                }
                div {
                    margin-top: 2rem;
                    margin-bottom: 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
            </style>
            <div>
                ${mimeType.startsWith('image')
                    ? html`<img class="media-holder" src=${srcPath} />`
                    : html`<video controls class="col-12 media-holder">
                          <source src="${srcPath}" type="${mimeType}" />
                      </video>`}
            </div>
        `;
    }
}

export default MediaViewer;
