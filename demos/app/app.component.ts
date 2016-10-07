import { Component } from "@angular/core";

@Component({
    selector: 'sample-app',
    template:`
        <h1 style="text-align: center">Zero Blocks Samples</h1>
        <nav style="width: 100%; display: flex; justify-content: center;">
            <span igButton routerLink="/inputs">Inputs</span>
            <span igButton routerLink="/carousel">Carousel</span>
            <span igButton routerLink="/tabbar">TabBar</span>
            <span igButton routerLink="/list">List</span>
            <span igButton routerLink="/buttons">Buttons</span>
            <span igButton routerLink="/avatar">Avatar</span>
            <span igButton routerLink="/navigation-drawer">Navigation Drawer</span>
        </nav>
        <router-outlet></router-outlet>
    `
})
export class AppComponent {}