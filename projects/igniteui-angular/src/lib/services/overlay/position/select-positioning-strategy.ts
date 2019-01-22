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

    private scrollContainerToItem() {
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
         * const listHeight = contentElement.getBoundingClientRect().height
         * // Get how much space there is between input and window bounds (top / bottom)
         * // Container position
         * const containerTop = startPoint.y;
         * const containerBottom = select.inputGroup.element.nativeElement.getBoundingClientRect().bottom;
         * // Document bounds
         * const bounds = {
         *  top: document.documentElement.top,
         *  bottom: document.documentElement.bottom
         * }
         * const remainingTop = bounds.top - startPoint.y;
         * const remainingBottom = bounds.bottom - containerBottom;
         */
        // The current dropdown state will be - item is scrolled to the middle (if scrollbar)
        // OR item is just focused
        // ASSUME SAME ITEM HEIGHT
        // ASSUME MAX 5 ITEMS PER DD "SCREEN"
        /**
        * // Position item to be on top of the input (startY -= index_of_item * item_height)
        * // This should maybe be recursive?
        * let CURRENT_POSITION_Y = START.Y - ITEM_VISIBLE_INDEX * ITEM_HEIGHT;
        * const OUT_OF_BOUNDS = is list out of bonds either top OR bottom; IF NOT => NULL
        * IF (OUT_OF_BOUNDS) {
        *   let CONTAINER_CAN_BE_SCROLLED = 0;
        *   const NUMBER_OF_ITEMS_NEEDED = OUT_OF_BOUNDS.AMMOUNT / ITEM_HEIGHT;
        *   IF (OUT_OF_BOUNDS.DIRECTION === 'TOP') {
        *       const NUMBER_OF_ITEMS_OUT_OF_VIEW = remaining items until the end of the list;
        *       IF (NUMBER_OF_ITEMS_OUT_OF_VIEW >= NUMBER_OF_ITEMS_NEEDED) {
        *           CONTAINER_CAN_BE_SCROLLED = -1 * NUBMER_OF_ITEMS_NEEDED * ITEM_HEIGHT;
        *       }
        *   } ELSE IF (OUT_OF_BOUNDS.DIRECTION === 'BOTTOM') {
        *      const NUMBER_OF_ITEMS_OUT_OF_VIEW = remaining items until the start of the list;
        *       IF (NUMBER_OF_ITEMS_OUT_OF_VIEW >= NUMBER_OF_ITEMS_NEEDED) {
        *           CONTAINER_CAN_BE_SCROLLED = 1 * NUBMER_OF_ITEMS_NEEDED * ITEM_HEIGHT;
        *       }
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
