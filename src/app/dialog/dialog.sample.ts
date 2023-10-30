import { Component, ViewChild, OnInit } from '@angular/core';
import { useAnimation } from '@angular/animations';
import { HorizontalAlignment, IgxButtonDirective, IgxDialogActionsDirective, IgxDialogComponent, IgxDialogTitleDirective, IgxIconComponent, IgxInputDirective, IgxInputGroupComponent, IgxLabelDirective, IgxPrefixDirective, IgxRippleDirective, IgxSwitchComponent, PositionSettings, VerticalAlignment } from 'igniteui-angular';
import { slideInTop, slideOutBottom } from 'igniteui-angular/animations';


@Component({
    selector: 'app-dialog-sample',
    styleUrls: ['dialog.sample.scss'],
    templateUrl: 'dialog.sample.html',
    standalone: true,
    imports: [IgxButtonDirective, IgxRippleDirective, IgxSwitchComponent, IgxDialogComponent, IgxInputGroupComponent, IgxPrefixDirective, IgxIconComponent, IgxInputDirective, IgxLabelDirective, IgxDialogTitleDirective, IgxDialogActionsDirective]
})
export class DialogSampleComponent implements OnInit {

    @ViewChild('alert', { static: true }) public alert: IgxDialogComponent;

    public positionSettings: PositionSettings = {
        openAnimation: useAnimation(slideInTop, { params: { duration: '2000ms' } }),
        closeAnimation: useAnimation(slideOutBottom, { params: { duration: '2000ms'} }),
        horizontalDirection: HorizontalAlignment.Left,
        verticalDirection: VerticalAlignment.Middle,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Middle,
        minSize: { height: 100, width: 100 }
    };

    public newPositionSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Center,
        verticalDirection: VerticalAlignment.Middle,
    };

    public newAnimationSettings: PositionSettings = {
        openAnimation: useAnimation(slideInTop),
        closeAnimation: useAnimation(slideOutBottom)
    };

    public ngOnInit() {
        // Set position settings on ngOnInit
        // this.alert.positionSettings = this.newAnimationSettings;

        console.log(this.alert.positionSettings);
    }

    public togglePosition() {
        this.alert.positionSettings = this.alert.positionSettings === this.positionSettings ?
            this.newPositionSettings : this.positionSettings;
    }

    public onDialogOKSelected(args) {
        // args.event - event
        // args.dialog - dialog

        // perform OK action
        args.dialog.close();
    }

    public closeDialog(evt) {
        console.log(evt);
    }
}
