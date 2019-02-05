// tslint:disable:max-line-length
import { VerticalAlignment, HorizontalAlignment, PositionSettings, Size, getPointFromPositionsSettings } from './../utilities';
import { ConnectedPositioningStrategy } from './connected-positioning-strategy';
import { IPositionStrategy } from '.';
import { scaleInVerTop, scaleOutVerTop } from '../../../animations/main';
import { IgxSelectComponent } from '../../../select/select.component';
import { ISelectComponent } from '../../../select/ISelectComponent';

enum Direction {
    Top = -1,
    Bottom = 1,
    None = 0
}
export class SelectPositioningStrategy extends ConnectedPositioningStrategy implements IPositionStrategy {

    private _selectDefaultSettings = {
        target: null,
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

    /** Min distance/padding between the visible window TOP/BOTTOM and the IgxSelect list items container */
    private defaultWindowToListOffset = 5;
    private viewPort = this.getViewPort(document);
    // private propListBoundRect = contentElement.getBoundingClientRect() as DOMRect;

    private positionAndScrollBottom(contentElement: HTMLElement, outBoundsAmount: number, transformString: string) {
        const listBoundRect = contentElement.getBoundingClientRect() as DOMRect;
        transformString += `translateY(${this.viewPort.bottom - listBoundRect.height - this.defaultWindowToListOffset}px)`;
        contentElement.style.transform = transformString.trim();
        contentElement.firstElementChild.scrollTop -= outBoundsAmount - (this.adjustItemTextPadding() - this.defaultWindowToListOffset); //  - 2 * this.defaultWindowToListOffset Fix defaultWindowToListOffset maybe remove this from the listOutOfBounds Check
        console.log('outBoundsAmount: ' + outBoundsAmount);
        console.log('positionAndScrollBottom scrollTop: ' + contentElement.firstElementChild.scrollTop);
    }

    //TODO use defaultWindowToListOffset consistently in all scenarios
    private positionNoScroll(contentElement: HTMLElement, CURRENT_POSITION_Y: number, transformString: string, size: Size) {
        transformString += `translateY(${CURRENT_POSITION_Y + this.settings.verticalDirection * size.height -
            this.adjustItemTextPadding()}px)`;
        contentElement.style.transform = transformString.trim();
        console.log('positionNoScroll');
    }

    private positionAndScrollTop(contentElement: HTMLElement, outBoundsAmount: number, transformString: string) {
        const listBoundRect = contentElement.getBoundingClientRect() as DOMRect;
        transformString += `translateY(${this.viewPort.top + this.defaultWindowToListOffset}px)`;
        contentElement.style.transform = transformString.trim();
        // contentElement.firstElementChild.scrollTop += outBoundsAmount - (this.adjustItemTextPadding() - this.defaultWindowToListOffset);
        contentElement.firstElementChild.scrollTop += outBoundsAmount;
        console.log('outBoundsAmount: ' + outBoundsAmount);
        console.log('positionAndScrollTop scrollTop: ' + contentElement.firstElementChild.scrollTop);
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
            - currentScroll - contentElement.getBoundingClientRect().height;
        return {
            '-1': currentScroll,
            '1': remainingScroll
        };
    }

    private getViewPort(document) {
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
        if (documentElement.TOP > container.TOP) {
            returnVals.Direction = Direction.Top;
            // returnVals.Amount = documentElement.TOP - container.TOP - this.defaultWindowToListOffset;
            returnVals.Amount = documentElement.TOP - container.TOP;
        } else if (documentElement.BOTTOM < container.BOTTOM) {
            returnVals.Direction = Direction.Bottom;
            // returnVals.Amount = container.BOTTOM - documentElement.BOTTOM - this.defaultWindowToListOffset;
            returnVals.Amount = container.BOTTOM - documentElement.BOTTOM;
        } else {
            // there is enough space to fit the drop-down container on the window
            return null;
        }
        return returnVals;
    }

    private adjustItemTextPadding(): number {
        return 8; // current styling item text padding
    }

    // TODO: refactor duplicated code + set translateX when exiting the method.
    position(contentElement: HTMLElement, size: Size, document?: Document, initialCall?: boolean, minSize?: Size): void {
        // avoid flickering when scrolling
        if (!initialCall) {
            return;
        }

        const inputRect = this.select.input.nativeElement.getBoundingClientRect();
        const inputGroupRect = this.select.inputGroup.element.nativeElement.getBoundingClientRect();
        const START = {
            X: inputGroupRect.x,
            Y: inputRect.y
        };

        const LIST_HEIGHT = contentElement.getBoundingClientRect().height;
        const inputBoundRect = this.select.input.nativeElement.getBoundingClientRect();
        const listBoundRect = contentElement.getBoundingClientRect() as DOMRect;
        const selectedItemBoundRect = this.select.selectedItem.element.nativeElement.getBoundingClientRect();
        const selectedItemTopListOffset = selectedItemBoundRect.y - listBoundRect.y;
        const itemHeight = this.select.selectedItem.element.nativeElement.getBoundingClientRect().height;
        const inputHeight = this.select.input.nativeElement.getBoundingClientRect().height;

        let CURRENT_POSITION_Y = START.Y - selectedItemTopListOffset;
        const CURRENT_BOTTOM_Y = CURRENT_POSITION_Y + contentElement.getBoundingClientRect().height;

        const OUT_OF_BOUNDS: {
            Direction: Direction,
            Amount: number
        } = this.listOutOfBounds({ top: CURRENT_POSITION_Y, bottom: CURRENT_BOTTOM_Y }, document);
        if (OUT_OF_BOUNDS) {
            console.log('OUT_OF_BOUNDS');
            if (OUT_OF_BOUNDS.Direction === Direction.Top) {
                CURRENT_POSITION_Y = START.Y;


            } else {
                /* if OUT_OF_BOUNDS on BOTTOM, move the container DOWN by one item height minus half the input and
                item height difference (48px-32px)/2, thus position the container down so the last item LBP match input LBP.
                --> <mat-select> like */
                CURRENT_POSITION_Y = -1 * (LIST_HEIGHT - (itemHeight - (itemHeight - inputHeight) / 2));
                CURRENT_POSITION_Y += START.Y;
            }
        }
        let transformString = '';
        transformString += `translateX(${START.X + this.settings.horizontalDirection * size.width}px)`;

        // Handle scenarios where there the list container has no scroll &&
        // when there is scroll and the list container is always in the visible port.
        if (this.getItemsOutOfView(contentElement, itemHeight)[1] === 0 &&
            this.getItemsOutOfView(contentElement, itemHeight)[-1] === 0) {
            this.positionNoScroll(contentElement, CURRENT_POSITION_Y, transformString, size);
        }

        // Handle scenarios where there the list container has scroll
        if (this.getItemsOutOfView(contentElement, itemHeight)[1] !== 0 ||
            this.getItemsOutOfView(contentElement, itemHeight)[-1] !== 0) {
            console.log('container has scroll + top igxSelect opt2, opt3, opt4, opt5, opt6');
            // If the first couple of items are selected and there is space, do not scroll
            if (this.getItemsOutOfView(contentElement, itemHeight)[1] !== 0 && !OUT_OF_BOUNDS) {
                this.positionNoScroll(contentElement, CURRENT_POSITION_Y, transformString, size);
                console.log('container has scroll + top igxSelect opt2, opt3, opt4, opt5, opt6 If the first couple of items are selected and there is space, do not scroll');
            }
            // If Out of boundaries and there is available scrolling down -  do scroll
            if (this.getItemsOutOfView(contentElement, itemHeight)[1] !== 0 && OUT_OF_BOUNDS) {
                // the following works if there is enough scrolling available
                // handle options opt2, opt3, opt4, opt5
                if (this.getItemsOutOfView(contentElement, itemHeight)[1] > itemHeight) {
                    if (OUT_OF_BOUNDS.Direction === -1) {
                        // transformString += `translateY(${START.Y - itemHeight + this.settings.verticalDirection * size.height -
                        //     this.adjustItemTextPadding()}px)`;
                        // contentElement.style.transform = transformString.trim();
                        // contentElement.firstElementChild.scrollTop += selectedItemBoundRect.y - itemHeight;
                        console.log('handle options opt2, opt3, opt4, opt5........OUT_OF_BOUNDS.Direction === -1');
                        this.positionAndScrollTop(contentElement, OUT_OF_BOUNDS.Amount, transformString);
                       // return;
                    }
                    if (OUT_OF_BOUNDS.Direction === 1) {
                        // it is one of the edge items so there is no more scrolling in that same Direction
                        if (contentElement.firstElementChild.scrollTop === 0) {
                            // transformString += `translateY(${START.Y + inputHeight - listBoundRect.height +
                            //     this.settings.verticalDirection * size.height}px)`;
                            // contentElement.style.transform = transformString.trim();
                            this.positionNoScroll(contentElement, CURRENT_POSITION_Y, transformString, size);
                            return;
                        } else {
                            this.positionAndScrollBottom(contentElement, OUT_OF_BOUNDS.Amount, transformString);
                            console.log('handle options opt2, opt3, opt4, opt5........OUT_OF_BOUNDS.Direction === 1');
                            return;
                        }
                    }
                }
                // If one of the last items is selected and there is no more scroll remaining to scroll the selected item
                // handle options  opt6
                if (this.getItemsOutOfView(contentElement, itemHeight)[1] < itemHeight) {
                    console.log('handle option opt6');
                    if (OUT_OF_BOUNDS.Direction === -1) {
                        // transformString += `translateY(${START.Y + this.settings.verticalDirection * size.height - this.adjustItemTextPadding()}px)`;
                        // contentElement.style.transform = transformString.trim();
                        console.log('handle options opt6........OUT_OF_BOUNDS.Direction === -1');
                        //TODO positionAndScrollTop here
                        this.positionAndScrollTop(contentElement, OUT_OF_BOUNDS.Amount, transformString);
                    }
                    if (OUT_OF_BOUNDS.Direction === 1) {
                        // handle lst options opt6
                        // position the container with default window offset
                        this.positionAndScrollBottom(contentElement, OUT_OF_BOUNDS.Amount, transformString);
                    }
                }
            }
            if (this.getItemsOutOfView(contentElement, itemHeight)[1] === 0 &&
                this.getItemsOutOfView(contentElement, itemHeight)[-1] !== 0
            ) {
                // handle lst options opt7, opt8, opt9
                console.log('handle options  opt7, opt8, opt9');
                if (OUT_OF_BOUNDS) {
                    if (OUT_OF_BOUNDS.Direction === -1) {
                        transformString += `translateY(${START.Y + this.settings.verticalDirection * size.height - this.adjustItemTextPadding()}px)`;
                        contentElement.style.transform = transformString.trim();
                        console.log('handle options  opt7, opt8, opt9........OUT_OF_BOUNDS.Direction === -1');
                        //TODO positionAndScrollTop here
                        //this.positionAndScrollTop(contentElement, OUT_OF_BOUNDS.Amount, transformString);
                    }
                    if (OUT_OF_BOUNDS.Direction === 1) {
                        // handle lst options opt7
                        // position the container with default window offset
                        this.positionAndScrollBottom(contentElement, OUT_OF_BOUNDS.Amount, transformString);
                        console.log('OUT_OF_BOUNDS.Direction === 1');
                    }
                }
                // handle lst options opt8, opt9 --> these are OK.
                if (!OUT_OF_BOUNDS) {
                    this.positionNoScroll(contentElement, CURRENT_POSITION_Y, transformString, size);
                    console.log('!OUT_OF_BOUNDS');
                }
            }
        }
    }
}
