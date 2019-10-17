import { VerticalAlignment, HorizontalAlignment, PositionSettings, Size, Point, Util } from '../services/overlay/utilities';
import { IPositionStrategy } from '../services/overlay/position';
import { fadeOut, fadeIn } from '../animations/main';
import { IgxSelectBase } from './select.common';
import { isIE } from '../core/utils';
import { BaseFitPositionStrategy, ConnectedFit } from '../services/overlay/position/base-fit-position-strategy';

// TODO Refactor: May replace all sizes taken from elements with the corresponding ClientRect.Bottom-ClientRect.Top
// TODO Refactor: Remove itemHeight and replace it with the corresponding selectFit.targetRect.Bottom - selectFit.targetRect.Top

/** @hidden @internal */
export class SelectPositioningStrategy extends BaseFitPositionStrategy implements IPositionStrategy {

    private _selectDefaultSettings = {
        target: this.select.getEditElement(), // add target so Util.getTargetRect can get details on the input
        horizontalDirection: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Bottom,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Top,
        openAnimation: fadeIn,
        closeAnimation: fadeOut
    };
    public settings: PositionSettings;

    constructor(public select: IgxSelectBase, settings?: PositionSettings) {
        super();
        this.settings = Object.assign({}, this._selectDefaultSettings, settings);
    }

    // private defaultWindowToListOffset = 5;             // in SelectFit
    // private viewPort = Util.getViewportRect(document); // in SelectFit
    // private deltaY: number;
    // private deltaX: number;
    // private itemTextPadding: number;                   // in SelectFit
    // private itemTextIndent: number;                    // in SelectFit
    // private outerContainerBoundRect: DOMRect;          // in SelectFit
    // private itemTextToInputTextDiff: number;           // in SelectFit

    // get a reference to the actual items wrap container
    private headerElementHeight = 0; //TODO expose from select component --> getHeaderContainer()
    private footerElementHeight = 0; //TODO expose from select component --> getFooterContainer()
    private ddl = this.select.getListItemsContainer();
    private itemElement = this.getInteractionItemElement();
    private itemBoundRect = this.itemElement.getBoundingClientRect() as DOMRect;
    private itemHeight = this.itemBoundRect.height;




    position(contentElement: HTMLElement, size: Size, document?: Document, initialCall?: boolean): void {
        // Implement position without scrolling first. For example 3 items no h&f. take input height/itemHeight into account. When ready, implement header and footer checks.

        // 1st method checking isItem fully visible. if need to scroll, check height above item&below and if can be scrolled..scroll.

        // 2nd try position the container after the item is scrolled , taking header and footer into account.

        // 3rd if unsuccessful, position 1st/last item on the input OR container edge(Top OR Bottom)

        // 1 if !isItemFullyVisible() { this.scrollItemInView(calculateHowMuchToScroll())}

        // is it OK to use a method for this and keeps all stuff in Obj, instead of global vars initialized on the go when needed?

        const selectFit: SelectFit = {};
        selectFit.viewPortRect = Util.getViewportRect(document);
        this.calculateVariables(contentElement, selectFit);

        // this._initialSettings = this._initialSettings || Object.assign({}, this.settings);
        // this.settings = Object.assign({}, this._initialSettings);
        // selectFit.viewPortRect = Util.getViewportRect(document);
        // this.updateViewPortFit(selectFit);
        // if (!selectFit.fitHorizontal || !selectFit.fitVertical) {
             this.fitInViewport(contentElement, selectFit);
        // }
    }

