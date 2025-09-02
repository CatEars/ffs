export function isAttributeTrue(value) {
    return (
        value !== 'false' && value !== '0' && value !== '' && value !== undefined && value !== null
    );
}
