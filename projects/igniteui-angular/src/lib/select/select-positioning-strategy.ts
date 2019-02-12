import { VerticalAlignment, HorizontalAlignment, PositionSettings, Size, Point } from '../services/overlay/utilities';
import { ConnectedPositioningStrategy } from '../services/overlay/position/connected-positioning-strategy';
import { IPositionStrategy } from '../services/overlay/position';
import { fadeOut, fadeIn } from '../animations/main';
import { IgxSelectComponent } from './select.component';

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
    private viewPort = this.getViewPort(document);
    private deltaY: number;
    private deltaX: number;

    private positionAndScrollBottom(contentElement: HTMLElement, outBoundsAmount: number, transformString: string) {
        const listBoundRect = contentElement.getBoundingClientRect() as DOMRect;
        transformString += `translateY(${this.viewPort.bottom - listBoundRect.height - this.defaultWindowToListOffset}px)`;
        contentElement.style.transform = transformString.trim();
        contentElement.firstElementChild.scrollTop -= outBoundsAmount - (this.adjustItemTextPadding() - this.defaultWindowToListOffset);
        this.deltaY = this.viewPort.bottom - listBoundRect.height -
            this.defaultWindowToListOffset - (this.select.input.nativeElement.getBoundingClientRect() as DOMRect).top;
    }

    private positionNoScroll(contentElement: HTMLElement, CURRENT_POSITION_Y: number, transformString: string) {
        transformString += `translateY(${CURRENT_POSITION_Y - this.adjustItemTextPadding()}px)`;
        contentElement.style.transform = transformString.trim();
        this.deltaY = CURRENT_POSITION_Y - this.adjustItemTextPadding() -
            (this.select.input.nativeElement.getBoundingClientRect() as DOMRect).top;
    }

    private positionAndScrollTop(contentElement: HTMLElement, outBoundsAmount: number, transformString: string) {
        transformString += `translateY(${this.viewPort.top + this.defaultWindowToListOffset}px)`;
        contentElement.style.transform = transformString.trim();
        contentElement.firstElementChild.scrollTop += outBoundsAmount + this.adjustItemTextPadding() + this.defaultWindowToListOffset;
        this.deltaY = this.viewPort.top + this.defaultWindowToListOffset -
            (this.select.input.nativeElement.getBoundingClientRect() as DOMRect).top;
    }

    private getItemsOutOfView(contentElement: HTMLElement, itemHeight: number): {
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
            - currentScroll - (contentElement.getBoundingClientRect() as DOMRect).height;
        return {
            '-1': currentScroll,
            '1': remainingScroll
        };
    }

    private getViewPort(document) {
        const clientRect = document.documentElement.getBoundingClientRect() as DOMRect;
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

    private listOutOfBounds(elementContainer: { top: number, bottom: number }, document: Document): {
        Direction: Direction,
        Amount: number
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

    private adjustItemTextPadding(): number {
        return 8;
    }

    position(contentElement: HTMLElement, size: Size, document?: Document, initialCall?: boolean): void {
        if (!initialCall) {
            const point = new Point(this.deltaX, (this.select.input.nativeElement.getBoundingClientRect() as DOMRect).top + this.deltaY);
            this.settings.target = point;
            super.position(contentElement, size);
            return;
        }

        const inputRect = this.select.input.nativeElement.getBoundingClientRect() as DOMRect;
        const START = {
            X: inputRect.left,
            Y: inputRect.top
        };

        const LIST_HEIGHT = (contentElement.getBoundingClientRect() as DOMRect).height;
        const listBoundRect = contentElement.getBoundingClientRect() as DOMRect;
        const itemElement = this.select.selectedItem ? this.select.selectedItem.element.nativeElement : this.select.getFirstItemElement();
        const inputHeight = (this.select.input.nativeElement.getBoundingClientRect() as DOMRect).height;
        const itemBoundRect = itemElement.getBoundingClientRect() as DOMRect;
        const itemTopListOffset = itemBoundRect.top - listBoundRect.top;
        const itemHeight = (itemElement.getBoundingClientRect() as DOMRect).height;

        let CURRENT_POSITION_Y = START.Y - itemTopListOffset;
        const CURRENT_BOTTOM_Y = CURRENT_POSITION_Y + contentElement.getBoundingClientRect().height;

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
        let transformString = '';
        const itemPadding = window.getComputedStyle(itemElement).paddingLeft;
        const itemTextIndent = window.getComputedStyle(itemElement).textIndent;
        const numericPadding = parseInt(itemPadding.slice(0, itemPadding.indexOf('p')), 10) || 0;
        const numericTextIndent = parseInt(itemTextIndent.slice(0, itemPadding.indexOf('r')), 10) || 0;

        transformString += `translateX(${START.X - numericPadding - numericTextIndent}px)`;
        this.deltaX = START.X - numericPadding - numericTextIndent;

        if (this.getItemsOutOfView(contentElement, itemHeight)[1] === 0 &&
            this.getItemsOutOfView(contentElement, itemHeight)[-1] === 0) {
            this.positionNoScroll(contentElement, CURRENT_POSITION_Y, transformString);
        }

        if (this.getItemsOutOfView(contentElement, itemHeight)[1] !== 0 ||
            this.getItemsOutOfView(contentElement, itemHeight)[-1] !== 0) {
            if (this.getItemsOutOfView(contentElement, itemHeight)[1] !== 0 && !OUT_OF_BOUNDS) {
                this.positionNoScroll(contentElement, CURRENT_POSITION_Y, transformString);
            }

            if (this.getItemsOutOfView(contentElement, itemHeight)[1] !== 0 && OUT_OF_BOUNDS) {
                if (this.getItemsOutOfView(contentElement, itemHeight)[1] > itemHeight) {
                    if (OUT_OF_BOUNDS.Direction === -1) {
                        this.positionAndScrollTop(contentElement, OUT_OF_BOUNDS.Amount, transformString);
                        return;
                    }
                    if (OUT_OF_BOUNDS.Direction === 1) {
                        if (this.getItemsOutOfView(contentElement, itemHeight)[-1] === 0) {
                            this.positionNoScroll(contentElement, CURRENT_POSITION_Y, transformString);
                            return;
                        } else {
                            this.positionAndScrollBottom(contentElement, OUT_OF_BOUNDS.Amount, transformString);
                            return;
                        }
                    }
                }
                if (this.getItemsOutOfView(contentElement, itemHeight)[1] < itemHeight) {
                    if (OUT_OF_BOUNDS.Direction === -1) {
                        this.positionNoScroll(contentElement, CURRENT_POSITION_Y, transformString);

                    }
                    if (OUT_OF_BOUNDS.Direction === 1) {
                        this.positionAndScrollBottom(contentElement, OUT_OF_BOUNDS.Amount, transformString);
                    }
                }
            }
            if (this.getItemsOutOfView(contentElement, itemHeight)[1] === 0 &&
                this.getItemsOutOfView(contentElement, itemHeight)[-1] !== 0
            ) {
                if (OUT_OF_BOUNDS) {
                    if (OUT_OF_BOUNDS.Direction === -1) {
                        this.positionNoScroll(contentElement, CURRENT_POSITION_Y, transformString);
                    }
                    if (OUT_OF_BOUNDS.Direction === 1) {
                        this.positionAndScrollBottom(contentElement, OUT_OF_BOUNDS.Amount, transformString);
                    }
                }
                if (!OUT_OF_BOUNDS) {
                    this.positionNoScroll(contentElement, CURRENT_POSITION_Y, transformString);
                }
            }
        }
    }
}
