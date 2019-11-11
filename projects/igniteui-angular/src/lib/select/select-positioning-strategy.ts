import { VerticalAlignment, HorizontalAlignment, PositionSettings, Size, Point, Util } from '../services/overlay/utilities';
import { IPositionStrategy } from '../services/overlay/position';
import { fadeOut, fadeIn } from '../animations/main';
import { IgxSelectBase } from './select.common';
import { isIE } from '../core/utils';
import { BaseFitPositionStrategy, ConnectedFit } from '../services/overlay/position/base-fit-position-strategy';
import { DisplayDensity } from '../core/density';

/** @hidden @internal */
export class SelectPositioningStrategy extends BaseFitPositionStrategy implements IPositionStrategy {

    private _selectDefaultSettings = {
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

    // private itemElement = this.getInteractionItemElement();
    // private itemBoundRect = this.itemElement.getBoundingClientRect() as DOMRect;


    // Global variables required for cases of !initialCall (page scroll/overlay repositionAll)
    private global_yOffset = 0;
    private global_xOffset = 0;
    private global_styles: SelectStyles = {};

    position(contentElement: HTMLElement, size: Size, document?: Document, initialCall?: boolean): void {
        // 1st: Check if the interaction item is visible. If NO it should be scrolled in view.
        //      Adjust the new container position with the scrolled amount.
        // 2nd: Try position the container after the item is scrolled.
        // 3rd: If unsuccessful, position the overlay container on TOP/ABOVE or BOTTOM/BELLOW of the input. BOTTOM/BELLOW is preferred.
        // 4th: On page scroll, persist the ddl container position relative to its target element.

        const rects = super.calculateElementRectangles(contentElement);
        // selectFit obj, to be used for both cases of initialCall and !initialCall(page scroll/overlay repositionAll)
        const selectFit: SelectFit = {
            yOffset: this.global_yOffset, xOffset: this.global_xOffset,
            targetRect: rects.targetRect,
            contentElementRect: rects.elementRect,
            styles: this.global_styles
        };

        if (initialCall) {
            selectFit.viewPortRect = Util.getViewportRect(document);

            // Fill in the required selectFit object properties.
            this.calculateVariables(contentElement, selectFit);
            selectFit.viewPortRect = Util.getViewportRect(document);

            // Calculate how much to offset the overlay container.
            this.calculateYoffset(selectFit);
            this.calculateXoffset(selectFit);

            // Scroll if the selected item is not fully visible and adjust the contentElement Y position with the scrolled amount
            this.manageScrollToItem(selectFit);

            super.updateViewPortFit(selectFit);
            if (!selectFit.fitVertical) {
                this.fitInViewport(contentElement, selectFit);
            }
        }
        this.setStyles(contentElement, selectFit, initialCall);
    }

    public itemIsInvisible(selectFit: SelectFit) {
        // selected item is completely invisible
        return Math.round(selectFit.itemElement.getBoundingClientRect().top * 100) / 100 >=
        Math.round(selectFit.dropDownList.getBoundingClientRect().bottom * 100) / 100 ||
        Math.round(selectFit.itemElement.getBoundingClientRect().bottom * 100) / 100 <=
        Math.round(selectFit.dropDownList.getBoundingClientRect().top * 100) / 100 ||
        // selected item is partially invisible at ddl bottom
        Math.round(selectFit.itemElement.getBoundingClientRect().top * 100) / 100 <=
        (selectFit.dropDownList.getBoundingClientRect().bottom * 100) / 100 &&
        Math.round(selectFit.itemElement.getBoundingClientRect().bottom * 100) / 100 >=
        (selectFit.dropDownList.getBoundingClientRect().bottom * 100) / 100;
    }

    private manageScrollToItem(selectFit: SelectFit) {
        // Scroll and compensate the item's container position, when the selected item is not visible.
        if (this.itemIsInvisible(selectFit)) {
            const compensation = this.scrollToItem(selectFit);
            this.compensateYScroll(selectFit, compensation);
        }
    }

    private scrollToItem(selectFit: SelectFit): number {
        const itemPosition = this.calculateScrollPosition(selectFit);
        if (isIE()) {
            setTimeout(() => {
                selectFit.dropDownList.scrollTop = (itemPosition);
            }, 1);
        } else {
            selectFit.dropDownList.scrollTop = (itemPosition);
        }
        return itemPosition;
    }

    private calculateScrollPosition(selectFit: SelectFit): number {
        if (!selectFit.itemElement) { // this check may not be necessary
            return 0;
        }

        const elementRect = selectFit.itemElement.getBoundingClientRect();
        const parentRect = selectFit.dropDownList.getBoundingClientRect();
        const scrollPosition = elementRect.bottom - parentRect.bottom;
        return Math.floor(scrollPosition);
    }

    // This method can be scrambled and combined in manageScrollToItem()
    private compensateYScroll(selectFit: SelectFit, compensation: number ) {
        selectFit.yOffset += compensation;
        this.global_yOffset = selectFit.yOffset;
    }

    // Position the items outer container Below or Above the input.
    fitInViewport(contentElement: HTMLElement, selectFit: SelectFit) {
        // Position Select component's container below target/input as preferred positioning over above target/input
        if (this.canFitBelowInput(selectFit) && this.canFitAboveInput(selectFit) ||
            !this.canFitAboveInput(selectFit)) {
                // Calculate container starting point;
                // TODO: modify the yOffset instead & use one call to super.setStyle
                selectFit.top = selectFit.targetRect.top - selectFit.styles.itemTextToInputTextDiff;

        } else {
            // Position Select component's container above target/input
            // TODO: modify the yOffset instead & use one call to super.setStyle
            selectFit.top = selectFit.targetRect.bottom + selectFit.styles.itemTextToInputTextDiff -
                selectFit.contentElementRect.height;
            }
    }

    protected canFitBelowInput(selectFit: SelectFit): boolean {
        return selectFit.targetRect.top - selectFit.styles.itemTextToInputTextDiff + selectFit.contentElementRect.height <
        selectFit.viewPortRect.bottom;
    }

    protected canFitAboveInput(selectFit: SelectFit): boolean {
            return selectFit.targetRect.bottom + selectFit.styles.itemTextToInputTextDiff -
            selectFit.contentElementRect.height > selectFit.viewPortRect.top;
    }

    protected setStyles(contentElement: HTMLElement, selectFit: SelectFit, initialCall?: boolean) {
        // The Select component's container is about to be displayed. Set its position.
        if (initialCall) {
            contentElement.style.top = `${selectFit.top}px`;
            contentElement.style.left = `${selectFit.left}px`;
        // Page's View Window container is scrolled. Reposition Select's container.
        } else {
            super.setStyle(contentElement, selectFit.targetRect, selectFit.contentElementRect, selectFit);
        }

        contentElement.style.width = `${selectFit.styles.contentElementNewWidth}px`; // manage container based on paddings?
        this.global_styles.contentElementNewWidth = selectFit.styles.contentElementNewWidth;
    }

    private calculateVariables(contentElement: HTMLElement, selectFit: SelectFit) {
        const targetRect = Util.getTargetRect(this.settings);
        const contentElementRect = contentElement.getBoundingClientRect();
        const itemHeight = this.getInteractionItemElement().getBoundingClientRect().height;
        selectFit.styles = {};
        selectFit.itemElement = this.getInteractionItemElement();
        selectFit.itemHeight = itemHeight;
        selectFit.dropDownList = this.select.getListItemsContainer();
        selectFit.targetRect = targetRect;
        selectFit.contentElementRect = contentElementRect;
        selectFit.inputElement = this.select.getEditElement();
        // Calculate input and selected item elements style related variables
        this.calculateStyles(selectFit);
    }

    public calculateStyles(selectFit: SelectFit) {
        const inputFontSize = window.getComputedStyle(selectFit.inputElement).fontSize;
        const numericInputFontSize = parseFloat(inputFontSize);
        const itemFontSize = window.getComputedStyle(selectFit.itemElement).fontSize;
        const numericItemFontSize = parseFloat(itemFontSize);
        const inputTextToInputTop = (selectFit.targetRect.bottom - selectFit.targetRect.top - numericInputFontSize) / 2;
        const itemTextToItemTop = (selectFit.itemHeight - numericItemFontSize) / 2;
         // Adjust for input top padding
        const negateInputPaddings = (
                parseFloat(window.getComputedStyle(selectFit.inputElement).paddingTop) -
                parseFloat(window.getComputedStyle(selectFit.inputElement).paddingBottom)
            ) / 2;
        selectFit.styles.itemTextToInputTextDiff = Math.ceil(itemTextToItemTop - inputTextToInputTop + negateInputPaddings);

        const itemLeftPadding = window.getComputedStyle(selectFit.itemElement).paddingLeft;
        const itemTextIndent = window.getComputedStyle(selectFit.itemElement).textIndent;
        const numericLeftPadding = parseFloat(itemLeftPadding);
        const numericTextIndent = parseFloat(itemTextIndent);

        selectFit.styles.itemTextPadding = numericLeftPadding;
        selectFit.styles.itemTextIndent = numericTextIndent;
        // 24 is the input's toggle ddl icon width
        selectFit.styles.contentElementNewWidth = selectFit.targetRect.width + 24 + numericLeftPadding * 2;
    }

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

    protected calculateYoffset(selectFit: SelectFit) {
        const contentElementTopLeftPointY = selectFit.contentElementRect.top;
        selectFit.yOffset =
            -(selectFit.itemElement.getBoundingClientRect().top - contentElementTopLeftPointY + selectFit.styles.itemTextToInputTextDiff);
        this.global_yOffset = selectFit.yOffset;
    }

    protected calculateXoffset(selectFit: SelectFit) {
        selectFit.xOffset = selectFit.styles.itemTextIndent - selectFit.styles.itemTextPadding;
        this.global_xOffset = selectFit.xOffset;
    }
}

export interface SelectFit extends ConnectedFit {
    contentElementRect?: ClientRect;
    targetRect?: ClientRect;
    viewPortRect?: ClientRect;
    fitHorizontal?: boolean;
    fitVertical?: boolean;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
    xOffset?: number;
    yOffset?: number;

    // New properties
    inputElement?: HTMLElement;
    dropDownList?: HTMLElement;
    itemElement?: HTMLElement;
    itemHeight?: number;
    styles?: SelectStyles;
}

export interface SelectStyles {
    itemTextPadding?: number;
    itemTextIndent?: number;
    itemTextToInputTextDiff?: number;
    contentElementNewWidth?: number;
    displayDensity?: DisplayDensity | string;
    numericLeftPadding?: number;
}

