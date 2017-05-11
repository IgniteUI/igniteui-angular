import { Component, OnInit } from "@angular/core";
import { IgxSnackbar } from "../../../src/snackbar/snackbar.component";

@Component({
    moduleId: module.id,
    selector: "snackbar-sample",
    styleUrls: ["sample.component.css", "../app.samples.css"],
    templateUrl: "sample.component.html"
})
export class IgxSnackbarSampleComponent implements OnInit {
    color: string;
    message: string;
    actionName: string;
    private _colors: string[];

    ngOnInit() {
        this.color = "mediumpurple";
        this.actionName = "Undo";
        this._colors = [];
    }

    changeColor(snackbar: IgxSnackbar) {
        const characters = "0123456789ABCDEF";
        let color = "#";

        for (let i = 0; i < 6; i++ ) {
            color += characters[Math.floor(Math.random() * 16)];
        }

        this._colors.push(this.color);
        this.color = color;

        this.message = "Changed color to " + this.color;
        snackbar.show();
    }

    undoColorChange(snackbar) {
        this.color = this._colors.pop();

        snackbar.hide();
    }

    onAnimation(evt) {
        const message = evt.fromState == "void" ? "Sliding snackbar IN" : "Sliding snackbar OUT";
        console.log(message);
    }
}