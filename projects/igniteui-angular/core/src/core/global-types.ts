/**
 * Global type augmentations for IgniteUI Angular
 */

declare global {
    interface GlobalEventHandlersEventMap {
        'keydown.enter': KeyboardEvent;
        'keydown.escape': KeyboardEvent;
        'keydown.tab': KeyboardEvent;
        'keydown.arrowup': KeyboardEvent;
        'keydown.arrowdown': KeyboardEvent;
        'keydown.arrowleft': KeyboardEvent;
        'keydown.arrowright': KeyboardEvent;
        'keydown.shift.tab': KeyboardEvent;
        'keydown.alt.arrowup': KeyboardEvent;
        'keydown.alt.arrowdown': KeyboardEvent;
        'keydown.pageup': KeyboardEvent;
        'keydown.pagedown': KeyboardEvent;
        'keydown.home': KeyboardEvent;
        'keydown.end': KeyboardEvent;
        'keydown.space': KeyboardEvent;
        'igcChange': CustomEvent;
    }
}

// This export is needed to make this file a module
export {};