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

function getMediaLinkTo(root, file) {
    return `/home/media/view?path=${getBaseLinkTo(root, file)}`;
}

function getHomeLinkTo(root, file) {
    return `/home/?path=${getBaseLinkTo(root, file)}`;
}

function getApiDownloadLinkTo(root, file) {
    return `/api/file?path=${getBaseLinkTo(root, file)}`;
}

function isDirectory(fileType) {
    return fileType === 'directory';
}

function isMediaFile(fileType) {
    return fileType === 'video' || fileType === 'sound' || fileType === 'image';
}

export function getNavigationLink(root, file, fileType) {
    if (isDirectory(fileType)) {
        return getHomeLinkTo(root, file);
    } else if (isMediaFile(fileType)) {
        return getMediaLinkTo(root, file);
    } else {
        return getApiDownloadLinkTo(root, file);
    }
}
