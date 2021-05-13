import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { IgxToastComponent } from 'igniteui-angular';

@Component({
    selector: 'app-list-panning-sample',
    styleUrls: ['list-panning.sample.css'],
    templateUrl: 'list-panning.sample.html',
    encapsulation: ViewEncapsulation.None
})
export class ListPanningSampleComponent {
    @ViewChild('toast', { static: true })
    private toast: IgxToastComponent;

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

    public navItems2;

    constructor() {
        this.navItems2 = Object.assign([], this.navItems);
    }

    public toggleFavorite(contact: any) {
        contact.favorite = !contact.favorite;
    }

    public onLeftPanHandler(args) {
        args.keepItem = true;
        this.toast.open('Composing message...');
    }

    public onRightPanHandler(args) {
        args.keepItem = true;
        this.toast.open('Dialing...');
    }

    public onLeftPanHandler2(args) {
        args.keepItem = true;
        this.toast.open('Edit contact.');
    }

    public onRightPanHandler2(args) {
        args.keepItem = false;
        setTimeout((idx = args.item.index - 1) => {
            this.toast.open('Contact removed.');
            this.navItems2.splice(idx, 1);
        }, 500);
    }

    public repopulateHandler() {
        this.navItems2 = Object.assign([], this.navItems);
    }

}
