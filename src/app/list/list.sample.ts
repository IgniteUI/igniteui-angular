import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {DisplayDensity, IgxDialogComponent, IgxFilterOptions, IgxListComponent} from 'igniteui-angular';
import { IgxLabelDirective } from '../../../projects/igniteui-angular/src/lib/directives/label/label.directive';
import { IgxDialogComponent as IgxDialogComponent_1 } from '../../../projects/igniteui-angular/src/lib/dialog/dialog.component';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { IgxDataLoadingTemplateDirective, IgxEmptyListTemplateDirective } from '../../../projects/igniteui-angular/src/lib/list/list.common';
import { IgxFilterDirective, IgxFilterPipe } from '../../../projects/igniteui-angular/src/lib/directives/filter/filter.directive';
import { IgxInputDirective } from '../../../projects/igniteui-angular/src/lib/directives/input/input.directive';
import { FormsModule } from '@angular/forms';
import { IgxPrefixDirective } from '../../../projects/igniteui-angular/src/lib/directives/prefix/prefix.directive';
import { IgxInputGroupComponent } from '../../../projects/igniteui-angular/src/lib/input-group/input-group.component';
import { IgxSwitchComponent } from '../../../projects/igniteui-angular/src/lib/switch/switch.component';
import { IgxAvatarComponent } from '../../../projects/igniteui-angular/src/lib/avatar/avatar.component';
import { IgxCheckboxComponent } from '../../../projects/igniteui-angular/src/lib/checkbox/checkbox.component';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { IgxRippleDirective } from '../../../projects/igniteui-angular/src/lib/directives/ripple/ripple.directive';
import { NgFor } from '@angular/common';
import { IgxCardComponent } from '../../../projects/igniteui-angular/src/lib/card/card.component';
import { IgxBadgeComponent } from '../../../projects/igniteui-angular/src/lib/badge/badge.component';
import { IgxListItemComponent } from '../../../projects/igniteui-angular/src/lib/list/list-item.component';
import { IgxListComponent as IgxListComponent_1, IgxListLineTitleDirective, IgxListActionDirective, IgxListThumbnailDirective, IgxListLineSubTitleDirective, IgxListLineDirective } from '../../../projects/igniteui-angular/src/lib/list/list.component';
import { IgxButtonGroupComponent } from '../../../projects/igniteui-angular/src/lib/buttonGroup/buttonGroup.component';

interface Employee {
    imageURL: string;
    name: string;
    position: string;
    description: string;
}

@Component({
    selector: 'app-list-sample',
    styleUrls: ['list.sample.scss'],
    templateUrl: 'list.sample.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [IgxButtonGroupComponent, IgxListComponent_1, IgxListItemComponent, IgxListLineTitleDirective, IgxBadgeComponent, IgxListActionDirective, IgxCardComponent, NgFor, IgxRippleDirective, IgxIconComponent, IgxListThumbnailDirective, IgxCheckboxComponent, IgxAvatarComponent, IgxListLineSubTitleDirective, IgxListLineDirective, IgxSwitchComponent, IgxInputGroupComponent, IgxPrefixDirective, FormsModule, IgxInputDirective, IgxFilterDirective, IgxDataLoadingTemplateDirective, IgxEmptyListTemplateDirective, IgxButtonDirective, IgxDialogComponent_1, IgxLabelDirective, IgxFilterPipe]
})
export class ListSampleComponent implements OnInit {
    @ViewChild('fruitList', { static: true })
    private fruitList: IgxListComponent;

    @ViewChild('checkbox', { static: true })
    private checkbox: any;

    @ViewChild('declarativeList', { static: true })
    private declarativeList: any;

    @ViewChild('addFruitDialog', { static: true })
    private addFruitDialog: IgxDialogComponent;

    public fruitsSearch: string;
    public search1: string;
    public search2: string;
    public options = {};
    public fruitsFilteredItemsCount = undefined;

    public density: DisplayDensity = 'comfortable';
    public displayDensities;

    public employeeItems: Employee[] = [{
        imageURL: 'assets/images/avatar/18.jpg',
        name: 'Marin Popov',
        position: 'Web designer',
        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam, vel?, consectetur adipisicing elit. Aperiam, vel?'
    }, {
        imageURL: 'assets/images/avatar/2.jpg',
        name: 'Simeon Simeonov',
        position: 'Front-end Developer',
        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam, vel?, consectetur adipisicing elit. Aperiam, vel?'
    }, {
        imageURL: 'assets/images/avatar/7.jpg',
        name: 'Stefan ivanov',
        position: 'UX Architect',
        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam, vel?, consectetur adipisicing elit. Aperiam, vel?'
    }, {
        imageURL: 'assets/images/avatar/6.jpg',
        name: 'Svilen Dimchevski',
        position: 'Graphic designer',
        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam, vel, consectetur adipisicing elit. Aperiam, vel??'
    }];
    public navItems = [{
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

    public fruits: Fruit[] = [];

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

    public get fo1() {
        const _fo = new IgxFilterOptions();
        _fo.key = ['text', 'key'];
        _fo.inputValue = this.search1;
        return _fo;
    }

    public get fo2() {
        const _fo = new IgxFilterOptions();

        _fo.items = this.declarativeList.items;
        _fo.inputValue = this.search2;

        _fo.get_value = (item: any) => item.element.textContent.trim();

        _fo.metConditionFn = (item: any) => {
            item.hidden = false;
        };

        _fo.overdueConditionFn = (item: any) => {
            item.hidden = true;
        };

        return _fo;
    }

    public get fruitsFilterOptions() {
        const fruitsFilterOpts = new IgxFilterOptions();
        fruitsFilterOpts.items = this.fruits;
        fruitsFilterOpts.key = 'name';
        fruitsFilterOpts.inputValue = this.fruitsSearch;
        return fruitsFilterOpts;
    }

    public filteringHandler = function(args) {
        args.cancel = !this.checkbox.checked;
    };

    public filteredHandler = () => { };

    public onAddFruitButtonClicked(fruitName) {
        this.addFruit(fruitName);
        this.addFruitDialog.close();
    }

    public addFruit(fruitName) {
        this.fruits.push({ id: this.fruits.length, name: fruitName });
    }

    public addFruits(fruits: string[]) {
        fruits.forEach((fruit) => {
            this.addFruit(fruit);
        });
    }

    public deleteFruit(fruitId) {
        let fruitIndex = -1;
        for (let i = 0; i < this.fruits.length; i++) {
            if (fruitId === this.fruits[i].id) {
                fruitIndex = i;
                break;
            }
        }

        this.fruits.splice(fruitIndex, 1);
    }

    public fruitsFiltered(args) {
        this.fruitsFilteredItemsCount = args.filteredItems.length;
    }

    public loadFruits() {
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
