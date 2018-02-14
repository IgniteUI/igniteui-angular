import { Component, OnInit } from "@angular/core";
import { IgxSnackbarComponent } from "../../lib/main";

@Component({
    selector: "snackbar-sample",
    styleUrls: ["sample.component.css", "../app.samples.css"],
    templateUrl: "sample.component.html"
})
export class IgxSnackbarSampleComponent implements OnInit {
    public color: string;
    public message: string;
    public actionName: string;
    private _colors: string[];

    public ngOnInit() {
        this.color = "mediumpurple";
        this.actionName = "Undo";
        this._colors = [];
    }

    public changeColor(snackbar: IgxSnackbarComponent) {
        const characters = "0123456789ABCDEF";
        let color = "#";

        for (let i = 0; i < 6; i++) {
            color += characters[Math.floor(Math.random() * 16)];
        }

        this._colors.push(this.color);
        this.color = color;

        this.message = "Changed color to " + this.color;
        snackbar.show();
    }

    public undoColorChange(snackbar) {
        this.color = this._colors.pop();

        snackbar.hide();
    }

    public onAnimation(evt) {
        const message = evt.fromState === "void" ? "Sliding snackbar IN" : "Sliding snackbar OUT";
    }
}
