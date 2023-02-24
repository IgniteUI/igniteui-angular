import { Component, ViewChild, OnInit } from '@angular/core';
import { IgxDialogComponent, slideOutBottom, slideInTop,
    PositionSettings, HorizontalAlignment, VerticalAlignment } from 'igniteui-angular';
import { useAnimation } from '@angular/animations';
import { IgxDialogTitleDirective, IgxDialogActionsDirective } from '../../../projects/igniteui-angular/src/lib/dialog/dialog.directives';
import { IgxLabelDirective } from '../../../projects/igniteui-angular/src/lib/directives/label/label.directive';
import { IgxInputDirective } from '../../../projects/igniteui-angular/src/lib/directives/input/input.directive';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { IgxPrefixDirective } from '../../../projects/igniteui-angular/src/lib/directives/prefix/prefix.directive';
import { IgxInputGroupComponent } from '../../../projects/igniteui-angular/src/lib/input-group/input-group.component';
import { IgxDialogComponent as IgxDialogComponent_1 } from '../../../projects/igniteui-angular/src/lib/dialog/dialog.component';
import { IgxSwitchComponent } from '../../../projects/igniteui-angular/src/lib/switch/switch.component';
import { IgxRippleDirective } from '../../../projects/igniteui-angular/src/lib/directives/ripple/ripple.directive';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';

@Component({
    selector: 'app-dialog-sample',
    styleUrls: ['dialog.sample.css'],
    templateUrl: 'dialog.sample.html',
    standalone: true,
    imports: [IgxButtonDirective, IgxRippleDirective, IgxSwitchComponent, IgxDialogComponent_1, IgxInputGroupComponent, IgxPrefixDirective, IgxIconComponent, IgxInputDirective, IgxLabelDirective, IgxDialogTitleDirective, IgxDialogActionsDirective]
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
