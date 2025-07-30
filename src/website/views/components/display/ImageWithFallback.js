import { html } from '../base.js';

function ImageWithFallback(props) {
    const fallback = props.fallbackSrc;
    const actualSrc = props.actualSrc;
    const height = props.height;
    const $class = props.class;
    // useEffect(() => getActualSrc(actualSrc))
    return html`<img height="${height}" class="${$class}" src=${fallback} />`;
}

export default ImageWithFallback;
