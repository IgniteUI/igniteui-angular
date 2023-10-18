import { fadeIn, fadeOut } from 'igniteui-angular/animations';
import { HorizontalAlignment, PositionSettings, Util, VerticalAlignment } from './../utilities';
import { IPositionStrategy } from './IPositionStrategy';

/**
 * Positions the element based on the directions passed in trough PositionSettings.
 * These are Top/Middle/Bottom for verticalDirection and Left/Center/Right for horizontalDirection
 */
export class GlobalPositionStrategy implements IPositionStrategy {
    /**
     * PositionSettings to use when position the component in the overlay
     */
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

    /**
     * Position the element based on the PositionStrategy implementing this interface.
     *
     * @param contentElement The HTML element to be positioned
     * @param size Size of the element
     * @param document reference to the Document object
     * @param initialCall should be true if this is the initial call to the method
     * @param target attaching target for the component to show
     * ```typescript
     * settings.positionStrategy.position(content, size, document, true);
     * ```
     */
    public position(contentElement: HTMLElement): void {
        contentElement.classList.add('igx-overlay__content--relative');
        contentElement.parentElement.classList.add('igx-overlay__wrapper--flex');
        this.setPosition(contentElement);
    }

    /**
     * Clone the strategy instance.
     * ```typescript
     * settings.positionStrategy.clone();
     * ```
     */
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

