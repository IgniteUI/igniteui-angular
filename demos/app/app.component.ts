import { Component } from "@angular/core";

@Component({
    selector: 'sample-app',
    template:`
        <h1 style="text-align: center">Zero Blocks Samples</h1>
        <nav style="width: 100%; display: flex; justify-content: center;">
            <ig-button type="flat" routerLink="/inputs">Inputs</ig-button>
            <ig-button type="flat" routerLink="/carousel">Carousel</ig-button>
            <ig-button type="flat" routerLink="/tabbar">TabBar</ig-button>
            <ig-button type="flat" routerLink="/list">List</ig-button>
            <ig-button type="flat" routerLink="/buttons">Buttons</ig-button>
            <ig-button type="flat" routerLink="/avatar">Avatar</ig-button>
            <ig-button type="flat" routerLink="/navigation-drawer">Navigation Drawer</ig-button>
        </nav>
        <router-outlet></router-outlet>
    `
})
export class AppComponent {}