        // Choose/call position method based on calculations
        fitInViewport(contentElement: HTMLElement, selectFit: SelectFit) {
            const headerHeight = selectFit.dropDownList.getBoundingClientRect().top - selectFit.contentElementRect.top;
            const footerHeight = selectFit.contentElementRect.bottom - selectFit.dropDownList.getBoundingClientRect().bottom;
            const viewPortRect = selectFit.viewPortRect;
            const ddlHeight = selectFit.dropDownList.getBoundingClientRect().bottom - selectFit.dropDownList.getBoundingClientRect().top;
            const scrollDetails: object = this.getDDLScrollDetails();
           // const ddlScrollHeight = selectFit.dropDownList.scrollHeight; use scrollDetailsObj

           // make a lucky item position
           const itemTopListOffset = selectFit.itemElement.getBoundingClientRect().top - selectFit.dropDownList.getBoundingClientRect().top;
           let CURRENT_POSITION_Y = selectFit.targetRect.top - itemTopListOffset - headerHeight;
           let CURRENT_POSITION_X = selectFit.targetRect.left - selectFit.styles.itemTextPadding + selectFit.styles.itemTextIndent;
           contentElement.style.top = `${CURRENT_POSITION_Y - selectFit.styles.itemTextToInputTextDiff}px`;
           contentElement.style.left = `${CURRENT_POSITION_X}px`;
           contentElement.style.width = `${selectFit.styles.contentElementNewWidth}px`; // manage container based on paddings?
        }

        public positionItemOverInput() {}
        public positionTopOverInput() {}
        public positionBottomOverInput() {}

    private calculateVariables(contentElement: HTMLElement, selectFit: SelectFit) {
        const targetRect = Util.getTargetRect(this.settings);
        const contentElementRect = contentElement.getBoundingClientRect();
        const itemHeight = this.getInteractionItemElement().getBoundingClientRect().height;

        //const selectStyles: SelectStyles = {};
        selectFit.styles = {};
        selectFit.itemElement = this.getInteractionItemElement();
        selectFit.itemHeight = itemHeight;
        selectFit.dropDownList = this.select.getListItemsContainer();
        selectFit.targetRect = targetRect;
        selectFit.contentElementRect = contentElementRect;
        selectFit.inputElement = this._selectDefaultSettings.target;

        // calculate related item-to-input text fit styles
        this.calculateStyles(selectFit);

    }

    public calculateStyles(selectFit: SelectFit) {
        const inputFontSize = window.getComputedStyle(selectFit.inputElement).fontSize;
        const numericInputFontSize = parseInt(inputFontSize.slice(0, inputFontSize.indexOf('p')), 10) || 0;
        const itemFontSize = window.getComputedStyle(selectFit.itemElement).fontSize;
        const numericItemFontSize = parseInt(itemFontSize.slice(0, itemFontSize.indexOf('p')), 10) || 0;
        const inputTextToInputTop = (selectFit.targetRect.bottom - selectFit.targetRect.top - numericInputFontSize) / 2;
        const itemTextToItemTop = (selectFit.itemHeight - numericItemFontSize) / 2;

        selectFit.styles.itemTextToInputTextDiff = itemTextToItemTop - inputTextToInputTop;

        const selectItemPaddingHorizontal = 24; //maybe get this from styles directly instead of hardoding it //16px/20px/24px based on DisplayDensty // TODO: Get it dinamicaly from styles
        const itemLeftPadding = window.getComputedStyle(selectFit.itemElement).paddingLeft;
        const itemTextIndent = window.getComputedStyle(selectFit.itemElement).textIndent;
        const numericLeftPadding = parseInt(itemLeftPadding.slice(0, itemLeftPadding.indexOf('p')), 10) || 0;
        const numericTextIndent = parseInt(itemTextIndent.slice(0, itemTextIndent.indexOf('r')), 10) || 0;

        selectFit.styles.itemTextPadding = numericLeftPadding;
        selectFit.styles.itemTextIndent = numericTextIndent;
        selectFit.styles.contentElementNewWidth = selectFit.targetRect.width + 24 + selectItemPaddingHorizontal * 2; // 24 is the input dd icon width
        //#region TODO positioning related so compute elsewhere //maybe in positionItemOverInput as this is only related to match exact text
            // contentElement.style.left += `${START.X - numericLeftPadding - numericTextIndent}px`;
            // contentElement.style.width = inputRect.width + 24 + selectItemPaddingHorizontal * 2 + 'px';
            // this.deltaX = START.X - numericLeftPadding - numericTextIndent;
            // const currentScroll = this.getItemsOutOfView(contentElement, itemHeight)['currentScroll'];
            // const remainingScroll = this.getItemsOutOfView(contentElement, itemHeight)['remainingScroll'];
        //#endregion
    }

