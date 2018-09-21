namespace SassDoc {
    declare var sassdocIndex: any;
    declare var lunr: any;
    declare var hljs: any;
    declare var clickHandler: any;

    class Application {
        private idx = lunr.Index.load(sassdocIndex);
        private header: HTMLElement = <HTMLElement>document.querySelector('.header');
        private footer: HTMLElement = <HTMLElement>document.querySelector('.ui-footer');
        private sidebar: HTMLElement = <HTMLElement>document.querySelector('.nav-wrapper__nav');
        private searchInput: HTMLElement = document.getElementById('search-docs');
        private searchBox: HTMLElement = document.getElementById('search-results');

        private scrollPosition = 0;
        private updating = false;

        private sidebarHeight = this.sidebar.offsetHeight;
        private headerHeight = this.header.offsetHeight;
        private searchHeight = this.searchInput.offsetHeight;

        private renderListItems = (items, onClickHandler) => {
            return items.map(item => this.renderListItem(item, onClickHandler)).join('');
        }

        private renderListItem = (item: any, handler: Function) => {
            const arr = item.ref.split('-');
            const type = arr[0];
            const name = arr.slice(1).join('-');
            clickHandler = handler;

            return `
            <li class="search-form__results-list-item">
                <a href=#${item.ref} onclick="clickHandler()">
                    <span class="item--${type}">${type.substring(0, 3)}</span>
                    <span>${name}</span>
                </a>
            </li>
            `;
        }

        private listTemplate = items => {
            return `
            <ul class="search-form__results-list">
                ${this.renderListItems(items, this.hideSearchResults)}
            </ul>
        `;
        }

        constructor() {
            window.addEventListener('scroll', this.onScrollHandler.bind(this), false);
            this.searchInput.addEventListener('input', this.search.bind(this), false);
            this.toggle('.nav-group__header', 'click');
            hljs.initHighlightingOnLoad();
        }

        toggle(selector: string, trigger: string) {
            const items = (<Node[]><any>document.querySelectorAll(selector));

            for (const item of items) {
                const group: string = (<HTMLElement>item).dataset.toggles;
                item.addEventListener(trigger, () => this.onToggleHandler(group, <HTMLElement>item));
            }
        }

        onToggleHandler = (group: string, parent: HTMLElement) => {
            const subnav = (<Node[]><any>document.querySelectorAll(`.${group}`));

            parent.classList.toggle(`${parent.classList[0]}--collapsed`);

            for (const nav of subnav) {
                (<HTMLElement>nav).classList.toggle(`${(<HTMLElement>nav).classList[0]}--collapsed`);
            }
        }

        search(e: Event) {
            const term = (<HTMLInputElement>e.target).value;
            let result;

            if (term) {
                result = this.idx.search(`${term}~1`);
                this.renderSearchItems(this.searchBox, this.listTemplate, result);
            } else {
                this.renderSearchItems(this.searchBox, () => '', null);
                return;
            }
        }

        renderSearchItems(target: HTMLElement, template, data) {
            if (data) {
                target.innerHTML = template(data);
                this.showSearchResults();
            } else {
                this.hideSearchResults();
            }
        }

        showSearchResults = () => {
            this.searchBox.classList.remove('search-form__results--hidden');
        }

        hideSearchResults = () => {
            this.searchBox.classList.add('search-form__results--hidden');
        }

        onScrollHandler() {
            this.scrollPosition = window.scrollY;
            this.requestSidebarUpdate();
        }

        requestSidebarUpdate() {
            if (!this.updating) {
                window.requestAnimationFrame(this.updateSidebar.bind(this));
            }
            this.updating = true;
        }

        updateSidebar() {
            const proposedHeight = this.footer.offsetTop - this.scrollPosition - (this.headerHeight + this.searchHeight);

            if (this.sidebarHeight > proposedHeight) {
                this.sidebar.style.height = `${proposedHeight}px`;
            } else {
                this.sidebar.style.height = `calc(100% - ${this.headerHeight + this.searchHeight}px)`;
            }
            this.updating = false;
        }
    }

    const application = new Application();
}

