import { VerticalAlignment, HorizontalAlignment, PositionSettings, Size, Point, Util } from '../services/overlay/utilities';
import { ConnectedPositioningStrategy } from '../services/overlay/position/connected-positioning-strategy';
import { IPositionStrategy } from '../services/overlay/position';
import { fadeOut, fadeIn } from '../animations/main';
import { IgxSelectComponent } from './select.component';
import { isIE } from '../core/utils';

/** @hidden */
enum Direction {
    Top = -1,
    Bottom = 1,
    None = 0
}

/** @hidden @internal */
export class SelectPositioningStrategy extends ConnectedPositioningStrategy implements IPositionStrategy {

    private _selectDefaultSettings = {
        target: null,
        horizontalDirection: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Bottom,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Top,
        openAnimation: fadeIn,
        closeAnimation: fadeOut
    };
    public settings: PositionSettings;

    constructor(public select: IgxSelectComponent, settings?: PositionSettings) {
        super();
        this.settings = Object.assign({}, this._selectDefaultSettings, settings);
    }

    private defaultWindowToListOffset = 5;
    private viewPort = Util.getViewportRect(document);
    private deltaY: number;
    private deltaX: number;
    private itemTextPadding: number;
    private itemTextIndent: number;
    private listContainerBoundRect: DOMRect;
    private itemTextToInputTextDiff: number;

    private positionAndScrollBottom(contentElement: HTMLElement, outBoundsAmount: number) {
        contentElement.style.top = `${this.viewPort.bottom - this.listContainerBoundRect.height - this.defaultWindowToListOffset}px`;
        contentElement.firstElementChild.scrollTop -= outBoundsAmount - (this.defaultWindowToListOffset);
        this.deltaY = this.viewPort.bottom - this.listContainerBoundRect.height -
            this.defaultWindowToListOffset - (this.select.input.nativeElement.getBoundingClientRect() as DOMRect).top;
    }

    private positionNoScroll(contentElement: HTMLElement, CURRENT_POSITION_Y: number) {
        contentElement.style.top = `${CURRENT_POSITION_Y - this.itemTextToInputTextDiff}px`;
        this.deltaY = CURRENT_POSITION_Y -
            (this.select.input.nativeElement.getBoundingClientRect() as DOMRect).top - this.itemTextToInputTextDiff;
    }

    private positionAndScrollTop(contentElement: HTMLElement, outBoundsAmount: number) {
        contentElement.style.top = `${this.viewPort.top + this.defaultWindowToListOffset}px`;
        contentElement.firstElementChild.scrollTop += outBoundsAmount + this.itemTextToInputTextDiff + this.defaultWindowToListOffset;
        this.deltaY = this.viewPort.top + this.defaultWindowToListOffset -
            (this.select.input.nativeElement.getBoundingClientRect() as DOMRect).top;
    }

    private getItemsOutOfView(contentElement: HTMLElement, itemHeight: number): {
        'currentScroll': number,
        'remainingScroll': number
    } {
        if (contentElement.firstElementChild.scrollHeight <= contentElement.firstElementChild.clientHeight) {
            return {
                'currentScroll': 0,
                'remainingScroll': 0
            };
        }
        const currentScroll = contentElement.firstElementChild.scrollTop;
        const remainingScroll = this.select.items.length * itemHeight - currentScroll - this.listContainerBoundRect.height;
        return {
            'currentScroll': currentScroll,
            'remainingScroll': remainingScroll
        };
    }

    private listOutOfBounds(elementContainer: { top: number, bottom: number }, document: Document): {
        Direction: Direction,
        Amount: number
    } {
        const container = {
            TOP: elementContainer.top,
            BOTTOM: elementContainer.bottom,
        };
        const viewPort = Util.getViewportRect(document);
        const documentElement = {
            TOP: viewPort.top,
            BOTTOM: viewPort.bottom
        };
        const returnVals = {
            Direction: Direction.None,
            Amount: 0
        };
        if (documentElement.TOP + this.defaultWindowToListOffset > container.TOP) {
            returnVals.Direction = Direction.Top;
            returnVals.Amount = documentElement.TOP - container.TOP;
        } else if (documentElement.BOTTOM - this.defaultWindowToListOffset < container.BOTTOM) {
            returnVals.Direction = Direction.Bottom;
            returnVals.Amount = container.BOTTOM - documentElement.BOTTOM;
        } else {
            return null;
        }
        return returnVals;
    }

