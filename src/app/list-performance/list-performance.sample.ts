import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IGX_INPUT_GROUP_DIRECTIVES, IGX_LIST_DIRECTIVES, IgxAvatarComponent, IgxButtonDirective, IgxCardComponent, IgxFilterOptions, IgxFilterPipe, IgxForOfDirective, IgxIconComponent, IgxRippleDirective } from 'igniteui-angular';



@Component({
    selector: 'app-list-performance-sample',
    styleUrls: ['list-performance.sample.scss'],
    templateUrl: 'list-performance.sample.html',
    imports: [IgxIconComponent, FormsModule, NgIf, IgxButtonDirective, IgxCardComponent, IgxForOfDirective, IgxRippleDirective, IgxAvatarComponent, IgxFilterPipe, IGX_LIST_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES]
})
export class ListPerformanceSampleComponent {
    public search1: string;
    public options = {};
    public showList = true;

    public data = [{
        key: 1,
        avatar: 'assets/images/avatar/1.jpg',
        favorite: true,
        link: '#',
        phone: '770-504-2217',
        text: 'Terrance Orta'
    }, {
        key: 2,
        avatar: 'assets/images/avatar/2.jpg',
        favorite: false,
        link: '#',
        phone: '423-676-2869',
        text: 'Richard Mahoney'
    }, {
        key: 3,
        avatar: 'assets/images/avatar/3.jpg',
        favorite: false,
        link: '#',
        phone: '859-496-2817',
        text: 'Donna Price'
    }, {
        key: 4,
        avatar: 'assets/images/avatar/4.jpg',
        favorite: false,
        link: '#',
        phone: '901-747-3428',
        text: 'Lisa Landers'
    }, {
        key: 5,
        avatar: 'assets/images/avatar/12.jpg',
        favorite: true,
        link: '#',
        phone: '573-394-9254',
        text: 'Dorothy H. Spencer'
    }, {
        key: 6,
        avatar: 'assets/images/avatar/13.jpg',
        favorite: false,
        link: '#',
        phone: '323-668-1482',
        text: 'Stephanie May'
    }, {
        key: 7,
        avatar: 'assets/images/avatar/14.jpg',
        favorite: false,
        link: '#',
        phone: '401-661-3742',
        text: 'Marianne Taylor'
    }, {
        key: 8,
        avatar: 'assets/images/avatar/15.jpg',
        favorite: true,
        link: '#',
        phone: '662-374-2920',
        text: 'Tammie Alvarez'
    }, {
        key: 9,
        avatar: 'assets/images/avatar/16.jpg',
        favorite: true,
        link: '#',
        phone: '240-455-2267',
        text: 'Charlotte Flores'
    }, {
        key: 10,
        avatar: 'assets/images/avatar/17.jpg',
        favorite: false,
        link: '#',
        phone: '724-742-0979',
        text: 'Ward Riley'
    }];

    public get fo1() {
        const _fo = new IgxFilterOptions();
        _fo.key = 'text';
        _fo.inputValue = this.search1;
        return _fo;
    }

    constructor() {
        for (let i = 10; i < 1e5; i++) {
            const obj = Object.assign({}, this.data[i % 10]);
            obj['key'] = i;
            this.data.push(obj);
        }
    }
}
