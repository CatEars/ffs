function getBaseLinkTo(root, fileName) {
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

function getMediaLinkTo(root, filename) {
    return `/home/media/view?path=${getBaseLinkTo(root, filename)}`;
}

function getHomeLinkTo(root, filename) {
    return `/home/?path=${getBaseLinkTo(root, filename)}`;
}

function getApiDownloadLinkTo(root, filename) {
    return `/api/file?path=${getBaseLinkTo(root, filename)}`;
}

function isDirectory(fileType) {
    return fileType === 'directory';
}

function isMediaFile(fileType) {
    return fileType === 'video' || fileType === 'sound' || fileType === 'image';
}

export function getNavigationLink(root, filename, fileType) {
    if (isDirectory(fileType)) {
        return getHomeLinkTo(root, filename);
    } else if (isMediaFile(fileType)) {
        return getMediaLinkTo(root, filename);
    } else {
        return getApiDownloadLinkTo(root, filename);
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

export function embellishFilename(filename, fileType) {
    if (isDirectory(fileType)) {
        return `${filename}/`;
    } else if (isMediaFile(fileType)) {
        const emoji = resolveEmojiForMediaFile(fileType);
        return `${emoji} ${filename}`;
    } else {
        return filename;
    }
}
