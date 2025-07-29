import { BaseWebComponent } from './base.js';
import FullColumn from './layout/FullColumn.js';

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
            return html`<${FullColumn}><img class="media-holder" src="${srcPath}" /></${FullColumn}>`;
        } else if (mimeType.startsWith('video')) {
            return html`<${FullColumn}>
                <video class="col-12 media-holder" controls>
                    <source src="${srcPath}" type="${mimeType}" />
                </video>
            </${FullColumn}>`;
        } else {
            return html`<${FullColumn}>
                <p>Appropriate media viewer for ${src} is not available</p>
            </${FullColumn}>`;
        }
    }
}

export default MediaViewer;
