var BaseComponent = (function () {
    function BaseComponent(renderer) {
        this.renderer = renderer;
    }
    BaseComponent.prototype.getChild = function (selector) {
        try {
            if (this.id) {
                selector = "#" + this.id + " " + selector;
            }
            return document.querySelector(selector);
        }
        catch (error) {
            return null;
        }
    };
    return BaseComponent;
}());
export { BaseComponent };
