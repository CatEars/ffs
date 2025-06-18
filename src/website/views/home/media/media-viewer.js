class MediaViewer extends HTMLElement {
    static get observedAttributes() {
        return ['src'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const src = this.getAttribute('src');
        console.log('source is', src);
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
        let mediaHtml = '';
        if (mimeType.startsWith('image')) {
            mediaHtml = `<img class="media-holder" src="${srcPath}"></img>`;
        } else if (mimeType.startsWith('video')) {
            mediaHtml = `<video class="col-12 media-holder" controls>
  <source src="${srcPath}" type="${mimeType}" />
</video>`;
        } else {
            mediaHtml = `<p>Appropriate media viewer for ${src} is not available</p>`;
        }

        this.innerHTML = `<div class="col-12">
        ${mediaHtml}
        </div>`;
    }
}

customElements.define('media-viewer', MediaViewer);
