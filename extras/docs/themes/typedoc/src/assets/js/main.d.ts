declare module typedoc {
    class Events extends Backbone.Events {
    }
}
declare module typedoc {
    var $html: JQuery;
    interface IService {
        constructor: any;
        name: string;
        instance: any;
        priority: number;
    }
    interface IComponent {
        constructor: any;
        selector: string;
        priority: number;
        namespace: string;
    }
    var $document: JQuery;
    var $window: JQuery;
    var $body: JQuery;
    function registerService(constructor: any, name: string, priority?: number): void;
    function registerComponent(constructor: any, selector: string, priority?: number, namespace?: string): void;
    class Application extends Events {
        constructor();
        private createServices();
        createComponents($context: JQuery, namespace?: string): Backbone.View<any>[];
    }
}
declare module typedoc {
}
declare module typedoc {
    class MenuHighlight extends Backbone.View<any> {
        private anchors;
        private index;
        constructor(options: Backbone.ViewOptions<any>);
        private createAnchors();
        private onResize();
        private onScroll(scrollTop);
    }
}
declare module typedoc {
    class MenuSticky extends Backbone.View<any> {
        private $current;
        private $navigation;
        private $container;
        private state;
        private stickyMode;
        private stickyTop;
        private stickyBottom;
        constructor(options: Backbone.ViewOptions<any>);
        private setState(state);
        private onResize(width, height);
        private onScroll(scrollTop);
    }
}
declare module typedoc.search {
    interface IDocument {
        id: number;
        kind: number;
        name: string;
        url: string;
        classes: string;
        parent?: string;
    }
    interface IData {
        kinds: {
            [kind: number]: string;
        };
        rows: IDocument[];
    }
    var data: IData;
}
declare module typedoc.search {
}
declare module typedoc {
}
declare module typedoc {
}
declare module typedoc {
    class Viewport extends Events {
        scrollTop: number;
        width: number;
        height: number;
        constructor();
        triggerResize(): void;
        onResize(): void;
        onScroll(): void;
    }
    var viewport: Viewport;
}
declare module typedoc {
    interface Point {
        x: number;
        y: number;
    }
    var pointerDown: string;
    var pointerMove: string;
    var pointerUp: string;
    var pointerDownPosition: Point;
    var preventNextClick: boolean;
    var isPointerDown: boolean;
    var isPointerTouch: boolean;
    var hasPointerMoved: boolean;
    var isMobile: boolean;
}
declare module typedoc {
    var transition: {
        name: string;
        endEvent: any;
    };
    function noTransition($el: any, callback: any): void;
    function animateHeight($el: JQuery, callback: Function, success?: Function): void;
}
declare module typedoc {
    var app: Application;
}
