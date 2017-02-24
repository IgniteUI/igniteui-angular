import { Component } from "@angular/core";

@Component({
    selector: 'sample-app',
    template:`
        <h1 style="text-align: center">Ignite UI JS Blocks Samples</h1>
        <nav style="display: flex; justify-content: center; flex-wrap: wrap">
            <span igxButton routerLink="/inputs">Inputs</span>
            <span igxButton routerLink="/carousel">Carousel</span>
            <span igxButton routerLink="/tabbar">TabBar</span>
            <span igxButton routerLink="/list">List</span>
            <span igxButton routerLink="/buttons">Buttons</span>
            <span igxButton routerLink="/buttonGroup">ButtonGroup</span>
            <span igxButton routerLink="/avatar">Avatar</span>
            <span igxButton routerLink="/navigation-drawer">Navigation Drawer</span>
            <span igxButton routerLink="/navbar">Navbar</span>
            <span igxButton routerLink="/dialog">Dialog</span>
            <span igxButton routerLink="/progressbar">Progressbar</span>
            <span igxButton routerLink="/icon">Icon</span>
            <span igxButton routerLink="/snackbar">Snackbar</span>
            <span igxButton routerLink="/toast">Toast</span>
            <span igxButton routerLink="/card">Card</span>
            <span igxButton routerLink="/range">Range</span>
        </nav>
        <router-outlet></router-outlet>
    `
})
export class AppComponent {}