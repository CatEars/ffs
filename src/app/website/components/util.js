export function isAttributeTrue(value) {
    return (
        value !== 'false' && value !== '0' && value !== '' && value !== undefined && value !== null
    );
}

export function getCookie(name) {
    if (cookieStore) {
        return cookieStore.get(name);
    } else {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
    }
}
