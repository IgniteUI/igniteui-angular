const windowLocation = window.location;
let counter = 0;
const queue = {};
let set: (fn: any) => void;
let clear: (id: any) => void;

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

if (!window.setImmediate) {
    set = function setImm(fn) {
        const args = [];
        let i = 1;

        while (arguments.length > i) {
            args.push(arguments[i++]);
        }

        queue[++counter] = function () {
            (typeof fn === 'function' ? fn : Function(fn)).apply(undefined, args);
        };

        window.postMessage(counter + '', windowLocation.protocol + '//' + windowLocation.host);
        window.addEventListener('message', listener, false);
        debugger
        return counter;
    };
    clear = function clearImmediate(id) {
        delete queue[id];
    };
}

const _ = {
    set,
    clear
};

export default _;
