import { Component, OnInit } from '@angular/core';
import { IgxSnackbarComponent } from 'igniteui-angular';

@Component({
    selector: 'app-snackbar-sample',
    styleUrls: ['snackbar.sample.css'],
    templateUrl: 'snackbar.sample.html'
})
export class SnackbarSampleComponent implements OnInit {
    public color: string;
    public message: string;
    public actionName: string;
    private _colors: string[];

    public ngOnInit() {
        this.color = 'mediumpurple';
        this.actionName = 'Undo';
        this._colors = [];
    }

    public changeColor(snackbar: IgxSnackbarComponent) {
        const characters = '0123456789ABCDEF';
        let color = '#';

        for (let i = 0; i < 6; i++) {
            color += characters[Math.floor(Math.random() * 16)];
        }

        this._colors.push(this.color);
        this.color = color;

        snackbar.open('Changed color to ' + this.color);
    }

    public undoColorChange(snackbar) {
        this.color = this._colors.pop();

        snackbar.close();
    }
}
