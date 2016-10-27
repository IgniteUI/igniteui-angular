import { Component, ElementRef } from "@angular/core";

@Component({
    selector: 'sample-app',
    templateUrl: 'demos/app.component.html',
    styles: [`
        .samples-container{
            margin-top: 15em;
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
        this._el.nativeElement.querySelector("code").classList = 'language-html';
        this._el.nativeElement.querySelector("code").innerText = this.markup;
        //Prism.highlightAll();
    }

    changeContent(args) {
       if(args.currentTarget.textContent == "TS") {
            this._el.nativeElement.querySelector("code").classList = 'language-typescript';
            this._el.nativeElement.querySelector("code").innerText = this.typescriptCode;
        } else {
            this._el.nativeElement.querySelector("code").classList = 'language-html';
            this._el.nativeElement.querySelector("code").innerText = this.markup;
        }
        //Prism.highlightAll();
    }

}
