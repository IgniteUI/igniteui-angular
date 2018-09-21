var SassDoc;
(function (SassDoc) {
    var Application = (function () {
        function Application() {
            var _this = this;
            this.idx = lunr.Index.load(sassdocIndex);
            this.header = document.querySelector('.header');
            this.footer = document.querySelector('.ui-footer');
            this.sidebar = document.querySelector('.nav-wrapper__nav');
            this.searchInput = document.getElementById('search-docs');
            this.searchBox = document.getElementById('search-results');
            this.scrollPosition = 0;
            this.updating = false;
            this.sidebarHeight = this.sidebar.offsetHeight;
            this.headerHeight = this.header.offsetHeight;
            this.searchHeight = this.searchInput.offsetHeight;
            this.renderListItems = function (items, onClickHandler) {
                return items.map(function (item) { return _this.renderListItem(item, onClickHandler); }).join('');
            };
            this.renderListItem = function (item, handler) {
                var arr = item.ref.split('-');
                var type = arr[0];
                var name = arr.slice(1).join('-');
                clickHandler = handler;
                return "\n            <li class=\"search-form__results-list-item\">\n                <a href=#" + item.ref + " onclick=\"clickHandler()\">\n                    <span class=\"item--" + type + "\">" + type.substring(0, 3) + "</span>\n                    <span>" + name + "</span>\n                </a>\n            </li>\n            ";
            };
            this.listTemplate = function (items) {
                return "\n            <ul class=\"search-form__results-list\">\n                " + _this.renderListItems(items, _this.hideSearchResults) + "\n            </ul>\n        ";
            };
            this.onToggleHandler = function (group, parent) {
                var subnav = document.querySelectorAll("." + group);
                parent.classList.toggle(parent.classList[0] + "--collapsed");
                for (var _i = 0, subnav_1 = subnav; _i < subnav_1.length; _i++) {
                    var nav = subnav_1[_i];
                    nav.classList.toggle(nav.classList[0] + "--collapsed");
                }
            };
            this.showSearchResults = function () {
                _this.searchBox.classList.remove('search-form__results--hidden');
            };
            this.hideSearchResults = function () {
                _this.searchBox.classList.add('search-form__results--hidden');
            };
            window.addEventListener('scroll', this.onScrollHandler.bind(this), false);
            this.searchInput.addEventListener('input', this.search.bind(this), false);
            this.toggle('.nav-group__header', 'click');
            hljs.initHighlightingOnLoad();
        }
        Application.prototype.toggle = function (selector, trigger) {
            var _this = this;
            var items = document.querySelectorAll(selector);
            var _loop_1 = function (item) {
                var group = item.dataset.toggles;
                item.addEventListener(trigger, function () { return _this.onToggleHandler(group, item); });
            };
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var item = items_1[_i];
                _loop_1(item);
            }
        };
        Application.prototype.search = function (e) {
            var term = e.target.value;
            var result;
            if (term) {
                result = this.idx.search(term + "~1");
                this.renderSearchItems(this.searchBox, this.listTemplate, result);
            }
            else {
                this.renderSearchItems(this.searchBox, function () { return ''; }, null);
                return;
            }
        };
        Application.prototype.renderSearchItems = function (target, template, data) {
            if (data) {
                target.innerHTML = template(data);
                this.showSearchResults();
            }
            else {
                this.hideSearchResults();
            }
        };
        Application.prototype.onScrollHandler = function () {
            this.scrollPosition = window.scrollY;
            this.requestSidebarUpdate();
        };
        Application.prototype.requestSidebarUpdate = function () {
            if (!this.updating) {
                window.requestAnimationFrame(this.updateSidebar.bind(this));
            }
            this.updating = true;
        };
        Application.prototype.updateSidebar = function () {
            var proposedHeight = this.footer.offsetTop - this.scrollPosition - (this.headerHeight + this.searchHeight);
            if (this.sidebarHeight > proposedHeight) {
                this.sidebar.style.height = proposedHeight + "px";
            }
            else {
                this.sidebar.style.height = "calc(100% - " + (this.headerHeight + this.searchHeight) + "px)";
            }
            this.updating = false;
        };
        return Application;
    }());
    var application = new Application();
})(SassDoc || (SassDoc = {}));