    position(contentElement: HTMLElement, size: Size, document?: Document, initialCall?: boolean): void {
        const inputElement = this.select.input.nativeElement;
        const inputRect = inputElement.getBoundingClientRect() as DOMRect;
        this.listContainerBoundRect = contentElement.getBoundingClientRect() as DOMRect;
        const LIST_HEIGHT = this.listContainerBoundRect.height;
        if (!initialCall) {
            this.deltaX = inputRect.left - this.itemTextPadding - this.itemTextIndent;
            const point = new Point(this.deltaX, inputRect.top + this.deltaY);
            this.settings.target = point;
            super.position(contentElement, size);
            return;
        }

        const START = {
            X: inputRect.left,
            Y: inputRect.top
        };

        let itemElement;
        if (this.select.selectedItem) {
            itemElement = this.select.selectedItem.element.nativeElement;
            // D.P. Feb 22 2019, #3921 Force item scroll before measuring in IE11, due to base scrollToItem delay
            if (isIE()) {
                contentElement.firstElementChild.scrollTop = this.select.calculateScrollPosition(this.select.selectedItem);
            }
        } else {
            itemElement = this.select.getFirstItemElement();
        }
        const inputHeight = inputRect.height;
        const itemBoundRect = itemElement.getBoundingClientRect() as DOMRect;
        const itemTopListOffset = itemBoundRect.top - this.listContainerBoundRect.top;
        const itemHeight = itemBoundRect.height;

        const inputFontSize = window.getComputedStyle(inputElement).fontSize;
        const numericInputFontSize = parseInt(inputFontSize.slice(0, inputFontSize.indexOf('p')), 10) || 0;
        const itemFontSize = window.getComputedStyle(itemElement).fontSize;
        const numericItemFontSize = parseInt(itemFontSize.slice(0, itemFontSize.indexOf('p')), 10) || 0;
        const inputTextToInputTop = (inputHeight - numericInputFontSize) / 2;
        const itemTextToItemTop = (itemHeight - numericItemFontSize) / 2;
        this.itemTextToInputTextDiff = itemTextToItemTop - inputTextToInputTop;

        let CURRENT_POSITION_Y = START.Y - itemTopListOffset;
        const CURRENT_BOTTOM_Y = CURRENT_POSITION_Y + this.listContainerBoundRect.height;

        const OUT_OF_BOUNDS: {
            Direction: Direction,
            Amount: number
        } = this.listOutOfBounds({ top: CURRENT_POSITION_Y, bottom: CURRENT_BOTTOM_Y }, document);
        if (OUT_OF_BOUNDS) {
            if (OUT_OF_BOUNDS.Direction === Direction.Top) {
                CURRENT_POSITION_Y = START.Y;
            } else {
                CURRENT_POSITION_Y = -1 * (LIST_HEIGHT - (itemHeight - (itemHeight - inputHeight) / 2));
                CURRENT_POSITION_Y += START.Y;
            }
        }
        const selectItemPaddingHorizontal = 24;
        const itemLeftPadding = window.getComputedStyle(itemElement).paddingLeft;
        const itemTextIndent = window.getComputedStyle(itemElement).textIndent;
        const numericLeftPadding = parseInt(itemLeftPadding.slice(0, itemLeftPadding.indexOf('p')), 10) || 0;
        const numericTextIndent = parseInt(itemTextIndent.slice(0, itemTextIndent.indexOf('r')), 10) || 0;
        this.itemTextPadding = numericLeftPadding;
        this.itemTextIndent = numericTextIndent;
        contentElement.style.left += `${START.X - numericLeftPadding - numericTextIndent}px`;
        contentElement.style.width = inputRect.width + 24 + selectItemPaddingHorizontal * 2 + 'px';
        this.deltaX = START.X - numericLeftPadding - numericTextIndent;
        const currentScroll = this.getItemsOutOfView(contentElement, itemHeight)['currentScroll'];
        const remainingScroll = this.getItemsOutOfView(contentElement, itemHeight)['remainingScroll'];

        // (5 items or less) no scroll and respectively no remaining scroll
        if (remainingScroll === 0 && currentScroll === 0) {
            this.positionNoScroll(contentElement, CURRENT_POSITION_Y);
        }
        // (more than 5 items) there is scroll OR remaining scroll
        if (remainingScroll !== 0 || currentScroll !== 0) {
            if (remainingScroll !== 0 && !OUT_OF_BOUNDS) {
                this.positionNoScroll(contentElement, CURRENT_POSITION_Y);
            }
            // (more than 5 items) and container getting out of the visible port
            if (remainingScroll !== 0 && OUT_OF_BOUNDS) {
                // if there is enough remaining scroll to scroll the item
                if (remainingScroll > itemHeight) {
                    if (OUT_OF_BOUNDS.Direction === Direction.Top) {
                        this.positionAndScrollTop(contentElement, OUT_OF_BOUNDS.Amount);
                        return;
                    }
                    if (OUT_OF_BOUNDS.Direction === Direction.Bottom) {
                        // (more than 5 items) and no current scroll
                        if (currentScroll === 0) {
                            this.positionNoScroll(contentElement, CURRENT_POSITION_Y);
                            return;
                            // (more than 5 items) and current scroll
                        } else {
                            this.positionAndScrollBottom(contentElement, OUT_OF_BOUNDS.Amount);
                            return;
                        }
                    }
                }
                // if there is no enough remaining scroll to scroll the item
                if (remainingScroll < itemHeight) {
                    if (OUT_OF_BOUNDS.Direction === Direction.Top) {
                        this.positionNoScroll(contentElement, CURRENT_POSITION_Y);

                    }
                    if (OUT_OF_BOUNDS.Direction === Direction.Bottom) {
                        this.positionAndScrollBottom(contentElement, OUT_OF_BOUNDS.Amount);
                    }
                }
            }
            // (more than 5 items) and no remaining scroll
            if (remainingScroll === 0 && currentScroll !== 0) {
                if (OUT_OF_BOUNDS) {
                    if (OUT_OF_BOUNDS.Direction === Direction.Bottom) {
                        this.positionAndScrollBottom(contentElement, OUT_OF_BOUNDS.Amount);
                        return;
                    }
                }
                this.positionNoScroll(contentElement, CURRENT_POSITION_Y);
            }
        }
    }
}
