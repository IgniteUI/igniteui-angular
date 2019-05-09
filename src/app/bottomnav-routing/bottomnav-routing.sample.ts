import { AfterViewInit,
    Component,
    ElementRef,
    NgModule,
    QueryList,
    Renderer2,
    ViewChild,
    ViewChildren } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IgxBottomNavComponent } from 'igniteui-angular';

@Component({
selector: 'app-bottomnav-routing-sample',
styleUrls: ['bottomnav-routing.sample.css'],
templateUrl: 'bottomnav-routing.sample.html'
})
export class BottomNavRoutingSampleComponent implements AfterViewInit {

@ViewChildren('tabbarEl')
tabbar: QueryList<ElementRef>;

@ViewChild(IgxBottomNavComponent)
bottomNavComp: IgxBottomNavComponent;

options = {};

contacts = [{
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
}];

    constructor(private router: Router, private renderer: Renderer2) { }

    route(event) {
        if (event.panel.index === 2) {
            this.router.navigate(['/bottom-navigation/tabbar', { outlets: { tabPanelOutlet: ['tabbarInnerPath'] } }]);
        }
    }

    ngAfterViewInit() {
        this.tabbar.map((e) => {
            menubar = e.nativeElement.querySelector('.igx-bottom-nav__menu');
            this.renderer.setStyle(menubar, 'position', 'absolute');
        });
    }

    public sel1() {
        const theTabs = this.bottomNavComp.tabsAsContentChildren.toArray();
        theTabs[0].select();
    }

    public sel2() {
        const theTabs = this.bottomNavComp.tabsAsContentChildren.toArray();
        theTabs[1].select();
    }

    public sel3() {
        const theTabs = this.bottomNavComp.tabsAsContentChildren.toArray();
        theTabs[2].select();
    }
}
