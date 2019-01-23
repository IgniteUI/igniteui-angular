import { VerticalAlignment, HorizontalAlignment, PositionSettings, Size, getPointFromPositionsSettings } from './../utilities';
import { ConnectedPositioningStrategy } from './connected-positioning-strategy';
import { IPositionStrategy } from '.';
import { scaleInVerTop, scaleOutVerTop } from '../../../animations/main';
import { IgxSelectComponent } from '../../../select/select.component';
import { ISelectComponent } from '../../../select/ISelectComponent';

export class SelectPositioningStrategy extends ConnectedPositioningStrategy implements IPositionStrategy {

    private _selectDefaultSettings = {
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

    private checkItemPositionInView() {

    }
    private getItemsOutOfView(contentElement: HTMLElement): {
        TOP: number,
        BOTTOM: number
    } {
        const currentScroll = contentElement.scrollTop;
        const remainingScroll = this.select.items.length * this.select.items[0].element.nativeElement.getBoundingClientRect()
         - currentScroll - contentElement.getBoundingClientRect().height;
        return {
            TOP: contentElement.scrollTop,
            BOTTOM: remainingScroll
        };
    }
    position(contentElement: HTMLElement, size: Size, document?: Document, initialCall?: boolean, minSize?: Size): void {
        const inputRect = this.select.input.nativeElement.getBoundingClientRect();
        const inputGroupRect = this.select.inputGroup.element.nativeElement.getBoundingClientRect();
        const startPoint = {
            x: inputGroupRect.x,
            y: inputRect.y
        };
        // The current dropdown state will be - item is scrolled to the middle (if scrollbar)
        // OR item is just focused
        /**
         * // Get drop-down height
         * const LIST_HEIGHT = contentElement.getBoundingClientRect().height;
         * // Get how much space there is between input and window bounds (top / bottom)
         * // Container position
         * const CONTAINER: {
         *  TOP: number,
         *  BOTTOM: number
         * } = {
         *  TOP: startPoint.y;
         *  BOTTOM: select.inputGroup.element.nativeElement.getBoundingClientRect().bottom;
         * }
         * const CONTAINER.TOP = startPoint.y;
         * const containerBottom = select.inputGroup.element.nativeElement.getBoundingClientRect().bottom;
         * // Document bounds
         * const BOUNDS: {
         *  TOP: number,
         *  BOTTOM: number
         * } = {
         *  TOP: document.documentElement.top,
         *  BOTTOM: document.documentElement.bottom
         * }
         * const REMAINING_TOP = CONTAINER.TOP - BOUNDS.TOP;
         * const remainingBottom = BOUNDS.BOTTOM - CONTAINER.BOTTOM;
         */
        // The current dropdown state will be - item is scrolled to the middle (if scrollbar)
        // OR item is just focused
        // ASSUME SAME ITEM HEIGHT
        // ASSUME MAX 5 ITEMS PER DD "SCREEN"
        /**
        * // Position item to be on top of the input (START.Y -= ITEM_VISIBLE_INDEX * ITEM_HEIGHT)
        * // This should maybe be recursive?
        * let CURRENT_POSITION_Y = START.Y - ITEM_VISIBLE_INDEX * ITEM_HEIGHT;
        * const OUT_OF_BOUNDS: {
        *   DIRECTION: ENUM_DIRECTION,
        *   AMOUNT: number
        * } = is list out of bounds either top OR bottom; IF NOT => NULL
        * IF (OUT_OF_BOUNDS) {
        *   let CONTAINER_CAN_BE_SCROLLED = 0;
        *   const NUMBER_OF_ITEMS_NEEDED = OUT_OF_BOUNDS.AMOUNT / ITEM_HEIGHT;
        *   const NUMBER_OF_ITEMS_OUT_OF_VIEW: {
        *       TOP: number,
        *       BOTTOM: number
        *   } = remaining items before and after the current view
        *   IF (NUMBER_OF_ITEMS_OUT_OF_VIEW[OUT_OF_BOUNDS.DIRECTION] >= NUMBER_OF_ITEMS_NEEDED) {
        *        CONTAINER_CAN_BE_SCROLLED = (OUT_OF_BOUNDS.DIRECTION === 'TOP' ? -1 : 1) * NUBMER_OF_ITEMS_NEEDED * ITEM_HEIGHT;
        *   }
        *   IF (CONTAINER_CAN_BE_SCROLLED) {
        *       CONTAINER_SCROLL_TOP += CONTAINER_CAN_BE_SCROLLED;
        *       CURRENT_POSITION_Y = START.Y - ITEM_VISIBLE_INDEX * ITEM_HEIGHT;
        *   } else {
        *       if (OUT_OF_BOUNDS.DIRECTION === 'TOP') {
        *           CURRENT_POSITION_Y = SELECT_CONTAINER_HEIGHT + NUMBER_OF_ITEMS * ITEM_HEIGHT;
        *       } else {
        *           CURRENT_POSITION_Y = -1 * NUMBER_OF_ITEMS * ITEM_HEIGHT;
        *       }
        *       CURRENT_POSITION_Y += START.Y;
        *   }
        * }
        * POSITION ON (START.X, CURRENT_POSITION_Y);
        */
        let transformString = '';
        transformString += `translateX(${startPoint.x + this.settings.horizontalDirection * size.width}px) `;
        transformString += `translateY(${startPoint.y + this.settings.verticalDirection * size.height}px)`;
        contentElement.style.transform = transformString.trim();
      }

    getItemOffsets(select) {

    }
}
