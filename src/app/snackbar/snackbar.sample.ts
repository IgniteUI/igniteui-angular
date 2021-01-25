import { Component, OnInit } from '@angular/core';
import { IgxSnackbarComponent } from 'igniteui-angular';

@Component({
    selector: 'app-snackbar-sample',
    styleUrls: ['snackbar.sample.css'],
    templateUrl: 'snackbar.sample.html'
})
export class SnackbarSampleComponent implements OnInit {
    color: string;
    message: string;
    actionName: string;
    _colors: string[];

    ngOnInit() {
        this.color = 'mediumpurple';
        this.actionName = 'Undo';
        this._colors = [];
    }

    changeColor(snackbar: IgxSnackbarComponent) {
        const characters = '0123456789ABCDEF';
        let color = '#';

        for (let i = 0; i < 6; i++) {
            color += characters[Math.floor(Math.random() * 16)];
        }

        this._colors.push(this.color);
        this.color = color;

        this.message = 'Changed color to ' + this.color;
        snackbar.open();
    }

    undoColorChange(snackbar) {
        this.color = this._colors.pop();

        snackbar.close();
    }

    onAnimation(evt) {
        const message = evt.fromState === 'void' ? 'Sliding snackbar IN' : 'Sliding snackbar OUT';
    }
}
