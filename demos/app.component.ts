import { Component, ElementRef, ViewChild, ViewChildren, QueryList } from "@angular/core";

@Component({
    selector: 'sample-app',
    templateUrl: 'demos/app.component.html',
    styles: [`
        .samples-container{
            margin-top: 15em;
        }
        .samples-container .whiteContainer > div:last-of-type {
            padding: 0;
        }
        .code-container {
            margin-top: 5em; 
            margin-bottom: 5em; 
            overflow: auto
        }
        .samples-container .text-content, 
        .component-links,
        .directive-links {
            width: 50%;
        }
        .component-links {
            float: left;
        }
        .directive-links {
            float: right;
        }
        .codebox .header .title {
            font-weight: bold;
        }
        .codebox .header .html,
        .codebox .header .ts {
            float: right;
            cursor: pointer;
        }
        .codebox .header .ts {
            margin-right: 20px;
        }
        .codebox .content {
            margin-top:20px;
        }
        .codebox .content pre {
            border: 0; 
            background-color: #fff;
        }
        @media (max-width: 767px) {
            .samples-container {
                margin-top: 5em;
            }            
        }
        `]
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
            <div>
                <span class="componentTitle">Switch</span><br>
                <span class="componentDesc">A component that lets the user toggle between checked and unchecked states.</span><br><br>
                <ig-switch [(ngModel)]="user.subscribed"></ig-switch>
                <ig-switch [(ngModel)]="!user.subscribed"></ig-switch>
            </div>
        `;
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
            }`;
    }

    ngOnInit() {
        this.code.nativeElement.classList = 'language-html';
        this.code.nativeElement.innerText = this.markup;
        //Prism.highlightAll();
    }

    changeContent(args) {
       if(args.currentTarget.textContent == "TS") {
            this.code.nativeElement.classList = 'language-typescript';
            this.code.nativeElement.innerText = this.typescriptCode;
        } else {
            this.code.nativeElement.classList = 'language-html';
            this.code.nativeElement.innerText = this.markup;
        }
        //Prism.highlightAll();
    }

    navItemClick(args) {
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
    }
}
