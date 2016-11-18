import { Component, ElementRef, ViewChild, ViewChildren, QueryList, Input } from "@angular/core";
import { CodeHandler } from "./code-handler.component";
import { Router } from '@angular/router';
import { Location } from '@angular/common';

declare var Prism: any;

@Component({
    selector: 'sample-app',
    templateUrl: 'demos/app.component.html',
    providers: [CodeHandler]
})

export class AppComponent {
    private markup: string;
    private typescriptCode: string;

    @ViewChildren("item") items;
    @ViewChild("code") code;
    @ViewChildren("tab") tabs;
    
    constructor(private router: Router, private location: Location, private codeHandler: CodeHandler) {
        this.codeHandler = new CodeHandler();
    }

    ngOnInit() {
        let currentUrl = this.location.path(),
            target = currentUrl.substring(1, currentUrl.length);

        if(currentUrl == '') {
            this.populateCodeContainer(this.codeHandler.getCode('switch'));
            return;
        }

        this.populateCodeContainer(this.codeHandler.getCode(target));
    }

    public changeContent(args) {
        let tabs = this.tabs._results;

        for (let tab of tabs) {
            tab.nativeElement.className = '';
        }

        args.currentTarget.className = "active";

        if (args.currentTarget.textContent == "TS") {
            this.code.nativeElement.className = 'language-typescript';
            this.code.nativeElement.textContent = this.typescriptCode;
        } else {
            this.code.nativeElement.className = 'language-markup';
            this.code.nativeElement.textContent = this.markup;
        }
        
        Prism.highlightAll();
    }

    public navItemClick(args) {
        // UX
        let target = args.target.tagName.toLowerCase(),
            items = this.items.toArray(),
            widgetName = args.target.dataset.demo ? args.target.dataset.demo : args.target.value;

        if (target !== "span" && target !== "select") return;
        if (target === "select") this.setOptionRoute(args.target.value);
        
        // handle code tabs
        this.populateCodeContainer(this.codeHandler.getCode(widgetName));
    }

    private setOptionRoute(route: string) {
        this.router.navigateByUrl(route);
    }
    

    private populateCodeContainer(code: any) {
        this.markup = code.markup;
        this.typescriptCode = code.ts;
        this.code.nativeElement.className = 'language-markup';
        this.code.nativeElement.textContent = this.markup;

        Prism.hooks.add('before-highlight', env => {
            env.element.innerHTML = env.element.innerHTML.replace(/<br\s*\/?>/g,'\n');
            env.code = env.element.textContent;
        });

        Prism.highlightAll();
    }

    isActiveRoute(route: string) {
        return route == this.location.path();
    }
}
