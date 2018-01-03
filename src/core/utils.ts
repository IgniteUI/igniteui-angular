
export function cloneArray(array) {
    const arr = [];
    if (!array) {
        return arr;
    }
    let i = array.length;
    while (i--) {
        arr[i] = array[i];
    }
    return arr;
}
