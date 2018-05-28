export function cloneArray(array, deep) {
    var arr = [];
    if (!array) {
        return arr;
    }
    var i = array.length;
    while (i--) {
        arr[i] = deep ? cloneObject(array[i]) : array[i];
    }
    return arr;
}
export function cloneObject(object) {
    return JSON.parse(JSON.stringify(object));
}
