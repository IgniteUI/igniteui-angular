import { Component } from "@angular/core";

@Component({
    selector: 'sample-app',
    template:`
        <h1>Zero Blocks Samples</h1>
        <nav>
            <a routerLink="/inputs">Inputs</a>
            <a routerLink="/carousel">Carousel</a>
            <a routerLink="/tabbar">TabBar</a>
            <a routerLink="/list">List</a>
<<<<<<< HEAD
            <a routerLink="/buttons">Buttons</a>
            <a routerLink="/avatar">Avatar</a>
=======
            <a routerLink="/navigation-drawer">navigation-drawer</a>
>>>>>>> 3d35e0d... adding nav drawer ngModule, adding to samples
        </nav>
        <router-outlet></router-outlet>
    `
})
export class AppComponent {}