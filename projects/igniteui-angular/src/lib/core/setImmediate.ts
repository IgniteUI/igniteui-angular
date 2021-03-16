/* Copyright (c) 2014-2020 Denis Pushkarev
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE
 */

// Note: Originally copied from core-js-pure package and modified. (https://github.com/zloirock/core-js)

const queue = {};
let counter = 0;
let eventListenerAdded = false;

const run = (id) => {
    if (queue.hasOwnProperty(id)) {
        const fn = queue[id];
        delete queue[id];
        fn();
    }
};

const listener = (event) => run(event.data);

// Use function instead of arrow function to workaround an issue in codesandbox
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function setImmediate(cb: () => void, ...args) {
    if (window.setImmediate) {
        return window.setImmediate(cb);
    }

    if (!eventListenerAdded) {
        eventListenerAdded = true;
        window.addEventListener('message', listener, false);
    }

    queue[++counter] = () => {
        cb.apply(undefined, args);
    };

    const windowLocation = window.location;
    window.postMessage(counter + '', windowLocation.protocol + '//' + windowLocation.host);

    return counter;
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function clearImmediate(id: any) {
    if (window.clearImmediate) {
        return window.clearImmediate(id);
    }

    delete queue[id];
}
