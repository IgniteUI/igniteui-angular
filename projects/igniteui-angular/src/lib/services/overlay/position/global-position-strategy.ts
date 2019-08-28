import { IPositionStrategy } from './IPositionStrategy';
import { PositionSettings, HorizontalAlignment, VerticalAlignment, Size, Util, OverlaySettings } from './../utilities';
import { fadeIn, fadeOut } from '../../../animations/main';

/**
 * Positions the element based on the directions passed in trough PositionSettings.
 * These are Top/Middle/Bottom for verticalDirection and Left/Center/Right for horizontalDirection
 */
export class GlobalPositionStrategy implements IPositionStrategy {
    protected _defaultSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Center,
        verticalDirection: VerticalAlignment.Middle,
        horizontalStartPoint: HorizontalAlignment.Center,
        verticalStartPoint: VerticalAlignment.Middle,
        openAnimation: fadeIn,
        closeAnimation: fadeOut,
        minSize: { width: 0, height: 0 }
    };

    /** @inheritdoc */
    public settings: PositionSettings;

    constructor(settings?: PositionSettings) {
        this.settings = Object.assign({}, this._defaultSettings, settings);
    }

    position(contentElement: HTMLElement, size?: Size, document?: Document, initialCall?: boolean): void {
        contentElement.classList.add('igx-overlay__content--relative');
        contentElement.parentElement.classList.add('igx-overlay__wrapper--flex');
        this.setPosition(contentElement, this.settings);
    }

    protected setPosition(contentElement: HTMLElement, settings: PositionSettings) {
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

    /** @inheritdoc */
    clone(): IPositionStrategy {
        return Util.cloneInstance(this);
    }
}

