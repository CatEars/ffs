import { BaseWebComponent } from '../base.js';
import ImageWithFallback from './ImageWithFallback.js';

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

function isSoundFile(file) {
    return file.endsWith('.mp3');
}

function isImageFile(file) {
    return ['.png', '.jpg', '.jpeg', '.gif'].some((x) => file.endsWith(x));
}

function isMovieFile(file) {
    return ['.mp4', '.m4v'].some((x) => file.endsWith(x));
}

function isMediaFile(file) {
    return isSoundFile(file) || isImageFile(file) || isMovieFile(file);
}

function resolveEmojiForMediaFile(file) {
    if (isSoundFile(file)) {
        return '🎵';
    } else if (isImageFile(file)) {
        return '📷';
    } else if (isMovieFile(file)) {
        return '📽️';
    }
}

function resolveSvgLocationForFile(filename) {
    if (isSoundFile(filename)) {
        return '/static/svg/music_note.svg';
    } else if (isImageFile(filename)) {
        return '/static/svg/photo_camera.svg';
    } else if (isMovieFile(filename)) {
        return '/static/svg/videocam.svg';
    } else {
        return '/static/svg/description.svg';
    }
}

class FileCard extends BaseWebComponent {
    static observedAttributes = ['is-directory', 'filename', 'root'];

    render(html) {
        const isDirectory = !!this.getAttribute('is-directory');
        const filename = this.getAttribute('filename') || '';
        const root = this.getAttribute('root') || '';
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
        if (isDirectory) {
            return html`${styling}
                <div class="card">
                    <a
                        class="text-decoration-none"
                        href="/home/?path=${calculatePath(root, filename)}"
                    >
                        <img height="125" class="card-img-top" src="/static/svg/folder.svg" />
                        <div class="card-body">
                            <span class="card-text clamp-2">${filename}/</span>
                        </div>
                    </a>
                </div>`;
        } else if (isMediaFile(filename)) {
            console.log(
                'medaifile',
                filename,
                resolveSvgLocationForFile(filename),
                root,
                resolveEmojiForMediaFile(filename)
            );
            const href = `/home/media/view?path=${encodeURIComponent(root + '/' + filename)}`;
            const imgSrc = resolveSvgLocationForFile(filename);
            const displayText = resolveEmojiForMediaFile(filename) + ' ' + filename;
            return html`${styling}
                <div class="card">
                    <a class="text-decoration-none" href="${href}">
                        <${ImageWithFallback} height="125" class="card-img-top" fallbackSrc="${imgSrc}" actualSrc=""></${ImageWithFallback}>
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
                        <img height="125" class="card-img-top" src="/static/svg/description.svg" />
                        <div class="card-body pointer">
                            <span class="card-text clamp-2">${filename}</span>
                        </div>
                    </a>
                </div>`;
        }
    }
}

export default FileCard;
