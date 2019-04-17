import { Component, ViewChild, OnInit } from '@angular/core';
import { IgxDialogComponent, IgxFilterOptions, IgxListComponent } from 'igniteui-angular';

@Component({
    selector: 'app-list-sample',
    styleUrls: ['list.sample.css'],
    templateUrl: 'list.sample.html'
})
export class ListSampleComponent implements OnInit {
    @ViewChild('contactsList')
    contactsList: IgxListComponent;

    @ViewChild('fruitList')
    fruitList: IgxListComponent;

    @ViewChild('checkbox')
    checkbox: any;

    @ViewChild('declarativeList')
    declarativeList: any;

    @ViewChild('addFruitDialog')
    addFruitDialog: IgxDialogComponent;

    fruitsSearch: string;
    search1: string;
    search2: string;
    options: object = {};
    fruitsFilteredItemsCount = undefined;
    
    density = 'comfortable';
    displayDensities;

    navItems: object[] = [{
        avatar: 'assets/images/avatar/1.jpg',
        favorite: true,
        key: '1',
        link: '#',
        phone: '770-504-2217',
        text: 'Terrance Orta'
    }, {
        avatar: 'assets/images/avatar/2.jpg',
        favorite: false,
        key: '2',
        link: '#',
        phone: '423-676-2869',
        text: 'Richard Mahoney'
    }, {
        avatar: 'assets/images/avatar/3.jpg',
        favorite: false,
        key: '3',
        link: '#',
        phone: '859-496-2817',
        text: 'Donna Price'
    }, {
        avatar: 'assets/images/avatar/4.jpg',
        favorite: false,
        key: '4',
        link: '#',
        phone: '901-747-3428',
        text: 'Lisa Landers'
    }, {
        avatar: 'assets/images/avatar/12.jpg',
        favorite: true,
        key: '5',
        link: '#',
        phone: '573-394-9254',
        text: 'Dorothy H. Spencer'
    }, {
        avatar: 'assets/images/avatar/13.jpg',
        favorite: false,
        key: '6',
        link: '#',
        phone: '323-668-1482',
        text: 'Stephanie May'
    }, {
        avatar: 'assets/images/avatar/14.jpg',
        favorite: false,
        key: '7',
        link: '#',
        phone: '401-661-3742',
        text: 'Marianne Taylor'
    }, {
        avatar: 'assets/images/avatar/15.jpg',
        favorite: true,
        key: '8',
        link: '#',
        phone: '662-374-2920',
        text: 'Tammie Alvarez'
    }, {
        avatar: 'assets/images/avatar/16.jpg',
        favorite: true,
        key: '9',
        link: '#',
        phone: '240-455-2267',
        text: 'Charlotte Flores'
    }, {
        avatar: 'assets/images/avatar/17.jpg',
        favorite: false,
        key: '10',
        link: '#',
        phone: '724-742-0979',
        text: 'Ward Riley'
    }];

    fruits: Fruit[] = [];

    public ngOnInit(): void {
        this.displayDensities = [
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'compact', selected: this.density === 'compact', togglable: true }
        ];
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }

    get fo1() {
        const _fo = new IgxFilterOptions();
        _fo.key = 'text';
        _fo.inputValue = this.search1;
        return _fo;
    }

    get fo2() {
        const _fo = new IgxFilterOptions();

        _fo.items = this.declarativeList.items;
        _fo.inputValue = this.search2;

        _fo.get_value = (item: any) => {
            return item.element.nativeElement.textContent.trim();
        };

        _fo.metConditionFn = (item: any) => {
            item.hidden = false;
        };

        _fo.overdueConditionFn = (item: any) => {
            item.hidden = true;
        };

        return _fo;
    }

    get fruitsFilterOptions() {
        const fruitsFilterOpts = new IgxFilterOptions();
        fruitsFilterOpts.items = this.fruits;
        fruitsFilterOpts.key = 'name';
        fruitsFilterOpts.inputValue = this.fruitsSearch;
        return fruitsFilterOpts;
    }

    filteringHandler = function(args) {
        args.cancel = !this.checkbox.checked;
    };

    filteredHandler = (args) => { };

    onAddFruitButtonClicked(fruitName) {
        this.addFruit(fruitName);
        this.addFruitDialog.close();
    }

    addFruit(fruitName) {
        this.fruits.push({ id: this.fruits.length, name: fruitName });
    }

    addFruits(fruits: string[]) {
        fruits.forEach((fruit) => {
            this.addFruit(fruit);
        });
    }

    deleteFruit(fruitId) {
        let fruitIndex = -1;
        for (let i = 0; i < this.fruits.length; i++) {
            if (fruitId === this.fruits[i].id) {
                fruitIndex = i;
                break;
            }
        }

        this.fruits.splice(fruitIndex, 1);
    }

    fruitsFiltered(args) {
        this.fruitsFilteredItemsCount = args.filteredItems.length;
    }

    loadFruits() {
        this.fruitList.isLoading = true;
        setTimeout(() => {
            this.addFruits([
                'banana',
                'orange',
                'apple',
                'kiwi',
                'mango',
                'strawberry',
                'pear'
            ]);
            this.fruitList.isLoading = false;
        }, 1000);
    }

    public toggleFavorite(contact: any) {
        contact.favorite = !contact.favorite;
    }
}

export interface Fruit {
    id: number;
    name: string;
}
