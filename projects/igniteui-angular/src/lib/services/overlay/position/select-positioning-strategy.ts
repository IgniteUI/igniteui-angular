import { VerticalAlignment, HorizontalAlignment, PositionSettings, Size, getPointFromPositionsSettings } from './../utilities';
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

    constructor(public select: IgxSelectComponent, settings?: PositionSettings) {
        super();
        this.settings = Object.assign({}, this._selectDefaultSettings, settings);

    }

    position(contentElement: HTMLElement, size: Size, document?: Document, initialCall?: boolean, minSize?: Size): void {
        const inputRect = this.select.input.nativeElement.getBoundingClientRect();
        const inputGroupRect = this.select.inputGroup.element.nativeElement.getBoundingClientRect();
        const startPoint = {
            x: inputGroupRect.x,
            y: inputRect.y
        };
        //  TODO: extract transform setting in util function
        let transformString = '';
        transformString += `translateX(${startPoint.x + this.settings.horizontalDirection * size.width}px) `;
        transformString += `translateY(${startPoint.y + this.settings.verticalDirection * size.height}px)`;
        contentElement.style.transform = transformString.trim();
      }

    getItemOffsets(select) {

    }
}
