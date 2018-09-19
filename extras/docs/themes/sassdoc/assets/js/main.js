(function () {
    const idx = lunr.Index.load(sassdocIndex);
    const searchBox = document.getElementById('search-results');
    const searchInput = document.getElementById('search-docs');
    const footer = document.querySelector('.ui-footer');
    const sidebar = document.querySelector('.nav-wrapper__nav');
    const sidebarHeight = sidebar.offsetHeight;
    const headerHeight = document.querySelector('.header').offsetHeight;
    const searchHeight = searchInput.offsetHeight;
    let scrollPosition = 0;
    let updating = false;

    const renderListItem = (items, onClickHandler) => {
        hideMenu = onClickHandler;
        return items.map(item => {
            const arr = item.ref.split('-');
            const type = arr[0];
            const name = arr.slice(1).join('-');

            return `
            <li class="search-form__results-list-item">
                <a href=#${item.ref} onclick="hideMenu()">
                    <span class="item--${type}">${type.substring(0, 3)}</span>
                    <span>${name}</span>
                </a>
            </li>
        `;
        }).join('');
    };

    const listTemplate = items => {
        return `
            <ul class="search-form__results-list">
                ${renderListItem(items, this.hideSearchResults)}
            </ul>
        `;
    };


    init = () => {
        searchInput.addEventListener('input', this.search);
        this.toggle('.nav-group__header', 'click');
        this.adjustSidebarHeight();
        hljs.initHighlightingOnLoad();
    }

    search = (e) => {
        const term = e.target.value;
        let result = '';
        if (term) {
            result = idx.search(`${term}~1`)
            this.renderSearchItems(searchBox, listTemplate, result);
        } else {
            this.renderSearchItems(searchBox, () => '', null);
            return;
        }

    }

    renderSearchItems = (target, template, data) => {
        if (data) {
            target.innerHTML = template(data);
            this.showSearchResults();
        } else {
            this.hideSearchResults();
        }
    }

    showSearchResults = () => {
        searchBox.classList.remove('search-form__results--hidden');
    }

    hideSearchResults = () => {
        searchBox.classList.add('search-form__results--hidden');
    }

    toggle = (el, trigger) => {
        document.querySelectorAll(el).forEach(item => {
            const group = item.dataset.toggles;
            item.addEventListener(trigger, () => this.onToggleHandler(group, item));
        });
    }

    onToggleHandler = (group, parent) => {
        const subnav = document.querySelectorAll(`.${group}`);

        parent.classList.toggle(`${parent.classList[0]}--collapsed`);
        subnav.forEach(nav => {
            nav.classList.toggle(`${nav.classList[0]}--collapsed`);
        });
    }

    adjustSidebarHeight = () => {
        window.addEventListener('scroll', this.onScrollHandler, false);
    }

    onScrollHandler = () => {
        scrollPosition = window.scrollY;
        this.requestSidebarUpdate();
    }

    requestSidebarUpdate = () => {
        if (!updating) {
            window.requestAnimationFrame(this.updateSidebar);
        }
        updating = true;
    }

    updateSidebar = () => {
        const proposedHeight = footer.offsetTop - scrollPosition - (headerHeight + searchHeight);

        if (sidebarHeight > proposedHeight) {
            sidebar.style.height = `${proposedHeight}px`;
        } else {
            sidebar.style.height = `calc(100% - ${headerHeight + searchHeight}px)`;
        }
        updating = false;
    }

    this.init();
})();