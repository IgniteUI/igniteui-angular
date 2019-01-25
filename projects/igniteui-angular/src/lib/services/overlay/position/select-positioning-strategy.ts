import { VerticalAlignment, HorizontalAlignment, PositionSettings, Size, getPointFromPositionsSettings } from './../utilities';
import { ConnectedPositioningStrategy } from './connected-positioning-strategy';
import { IPositionStrategy } from '.';
import { scaleInVerTop, scaleOutVerTop } from '../../../animations/main';
import { IgxSelectComponent } from '../../../select/select.component';
import { ISelectComponent } from '../../../select/ISelectComponent';

enum ENUM_DIRECTION {
    TOP = -1,
    BOTTOM = 1,
    NONE = 0
}
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

    private CHECK_ITEM_POSITION_IN_VIEW(contentElement: HTMLElement, itemElement: HTMLElement): number {
        const elements = contentElement.querySelectorAll('igx-select-item');
        let itemIndex = 0;
        elements.forEach((element, index) => {
            const elementRect = element.getBoundingClientRect() as DOMRect;
            if (elementRect.y + elementRect.height < elementRect.height) {
                itemIndex--;
                return;
            }
            if (element === itemElement) {
                itemIndex += index;
            }
        });
        return itemIndex;
    }

    private GET_ITEMS_OUT_OF_VIEW(contentElement: HTMLElement, itemHeight: number): {
        '-1': number,
        '1': number
    } {
        if (contentElement.firstElementChild.scrollHeight <= contentElement.firstElementChild.clientHeight) {
            return {
                '-1': 0,
                '1': 0
            };
        }
        const currentScroll = contentElement.firstElementChild.scrollTop;
        const remainingScroll = this.select.items.length * itemHeight
            - currentScroll - contentElement.getBoundingClientRect().height;
        return {
            '-1': currentScroll,
            '1': remainingScroll
        };
    }
    private getViewPort(document) { // Material Design implementation
        const clientRect = document.documentElement.getBoundingClientRect();
        const scrollPosition = {
            top: -clientRect.top,
            left: -clientRect.left
        };
        const width = window.innerWidth;
        const height = window.innerHeight;

        return {
            top: scrollPosition.top,
            left: scrollPosition.left,
            bottom: scrollPosition.top + height,
            right: scrollPosition.left + width,
            height,
            width
        };

    }

    private LIST_OUT_OF_BOUNDS(elementContainer: {top: number, bottom: number}, document: Document): {
        DIRECTION: ENUM_DIRECTION,
        AMOUNT: number
    } {
        const container = {
            TOP: elementContainer.top,
            BOTTOM: elementContainer.bottom,
        };
        const viewPort = this.getViewPort(document);
        const documentElement = {
            TOP: viewPort.top,
            BOTTOM: viewPort.bottom
        };
        const returnVals = {
            DIRECTION: ENUM_DIRECTION.NONE,
            AMOUNT: 0
        };
        if (documentElement.TOP > container.TOP) {
            returnVals.DIRECTION = ENUM_DIRECTION.TOP;
            returnVals.AMOUNT = documentElement.TOP - container.TOP;
        } else if (documentElement.BOTTOM < container.BOTTOM) {
            returnVals.DIRECTION = ENUM_DIRECTION.BOTTOM;
            returnVals.AMOUNT = container.BOTTOM - documentElement.BOTTOM;
        } else {
            return null;
        }
        return returnVals;
    }

    private adjustItemTextPadding(): number {
        return 8; // current styling item text padding
    }

    position(contentElement: HTMLElement, size: Size, document?: Document, initialCall?: boolean, minSize?: Size): void {
        const inputRect = this.select.input.nativeElement.getBoundingClientRect();
        const inputGroupRect = this.select.inputGroup.element.nativeElement.getBoundingClientRect();
        const START = {
            X: inputGroupRect.x,
            Y: inputRect.y
        };
        // The current dropdown state will be - item is scrolled to the middle (if scrollbar)
        // OR item is just focused
        // Get drop-down height
        const LIST_HEIGHT = contentElement.getBoundingClientRect().height;
        // Get how much space there is between input and window bounds (top / bottom)
        // Container position
        // The current dropdown state will be - item is scrolled to the middle (if scrollbar)
        // OR item is just focused
        // ASSUME SAME ITEM HEIGHT
        // Position item to be on top of the input (START.Y -= ITEM_VISIBLE_INDEX * ITEM_HEIGHT)
        // This should maybe be recursive?
        const ITEM_VISIBLE_INDEX = this.CHECK_ITEM_POSITION_IN_VIEW(contentElement, this.select.selectedItem.element.nativeElement);
        const ITEM_HEIGHT = this.select.selectedItem.element.nativeElement.getBoundingClientRect().height;
        let CURRENT_POSITION_Y = START.Y - ITEM_VISIBLE_INDEX * ITEM_HEIGHT;
        const CURRENT_BOTTOM_Y = CURRENT_POSITION_Y + contentElement.getBoundingClientRect().height;
        const OUT_OF_BOUNDS: {
            DIRECTION: ENUM_DIRECTION,
            AMOUNT: number
        } = this.LIST_OUT_OF_BOUNDS({ top: CURRENT_POSITION_Y, bottom: CURRENT_BOTTOM_Y}, document);
        if (OUT_OF_BOUNDS) {
            let CONTAINER_CAN_BE_SCROLLED = 0;
            const NUMBER_OF_ITEMS_NEEDED = OUT_OF_BOUNDS.AMOUNT / ITEM_HEIGHT;
            const NUMBER_OF_ITEMS_OUT_OF_VIEW: {
                '-1': number,
                '1': number
            } = this.GET_ITEMS_OUT_OF_VIEW(contentElement, ITEM_HEIGHT);

            if (NUMBER_OF_ITEMS_OUT_OF_VIEW[OUT_OF_BOUNDS.DIRECTION] >= NUMBER_OF_ITEMS_NEEDED) {
                CONTAINER_CAN_BE_SCROLLED =
                    OUT_OF_BOUNDS.DIRECTION * NUMBER_OF_ITEMS_NEEDED * ITEM_HEIGHT;
            }
            if (CONTAINER_CAN_BE_SCROLLED) {
                contentElement.scrollTop += CONTAINER_CAN_BE_SCROLLED;
                CURRENT_POSITION_Y = START.Y - ITEM_VISIBLE_INDEX * ITEM_HEIGHT;
            } else {
                if (OUT_OF_BOUNDS.DIRECTION === ENUM_DIRECTION.TOP) {
                    CURRENT_POSITION_Y =
                    this.select.inputGroup.element.nativeElement.getBoundingClientRect().height;
                } else {
                    CURRENT_POSITION_Y = -1 * LIST_HEIGHT;
                }
                CURRENT_POSITION_Y += START.Y;
            }
        }
        let transformString = '';
        transformString += `translateX(${START.X + this.settings.horizontalDirection * size.width}px) `;
        transformString += `translateY(${CURRENT_POSITION_Y + this.settings.verticalDirection * size.height -
            this.adjustItemTextPadding()}px)`;
        contentElement.style.transform = transformString.trim();
        const boundingRect = contentElement.getBoundingClientRect();
        // if (this.LIST_OUT_OF_BOUNDS({ top: boundingRect.top, bottom: boundingRect.bottom }, document)) {
        //     this.position(contentElement, size, document, initialCall, minSize);
        // }
    }

    getItemOffsets(select) {

    }
}
