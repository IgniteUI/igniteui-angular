import { VerticalAlignment, HorizontalAlignment, PositionSettings, Size } from './../utilities';
import { ConnectedPositioningStrategy } from './connected-positioning-strategy';
import { IPositionStrategy } from '.';
import { scaleInVerTop, scaleOutVerTop } from '../../../animations/main';
import { IgxSelectComponent } from '../../../select/select.component';
import { ISelectComponent } from '../../../select/ISelectComponent';

export class SelectPositioningStrategy extends ConnectedPositioningStrategy implements IPositionStrategy {

    private _selectDefaultSettings = {
        //default Point(0, 0) in getPointFromPositionsSettings
        target: null,
        topOffset: 0,
        horizontalDirection: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Bottom,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Top,
        openAnimation: scaleInVerTop,
        closeAnimation: scaleOutVerTop,
        minSize: { width: 0, height: 0 }
    };
    public settings: PositionSettings;

    constructor(select: ISelectComponent, settings?: PositionSettings) { //Interface ISelectComponent
        super();
        this.settings = Object.assign({}, this._selectDefaultSettings, settings);

    }

    getItemOffsets(select) {

    }
}
