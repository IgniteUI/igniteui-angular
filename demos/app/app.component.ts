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
            <a routerLink="/buttons">Buttons</a>
        </nav>
        <router-outlet></router-outlet>
    `
})
export class AppComponent {}