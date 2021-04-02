import { fadeIn, fadeOut } from '../../../animations/main';
import { HorizontalAlignment, PositionSettings, Util, VerticalAlignment } from './../utilities';
import { IPositionStrategy } from './IPositionStrategy';

/**
 * Positions the element based on the directions passed in trough PositionSettings.
 * These are Top/Middle/Bottom for verticalDirection and Left/Center/Right for horizontalDirection
 */
export class GlobalPositionStrategy implements IPositionStrategy {
    /** @inheritdoc */
    public settings: PositionSettings;

    protected _defaultSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Center,
        verticalDirection: VerticalAlignment.Middle,
        horizontalStartPoint: HorizontalAlignment.Center,
        verticalStartPoint: VerticalAlignment.Middle,
        openAnimation: fadeIn,
        closeAnimation: fadeOut,
        minSize: { width: 0, height: 0 }
    };

    constructor(settings?: PositionSettings) {
        this.settings = Object.assign({}, this._defaultSettings, settings);
    }

    /** @inheritdoc */
    public position(contentElement: HTMLElement): void {
        contentElement.classList.add('igx-overlay__content--relative');
        contentElement.parentElement.classList.add('igx-overlay__wrapper--flex');
        this.setPosition(contentElement);
    }

    /** @inheritdoc */
    public clone(): IPositionStrategy {
        return Util.cloneInstance(this);
    }

    protected setPosition(contentElement: HTMLElement) {
        switch (this.settings.horizontalDirection) {
            case HorizontalAlignment.Left:
                contentElement.parentElement.style.justifyContent = 'flex-start';
                break;
            case HorizontalAlignment.Center:
                contentElement.parentElement.style.justifyContent = 'center';
                break;
            case HorizontalAlignment.Right:
                contentElement.parentElement.style.justifyContent = 'flex-end';
                break;
            default:
                break;
        }

        switch (this.settings.verticalDirection) {
            case VerticalAlignment.Top:
                contentElement.parentElement.style.alignItems = 'flex-start';
                break;
            case VerticalAlignment.Middle:
                contentElement.parentElement.style.alignItems = 'center';
                break;
            case VerticalAlignment.Bottom:
                contentElement.parentElement.style.alignItems = 'flex-end';
                break;
            default:
                break;
        }
    }
}

