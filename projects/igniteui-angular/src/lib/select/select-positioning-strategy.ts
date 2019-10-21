// tslint:disable: max-line-length

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
       // target: this.select.getEditElement(), // add target so Util.getTargetRect can get details on the input // Set Point after calculations
        // target: (this.select.getEditElement().getBoundingClientRect().bottom -
        //         this.select.getEditElement().getBoundingClientRect().top) / 2,
        // target: this.select.getEditElement().getBoundingClientRect().top + ((this.select.getEditElement().getBoundingClientRect().bottom -
        // this.select.getEditElement().getBoundingClientRect().top) / 2),
        target: this.select.getEditElement().getBoundingClientRect().top, // ** Use top target here and top item for positioning bellow **
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
    // private ddl = this.select.getListItemsContainer();          // in SelectFit
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
        if (initialCall) {
            const selectFit: SelectFit = {};
            selectFit.viewPortRect = Util.getViewportRect(document);
            this.calculateVariables(contentElement, selectFit);

            // this._initialSettings = this._initialSettings || Object.assign({}, this.settings);
            // this.settings = Object.assign({}, this._initialSettings);
            selectFit.viewPortRect = Util.getViewportRect(document);
           // this.updateViewPortFit(selectFit); //use inherited method instead
           // calculate/pass yOffset with
            this.calculateYoffset(selectFit);
            this.calculateXoffset(selectFit);
            super.updateViewPortFit(selectFit);
            if (!selectFit.fitHorizontal || !selectFit.fitVertical) {
                 // this.fitInViewport(contentElement, selectFit);
            }
            this.setStyles(contentElement, selectFit);
        }
    }

        // Choose/call position method based on calculations
        fitInViewport(contentElement: HTMLElement, selectFit: SelectFit) {
        //#region InitialImpl
            let canPositionItemOverInput: boolean;   //where best put these
            let canPositionTopOverInput: boolean;    //where best put these
            let canPositionBottomOverInput: boolean; //where best put these
            const headerHeight = selectFit.dropDownList.getBoundingClientRect().top - selectFit.contentElementRect.top; //calculateTop()
            const footerHeight = selectFit.contentElementRect.bottom - selectFit.dropDownList.getBoundingClientRect().bottom;
            const viewPortRect = selectFit.viewPortRect;
            const ddlHeight = selectFit.dropDownList.getBoundingClientRect().bottom - selectFit.dropDownList.getBoundingClientRect().top;
            const scrollDetails: object = this.getDDLScrollDetails(selectFit.dropDownList);
            // const ddlScrollHeight = selectFit.dropDownList.scrollHeight; use scrollDetailsObj

            // make a lucky item position
            const itemTopListOffset = selectFit.itemElement.getBoundingClientRect().top - selectFit.dropDownList.getBoundingClientRect().top;//calculateTop()
            let CURRENT_POSITION_Y = selectFit.targetRect.top - itemTopListOffset - headerHeight;                                     //calculateLeft()
            let CURRENT_POSITION_X = selectFit.targetRect.left - selectFit.styles.itemTextPadding + selectFit.styles.itemTextIndent;  //calculateTop()
            this.setStyles(contentElement, selectFit); //OR directly use the SelectFit to set these in there&not pass as method parameters

            // TODO more like what is in the base fitInViewPort method
        //#endregion
        }

        protected setStyles(contentElement: HTMLElement, selectFit: SelectFit) {
            if (this.canPositionItemOverInput()) {
                // contentElement.style.top = `${CURRENT_POSITION_Y - selectFit.styles.itemTextToInputTextDiff}px`;
                // contentElement.style.left = `${CURRENT_POSITION_X}px`;
                // contentElement.style.width = `${selectFit.styles.contentElementNewWidth}px`; // manage container based on paddings?
                contentElement.style.top = `${selectFit.top}px`;
                contentElement.style.left = `${selectFit.left}px`;
                contentElement.style.width = `${selectFit.styles.contentElementNewWidth}px`; // manage container based on paddings?
            } else if (this.canPositionTopOverInput()) {
                //TODO position header over input
            } else {
                //TODO position footer over input
            }
        }
        public canPositionItemOverInput(): boolean { return true; }   // OR use flags
        public canPositionTopOverInput(): boolean { return true; }    // OR use flags
        public canPositionBottomOverInput(): boolean { return true; } // OR use flags

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
       // selectFit.inputElement = this._selectDefaultSettings.target; // Get TODO as Point target is used update to getEditElement();
        selectFit.inputElement = this.select.getEditElement();
        // calculate related item-to-input text fit styles
        this.calculateStyles(selectFit);

    }

    public calculateStyles(selectFit: SelectFit) {
        const inputFontSize = window.getComputedStyle(selectFit.inputElement).fontSize;
        const numericInputFontSize = parseFloat(inputFontSize);
        const itemFontSize = window.getComputedStyle(selectFit.itemElement).fontSize;
        const numericItemFontSize = parseFloat(itemFontSize);
        const inputTextToInputTop = (selectFit.targetRect.bottom - selectFit.targetRect.top - numericInputFontSize) / 2;
        const itemTextToItemTop = (selectFit.itemHeight - numericItemFontSize) / 2;

        selectFit.styles.itemTextToInputTextDiff = itemTextToItemTop - inputTextToInputTop;

        const selectItemPaddingHorizontal = 24; //maybe get this from styles directly instead of hardoding it //16px/20px/24px based on DisplayDensty // TODO: Get it dinamicaly from styles
        const itemLeftPadding = window.getComputedStyle(selectFit.itemElement).paddingLeft;
        const itemTextIndent = window.getComputedStyle(selectFit.itemElement).textIndent;
        const numericLeftPadding = parseFloat(itemLeftPadding);
        const numericTextIndent = parseFloat(itemTextIndent);

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

    //DONE 1)Update this.select.getListItemsContainer() to use selectFit.dropDownList 2)Update this.ddl to selectFit.dropDownList
    private getDDLScrollDetails(dropDownList: HTMLElement): {
        'currentScroll': number,
        'remainingScroll': number,
        'scrollHeight': number
    } {
        if (dropDownList.scrollHeight <= dropDownList.clientHeight) {
            return {
                'currentScroll': 0,
                'remainingScroll': 0,
                'scrollHeight': dropDownList.scrollHeight
            };
        }
        const currentScroll = dropDownList.scrollTop;
        const remainingScroll = this.select.items.length * this.itemHeight - currentScroll - dropDownList.getBoundingClientRect().height;
        return {
            'currentScroll': currentScroll,
            'remainingScroll': remainingScroll,
            'scrollHeight': dropDownList.scrollHeight
        };
    }

    // TODO may pass only the dropDownList instead of the whole selectFit Obj
    private isItemFullyVisible(selectFit: SelectFit): boolean {
        // itemTop&&itemBottom are in the scrolled area

        // selectFit.dropDownList.getBoundingClientRect().height;
        //const itemElement = this.getInteractionItemElement();
        //const itemBoundRect = this.itemElement.getBoundingClientRect() as DOMRect;
        //const itemHeight = itemBoundRect.height;
        // currentScroll
        // remainingScroll

        const dropDownList = selectFit.dropDownList;
        if (this.itemBoundRect.top >= this.getDDLScrollDetails(dropDownList)['currentScroll'] &&
            this.itemBoundRect.bottom <= this.getDDLScrollDetails(dropDownList)['remainingScroll']) {
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

    // // OVERRIDE
    // protected updateViewPortFit(selectFit: SelectFit) {
    //     selectFit.left = this.calculateLeft(selectFit);
    //     selectFit.right = selectFit.left + selectFit.contentElementRect.width;
    //     selectFit.fitHorizontal =
    //         selectFit.viewPortRect.left < selectFit.left && selectFit.right < selectFit.viewPortRect.right;

    //     selectFit.top = this.calculateTop(selectFit);
    //     selectFit.bottom = selectFit.top + selectFit.contentElementRect.height;
    //     selectFit.fitVertical =
    //         selectFit.viewPortRect.top < selectFit.top && selectFit.bottom < selectFit.viewPortRect.bottom;
    // }

    // // OVERRIDE - use selectFit param only
    // protected calculateLeft(selectFit: SelectFit): number {
    //     return selectFit.targetRect.left - selectFit.styles.itemTextPadding + selectFit.styles.itemTextIndent;
    // }
    // // OVERRIDE
    // protected calculateTop(selectFit: SelectFit): number {
    //     // TODO maybe handle scroll cases here as well (calculate how much to scroll(+direction), scroll, and adjust Y(direction))
    //     const itemTopListOffset = selectFit.itemElement.getBoundingClientRect().top - selectFit.dropDownList.getBoundingClientRect().top;
    //     const headerHeight = selectFit.dropDownList.getBoundingClientRect().top - selectFit.contentElementRect.top;
    //     return selectFit.targetRect.top - itemTopListOffset - headerHeight - selectFit.styles.itemTextToInputTextDiff; // OR + itemTextToInputTextDiff if positionAndScrollTop
    // }

    // This method is basically the above OVERRIDE protected calculateTop(selectFit: SelectFit): number
    protected calculateYoffset(selectFit: SelectFit) {
        // itemToContainerHeight + header + calculateForTheScrollInDDL
        const headerHeight = selectFit.dropDownList.getBoundingClientRect().top - selectFit.contentElementRect.top;
        const itemMiddleLeftPointY = selectFit.itemElement.getBoundingClientRect().top + (selectFit.itemHeight / 2);
        const ddlTopLeftPointY = selectFit.dropDownList.getBoundingClientRect().top;    // 1)Use all elements in calc
        // selectFit.yOffset =  itemMiddleLeftPointY - ddlTopLeftPointY - headerHeight;  // 1)Use all elements in calc
        const contentElementTopLeftPointY = selectFit.contentElementRect.top;           ///6 2)Use only container inst of (ddl+header)
        // selectFit.yOffset =  -(itemMiddleLeftPointY - contentElementTopLeftPointY + selectFit.styles.itemTextToInputTextDiff) + 21;     //2)Use only container inst of (ddl+header)
        // 21.0625 diff????
        //compact=16.266(14fix? OK) (itemHeight28) /cosy=19.938(16fix OK) (itemHeight32)/ comfortable=25(21fix OK) (itemHeight40) /

        selectFit.yOffset =  -(selectFit.itemElement.getBoundingClientRect().top - contentElementTopLeftPointY + selectFit.styles.itemTextToInputTextDiff);     //2)Use only container inst of (ddl+header) + // ** Use top target above and top item for positioning here **
    }

    // This method is basically the above OVERRIDE protected calculateLeft(selectFit: SelectFit): number
    protected calculateXoffset(selectFit: SelectFit) {
        // selectFit.xOffset = -(selectFit.targetRect.left - selectFit.targetRect.left - selectFit.styles.itemTextPadding + selectFit.styles.itemTextIndent);                                                        //1) The whole calculation
        selectFit.xOffset = selectFit.styles.itemTextIndent - selectFit.styles.itemTextPadding;  //2) partial calculation. itemTextIndent may need to be with (-)
    }
}

export interface SelectFit extends ConnectedFit {
    contentElementRect?: ClientRect;
    targetRect?: ClientRect;  // input rectangle
    viewPortRect?: ClientRect;
    fitHorizontal?: boolean;
    fitVertical?: boolean;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
    xOffset?: number;
    yOffset?: number;

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

