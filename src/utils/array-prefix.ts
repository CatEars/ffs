export function isPrefix(prefix: string[], target: string[]) {
    if (prefix.length > target.length) {
        return false;
    }
    return prefix.every((el, idx) => el === target[idx]);
}
