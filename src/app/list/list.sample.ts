import { Component, ElementRef, ViewChild } from '@angular/core';
import { IgxDialogComponent, IgxFilterOptions } from 'igniteui-angular';

@Component({
    selector: 'app-list-sample',
    styleUrls: ['list.sample.css'],
    templateUrl: 'list.sample.html'
})
export class ListSampleComponent {
    @ViewChild('checkbox') public checkbox: any;
    @ViewChild('declarativeList') public declarativeList: any;
    @ViewChild('addFruitDialog') public addFruitDialog: IgxDialogComponent;

    public fruitsSearch: string;
    public search1: string;
    public search2: string;
    public options: object = {};
    public fruitsFilteredItemsCount = undefined;

    private navItems: object[] = [{
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

    private fruits: Fruit[] = [];

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

    private filteringHandler = function(args) {
        args.cancel = !this.checkbox.checked;
    };

    private filteredHandler = (args) => { };

    private onAddFruitButtonClicked(fruitName) {
        this.fruits.push({ id: this.fruits.length, name: fruitName });
        this.addFruitDialog.close();
    }

    private deleteFruit(fruitId) {
        let fruitIndex = -1;
        for (let i = 0; i < this.fruits.length; i++) {
            if (fruitId === this.fruits[i].id) {
                fruitIndex = i;
                break;
            }
        }

        this.fruits.splice(fruitIndex, 1);
    }

    private fruitsFiltered(args) {
        this.fruitsFilteredItemsCount = args.filteredItems.length;
    }
}

export interface Fruit {
    id: number;
    name: string;
}