    //TODO Update this.select.getListItemsContainer() to use selectFit.dropDownList
    private getDDLScrollDetails(): {
        'currentScroll': number,
        'remainingScroll': number,
        'scrollHeight': number
    } {
        if (this.select.getListItemsContainer().scrollHeight <= this.select.getListItemsContainer().clientHeight) {
            return {
                'currentScroll': 0,
                'remainingScroll': 0,
                'scrollHeight': this.select.getListItemsContainer().scrollHeight
            };
        }
        const currentScroll = this.ddl.scrollTop;
        const remainingScroll = this.select.items.length * this.itemHeight - currentScroll - this.ddl.getBoundingClientRect().height;
        return {
            'currentScroll': currentScroll,
            'remainingScroll': remainingScroll,
            'scrollHeight': this.select.getListItemsContainer().scrollHeight
        };
    }

    private isItemFullyVisible(): boolean {
        // itemTop&&itemBottom are in the scrolled area

        // this.ddl.getBoundingClientRect().height;
        //const itemElement = this.getInteractionItemElement();
        //const itemBoundRect = this.itemElement.getBoundingClientRect() as DOMRect;
        //const itemHeight = itemBoundRect.height;
        // currentScroll
        // remainingScroll

        if (this.itemBoundRect.top >= this.getDDLScrollDetails()['currentScroll'] &&
            this.itemBoundRect.bottom <= this.getDDLScrollDetails()['remainingScroll']) {
           return true;
        } else {
            return false;
        }
    }

    private calculateHowMuchToScroll() {

    }

    // private scrollItemInView(getDDLScrollDetails(itemHeight)) {

    // }

    // private canScrollItemInView() {

    // }

    private getInteractionItemElement(): HTMLElement {
        let itemElement;
        if (this.select.selectedItem) {
            itemElement = this.select.selectedItem.element.nativeElement;
            // D.P. Feb 22 2019, #3921 Force item scroll before measuring in IE11, due to base scrollToItem delay
            if (isIE()) {
                this.select.getListItemsContainer().scrollTop = this.select.calculateScrollPosition(this.select.selectedItem);
            }
        } else {
            itemElement = this.select.getFirstItemElement();
        }
        return itemElement;
    }


    protected calculateLeft(
        targetRect: ClientRect,
        elementRect: ClientRect,
        startPoint: HorizontalAlignment,
        direction: HorizontalAlignment): number {
        return targetRect.right + targetRect.width * startPoint + elementRect.width * direction;
    }

    /**
     * Calculates the position of the top border of the element if it gets positioned
     * with provided position settings related to the target
     * @param targetRect Rectangle of the target where element is attached
     * @param elementRect Rectangle of the element
     * @param startPoint Start point of the target
     * @param direction Direction in which to show the element
     */
    protected calculateTop(
        targetRect: ClientRect, elementRect: ClientRect, startPoint: VerticalAlignment, direction: VerticalAlignment): number {
        return targetRect.bottom + targetRect.height * startPoint + elementRect.height * direction;
    }
}

export interface SelectFit {
    contentElementRect?: ClientRect;
    targetRect?: ClientRect;  // input rectangle
    viewPortRect?: ClientRect;
    fitHorizontal?: boolean;
    fitVertical?: boolean;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
    inputElement?: HTMLElement;
   // inputRect: DOMRect; //this is targetRect?: ClientRect;
    dropDownList?: HTMLElement;
    defaultWindowToListOffset?: 5;

    itemElement?: HTMLElement;
    itemHeight?: number;
    styles?: SelectStyles;


}

export interface SelectStyles {
    // numericInputFontSize: number; // not needed
    // numericItemFontSize: number;  // not needed

    itemTextPadding?: number;
    itemTextIndent?: number;
    itemTextToInputTextDiff?: number;
    contentElementNewWidth?: number;
}

