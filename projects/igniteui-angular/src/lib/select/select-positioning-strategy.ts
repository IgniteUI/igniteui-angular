import { VerticalAlignment, HorizontalAlignment, PositionSettings, Size, Util, ConnectedFit  } from '../services/overlay/utilities';
import { IPositionStrategy } from '../services/overlay/position';
import { fadeOut, fadeIn } from '../animations/main';
import { IgxSelectBase } from './select.common';
import { isIE } from '../core/utils';
import { BaseFitPositionStrategy } from '../services/overlay/position/base-fit-position-strategy';

/** @hidden @internal */
export class SelectPositioningStrategy extends BaseFitPositionStrategy implements IPositionStrategy {

    private _selectDefaultSettings = {
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
            verticalOffset: this.global_yOffset,
            horizontalOffset: this.global_xOffset,
            targetRect: rects.targetRect,
            contentElementRect: rects.elementRect,
            styles: this.global_styles
        };

        if (initialCall) {
            selectFit.viewPortRect = Util.getViewportRect(document);

            // Fill in the required selectFit object properties.
            this.calculateVariables(selectFit);
            // Calculate input and selected item elements style related variables
            selectFit.styles = this.calculateStyles(selectFit);
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

    private manageScrollToItem(selectFit: SelectFit) {
        // Scroll and compensate the item's container position, when the selected item is not visible.
        // selected item is completely invisible
            const itemTop = Math.round(selectFit.itemRect.top * 100) / 100;
            const itemBottom = Math.round(selectFit.itemRect.bottom * 100) / 100;
            const scrollContainerRect = this.select.scrollContainer.getBoundingClientRect();
            const scrollContainerBottom = Math.round(scrollContainerRect.bottom * 100) / 100;
            const scrollContainerTop = Math.round(scrollContainerRect.top * 100) / 100;
            const itemIsNotCompletelyVisible =
                itemTop >= scrollContainerBottom || itemBottom <= scrollContainerTop ||
                // selected item is partially invisible at ddl bottom
                itemTop <= scrollContainerBottom && itemBottom >= scrollContainerBottom;
        if (itemIsNotCompletelyVisible) {
            const scrollAmount = selectFit.itemElement ? Math.floor(itemBottom - scrollContainerBottom) : 0;
            this.scrollToItem(scrollAmount);
            selectFit.verticalOffset += scrollAmount;
            this.global_yOffset = selectFit.verticalOffset;
        }
    }

    private scrollToItem(scrollAmount: number): number {
        if (isIE()) {
            setTimeout(() => {
                this.select.scrollContainer.scrollTop = (scrollAmount);
            }, 1);
        } else {
            this.select.scrollContainer.scrollTop = (scrollAmount);
        }
        return scrollAmount;
    }

    private calculateScrollPosition(selectFit: SelectFit): number {
        if (!selectFit.itemElement) { // this check may not be necessary
            return 0;
        }

        const elementRect = selectFit.itemRect;
        const parentRect = this.select.scrollContainer.getBoundingClientRect();
        const scrollPosition = elementRect.bottom - parentRect.bottom;
        return Math.floor(scrollPosition);
    }

    // Position the items outer container Below or Above the input.
    fitInViewport(contentElement: HTMLElement, selectFit: SelectFit) {
        // Position Select component's container below target/input as preferred positioning over above target/input
        const canFitBelowInput = selectFit.targetRect.top - selectFit.styles.itemTextToInputTextDiff + selectFit.contentElementRect.height <
            selectFit.viewPortRect.bottom;
        const canFitAboveInput = selectFit.targetRect.bottom + selectFit.styles.itemTextToInputTextDiff -
            selectFit.contentElementRect.height > selectFit.viewPortRect.top;
        // Position Select component's container below target/input as preferred positioning over above target/input
        if (canFitBelowInput || !canFitAboveInput) {
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

    private calculateVariables(selectFit: SelectFit) {
        selectFit.itemRect = this.getInteractionItemElement().getBoundingClientRect();
        selectFit.itemElement = this.getInteractionItemElement();
      }

    public calculateStyles(selectFit: SelectFit): SelectStyles  {
        const styles: SelectStyles = {};
        const inputFontSize = window.getComputedStyle(this.settings.target as Element).fontSize;
        const numericInputFontSize = parseFloat(inputFontSize);
        const itemFontSize = window.getComputedStyle(selectFit.itemElement).fontSize;
        const numericItemFontSize = parseFloat(itemFontSize);
        const inputTextToInputTop = (selectFit.targetRect.bottom - selectFit.targetRect.top - numericInputFontSize) / 2;
        const itemTextToItemTop = (selectFit.itemRect.height - numericItemFontSize) / 2;
         // Adjust for input top padding
        const negateInputPaddings = (
                parseFloat(window.getComputedStyle(this.settings.target as Element).paddingTop) -
                parseFloat(window.getComputedStyle(this.settings.target as Element).paddingBottom)
            ) / 2;
        styles.itemTextToInputTextDiff = Math.ceil(itemTextToItemTop - inputTextToInputTop + negateInputPaddings);

        const itemLeftPadding = window.getComputedStyle(selectFit.itemElement).paddingLeft;
        const itemTextIndent = window.getComputedStyle(selectFit.itemElement).textIndent;
        const numericLeftPadding = parseFloat(itemLeftPadding);
        const numericTextIndent = parseFloat(itemTextIndent);

        styles.itemTextPadding = numericLeftPadding;
        styles.itemTextIndent = numericTextIndent;
        // 24 is the input's toggle ddl icon width
        styles.contentElementNewWidth = selectFit.targetRect.width + 24 + numericLeftPadding * 2;

        return styles;
    }

    private getInteractionItemElement(): HTMLElement {
        let itemElement;
        if (this.select.selectedItem) {
            itemElement = this.select.selectedItem.element.nativeElement;
            // D.P. Feb 22 2019, #3921 Force item scroll before measuring in IE11, due to base scrollToItem delay
            if (isIE()) {
                this.select.scrollContainer.scrollTop = this.select.calculateScrollPosition(this.select.selectedItem);
            }
        } else {
            itemElement = this.select.getFirstItemElement();
        }
        return itemElement;
    }

    protected calculateYoffset(selectFit: SelectFit) {
        const contentElementTopLeftPointY = selectFit.contentElementRect.top;
        selectFit.verticalOffset =
            -(selectFit.itemRect.top - contentElementTopLeftPointY + selectFit.styles.itemTextToInputTextDiff);
        this.global_yOffset = selectFit.verticalOffset;
    }

    protected calculateXoffset(selectFit: SelectFit) {
        selectFit.horizontalOffset = selectFit.styles.itemTextIndent - selectFit.styles.itemTextPadding;
        this.global_xOffset = selectFit.horizontalOffset;
    }
}

export interface SelectFit extends ConnectedFit {
    itemElement?: HTMLElement;
    itemRect?: ClientRect;
    styles?: SelectStyles;
}

export interface SelectStyles {
    itemTextPadding?: number;
    itemTextIndent?: number;
    itemTextToInputTextDiff?: number;
    contentElementNewWidth?: number;
    numericLeftPadding?: number;
}

