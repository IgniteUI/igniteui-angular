import { AfterViewInit, Component, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IgxBottomNavComponent } from 'igniteui-angular';

@Component({
selector: 'app-bottomnav-routing-sample',
styleUrls: ['bottomnav-routing.sample.css'],
templateUrl: 'bottomnav-routing.sample.html'
})
export class BottomNavRoutingSampleComponent implements AfterViewInit {

    @ViewChild(IgxBottomNavComponent, { static: true })
    bottomNavComp: IgxBottomNavComponent;

    constructor(private router: Router, private renderer: Renderer2) { }

    ngAfterViewInit() {
    }
}
