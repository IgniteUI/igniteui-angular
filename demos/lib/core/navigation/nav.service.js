var IgxNavigationService = (function () {
    function IgxNavigationService() {
        this.navs = {};
    }
    IgxNavigationService.prototype.add = function (id, navItem) {
        this.navs[id] = navItem;
    };
    IgxNavigationService.prototype.remove = function (id) {
        delete this.navs[id];
    };
    IgxNavigationService.prototype.get = function (id) {
        if (id) {
            return this.navs[id];
        }
    };
    IgxNavigationService.prototype.toggle = function (id, fireEvents) {
        if (this.navs[id]) {
            return this.navs[id].toggle(fireEvents);
        }
    };
    IgxNavigationService.prototype.open = function (id, fireEvents) {
        if (this.navs[id]) {
            return this.navs[id].open(fireEvents);
        }
    };
    IgxNavigationService.prototype.close = function (id, fireEvents) {
        if (this.navs[id]) {
            return this.navs[id].close(fireEvents);
        }
    };
    return IgxNavigationService;
}());
export { IgxNavigationService };
