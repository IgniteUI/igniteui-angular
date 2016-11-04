import { Component, ElementRef, ViewChild, ViewChildren, QueryList, Input } from "@angular/core";
import { CodeHandler } from "./code-handler.component";
import { Router } from '@angular/router';

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

    constructor(private router: Router, private codeHandler: CodeHandler) {
        this.codeHandler = new CodeHandler();
    }

    ngOnInit() {
        this.populateCodeContainer(this.codeHandler.getCode('switch'));
        console.log(this.markup);
    }

    public changeContent(args) {
        if (args.currentTarget.textContent == "TS") {
            this.code.nativeElement.classList = 'language-typescript';
            this.code.nativeElement.innerText = this.typescriptCode;
        } else {
            this.code.nativeElement.classList = 'language-markup';
            this.code.nativeElement.innerText = this.markup;
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

        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            item.nativeElement.className = "active";
        }
        args.target.parentElement.parentElement.className = "active";
        // handle code tabs
        this.populateCodeContainer(this.codeHandler.getCode(widgetName));
    }

    private setOptionRoute(route: string) {
        this.router.navigateByUrl(route);
    }

    private populateCodeContainer(code: any) {
        this.markup = code.markup;
        this.typescriptCode = code.ts;
        this.code.nativeElement.classList = 'language-markup';
        this.code.nativeElement.innerText = this.markup;

        Prism.hooks.add('before-highlight', env => {
            env.element.innerHTML = env.element.innerHTML.replace(/<br\s*\/?>/g,'\n');
            env.code = env.element.textContent;
        });

        Prism.highlightAll();
    }
}
