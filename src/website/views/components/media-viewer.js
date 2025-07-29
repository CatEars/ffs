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
        if (mimeType.startsWith('image')) {
            return html`<div class="col-12"><img class="media-holder" src="${srcPath}" /></div>`;
        } else if (mimeType.startsWith('video')) {
            return html`<div class="col-12">
                <video class="col-12 media-holder" controls>
                    <source src="${srcPath}" type="${mimeType}" />
                </video>
            </div>`;
        } else {
            return html`<div class="col-12">
                <p>Appropriate media viewer for ${src} is not available</p>
            </div>`;
        }
    }
}

export default MediaViewer;
