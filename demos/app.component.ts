import { Component, ElementRef, ViewChild, ViewChildren, QueryList, Input } from "@angular/core";
import { CodeHandler } from "./code-handler.component";
import {Router} from '@angular/router';

@Component({
    selector: 'sample-app',
    templateUrl: 'demos/app.component.html'
})

export class AppComponent {
    private _el: ElementRef;
    private markup: string;
    private typescriptCode: string;

    @ViewChildren("item") items;
    @ViewChild("code") code;
    
    constructor(private el: ElementRef, private router: Router) {
        this._el = el;
        this.markup = '<span class="componentTitle">Switch</span><span class="componentDesc">A component that lets the user toggle between checked and unchecked states.</span><br><br><ig-switch [(ngModel)]="user.subscribed"></ig-switch><ig-switch [(ngModel)]="!user.subscribed"></ig-switch>';
        this.typescriptCode = `
import { Component } from "@angular/core";
@Component({
    selector: "input-sample",
    templateUrl: "demos/inputs/inputsample.component.html"
})
export class InputSampleComponent {
    placeholder = "Please enter a value";

    user = {
        name: 'John Doe',
        password: '1337s3cr3t',
        comment: "N/A",
        registered: true,
        subscribed: false,
        favouriteVarName: 'Foo'
    };
}`
    }

    ngOnInit() {
        // this.setOptionRoute('switch');
        this.code.nativeElement.classList = 'language-html';
        this.code.nativeElement.innerText = this.markup;
        Prism.highlightAll();
    }

    changeContent(args) {
        if (args.currentTarget.textContent == "TS") {
            this.code.nativeElement.classList = 'language-typescript';
            this.code.nativeElement.innerText = this.typescriptCode;
        } else {
            this.code.nativeElement.classList = 'language-html';
            this.code.nativeElement.innerText = this.markup;
        }
        Prism.highlightAll();
    }

    navItemClick(args) {
        // UX
        let target = args.target.tagName.toLowerCase();

        if (target !== "span" && target !== "select") {
            return;
        }
        
        if(args.target.value) {
            this.setOptionRoute(args.target.value);
        }

        let items = this.items.toArray();

        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            item.nativeElement.className = "";
        }
        args.target.parentElement.parentElement.className = "active";
        
        // handle code tabs
        let widgetName = args.target.dataset.demo ? args.target.dataset.demo : args.target.value;

        let code = new CodeHandler().getCode(widgetName);
        this.markup = code.markup;
        this.typescriptCode = code.ts;
        this.code.nativeElement.innerText = this.markup;
        Prism.highlightAll();
    }
    setOptionRoute(route: string) {
        this.router.navigateByUrl(route);
    }
}
