import { useAnimation } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
// eslint-disable-next-line max-len
import { HorizontalAlignment, IgxButtonDirective, IgxOverlayOutletDirective, IgxSnackbarComponent, PositionSettings, VerticalAlignment } from 'igniteui-angular';
import { slideInLeft, slideInRight } from 'igniteui-angular/animations';

@Component({
    selector: 'app-snackbar-sample',
    styleUrls: ['snackbar.sample.css'],
    templateUrl: 'snackbar.sample.html',
    standalone: true,
    imports: [IgxSnackbarComponent, IgxOverlayOutletDirective, IgxButtonDirective]
})
export class SnackbarSampleComponent implements OnInit {
    @ViewChild('snackbar')
    private snackbar: IgxSnackbarComponent;

    public color: string;
    public actionName: string;
    public newPositionSettings: PositionSettings = {
        openAnimation: useAnimation(slideInLeft, { params: { duration: '1000ms' } }),
        closeAnimation: useAnimation(slideInRight, { params: { duration: '1000ms' } }),
        horizontalDirection: HorizontalAlignment.Center,
        verticalDirection: VerticalAlignment.Middle,
        horizontalStartPoint: HorizontalAlignment.Center,
        verticalStartPoint: VerticalAlignment.Middle,
        minSize: { height: 100, width: 100 }
    };

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

    public onAnimationStarted() {
        console.log('animation started');
    }

    public onAnimationDone() {
        console.log('animation ended');
    }

    public toggleSnackbar() {
        this.snackbar.toggle();
    }

    public close(element) {
        element.close();
    }
}
