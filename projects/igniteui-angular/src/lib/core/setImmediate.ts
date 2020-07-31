const windowLocation = window.location;
let counter = 0;
const queue = {};

const run = function (id) {
    if (queue.hasOwnProperty(id)) {
        const fn = queue[id];
        delete queue[id];
        fn();
    }
};

const listener = function (event) {
    run(event.data);
};

export function setImmediate(cb: any) {
    if (window.setImmediate) {
        window.setImmediate(cb);
        return;
    }

    const args = [];
    let i = 1;

    while (arguments.length > i) {
        args.push(arguments[i++]);
    }

    queue[++counter] = function () {
        (typeof cb === 'function' ? cb : Function(cb)).apply(undefined, args);
    };

    window.postMessage(counter + '', windowLocation.protocol + '//' + windowLocation.host);
    window.addEventListener('message', listener, false);

    return counter;
}


    // clear = function clearImmediate(id) {
    //     delete queue[id];
    // };
