import { Component, ElementRef, ViewChild, ViewChildren, QueryList } from "@angular/core";
import { CodeHandler } from "./code-handler.component";

@Component({
    selector: 'sample-app',
    templateUrl: 'demos/app.component.html',
    styleUrls: ['demos/app.component.css']
})

export class AppComponent {
    private _el: ElementRef;
    private markup: string;
    private typescriptCode: string;

    @ViewChildren("item") items;
    @ViewChild("code") code;

    constructor(private el: ElementRef) {
        this._el = el;
        this.markup = `
<span class="componentTitle">Switch</span><br>
<span class="componentDesc">A component that lets the user toggle between checked and unchecked states.</span><br><br>
<ig-switch [(ngModel)]="user.subscribed"></ig-switch>
<ig-switch [(ngModel)]="!user.subscribed"></ig-switch>`;
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
        this.code.nativeElement.className = 'language-html';
        this.code.nativeElement.textContent = this.markup;
        Prism.highlightAll();
    }

    changeContent(args) {
       if(args.currentTarget.textContent == "TS") {
            this.code.nativeElement.className = 'language-typescript';
            this.code.nativeElement.textContent = this.typescriptCode;
        } else {
            this.code.nativeElement.className = 'language-html';
            this.code.nativeElement.textContent = this.markup;
        }
       Prism.highlightAll();
    }

    navItemClick(args) {
        // UX
        if (args.target.tagName.toLowerCase() != "span") {
            return;
        }

        var items = this.items.toArray();

        for (let i = 0; i < items.length; i++)
        {
            let item = items[i];
            item.nativeElement.className = "";
        }

        args.target.parentElement.parentElement.className = "selected";

        // handle code tabs
        var widgetName = args.target.textContent;

        var code = new CodeHandler().getCode(widgetName);
        this.markup = code.markup;
        this.typescriptCode = code.ts;
        this.code.nativeElement.textContent = this.markup;
        Prism.highlightAll();
    } 
}
