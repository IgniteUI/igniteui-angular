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

    /** @inheritdoc */
    public settings: PositionSettings;

    constructor(public select: IgxSelectBase, settings?: PositionSettings) {
        super();
        this.settings = Object.assign({}, this._selectDefaultSettings, settings);
    }

    // Global variables required for cases of !initialCall (page scroll/overlay repositionAll)
    private global_yOffset = 0;
    private global_xOffset = 0;
    private global_styles: SelectStyles = {};

    /** @inheritdoc */
    position(contentElement: HTMLElement, size: Size, document?: Document, initialCall?: boolean): void {
        const rects = super.calculateElementRectangles(contentElement);
        // selectFit obj, to be used for both cases of initialCall and !initialCall(page scroll/overlay repositionAll)
        const selectFit: SelectFit = {
            verticalOffset: this.global_yOffset,
            horizontalOffset: this.global_xOffset,
            targetRect: rects.targetRect,
            contentElementRect: rects.elementRect,
            styles: this.global_styles,
            scrollContainer: this.select.scrollContainer,
            scrollContainerRect: this.select.scrollContainer.getBoundingClientRect()
        };

        if (initialCall) {
            // Fill in the required selectFit object properties.
            selectFit.viewPortRect = Util.getViewportRect(document);
            selectFit.itemElement = this.getInteractionItemElement();
            selectFit.itemRect = selectFit.itemElement.getBoundingClientRect();

            // Calculate input and selected item elements style related variables
            selectFit.styles = this.calculateStyles(selectFit);

            selectFit.scrollAmount = this.calculateScrollPosition(selectFit);
            // Calculate how much to offset the overlay container.
            this.calculateYoffset(selectFit);
            this.calculateXoffset(selectFit);

            super.updateViewPortFit(selectFit);
            // container does not fit in viewPort and is out on Top or Bottom
            if (selectFit.fitVertical.back < 0 || selectFit.fitVertical.forward < 0 ) {
                this.fitInViewport(contentElement, selectFit);
            }
            this.select.scrollContainer.scrollTop = selectFit.scrollAmount;
        }
        this.setStyles(contentElement, selectFit);
    }

    /**
     * Calculate selected item scroll position.
     */
    public calculateScrollPosition(selectFit: SelectFit): number {
        const itemElementRect = selectFit.itemRect;
        const scrollContainer = selectFit.scrollContainer;
        const scrollContainerRect = selectFit.scrollContainerRect;
        const scrollDelta = scrollContainerRect.top - itemElementRect.top;
        let scrollPosition = scrollContainer.scrollTop - scrollDelta;

        const dropDownHeight = scrollContainer.clientHeight;
        scrollPosition -= dropDownHeight / 2;
        scrollPosition += itemElementRect.height / 2;

        return Math.floor(Math.min(Math.max(0, scrollPosition), scrollContainer.scrollHeight - scrollContainerRect.height));
    }

    /**
     * Position the items outer container so selected item text is positioned over input text and if header
     * And/OR footer - both header/footer are visible
     * @param selectFit selectFit to use for computation.
     */
    protected fitInViewport(contentElement: HTMLElement, selectFit: SelectFit) {
        const footer = selectFit.scrollContainer.getBoundingClientRect().bottom - selectFit.contentElementRect.bottom;
        const header = selectFit.scrollContainer.getBoundingClientRect().top - selectFit.contentElementRect.top;
        const lastItemFitSize = selectFit.targetRect.bottom + selectFit.styles.itemTextToInputTextDiff - footer;
        const firstItemFitSize = selectFit.targetRect.top - selectFit.styles.itemTextToInputTextDiff - header;
        // out of viewPort on Top
        if (selectFit.fitVertical.back < 0) {
            const possibleScrollAmount = selectFit.scrollContainer.scrollHeight -
                selectFit.scrollContainer.getBoundingClientRect().height - selectFit.scrollAmount;
            if (possibleScrollAmount + selectFit.fitVertical.back > 0 && firstItemFitSize > selectFit.viewPortRect.top) {
                selectFit.scrollAmount -= selectFit.fitVertical.back;
                selectFit.verticalOffset -= selectFit.fitVertical.back;
                this.global_yOffset = selectFit.verticalOffset;
            } else {
                selectFit.verticalOffset = 0 ;
                this.global_yOffset = 0;
            }
        // out of viewPort on Bottom
        } else if (selectFit.fitVertical.forward < 0) {
            if (selectFit.scrollAmount + selectFit.fitVertical.forward > 0 && lastItemFitSize < selectFit.viewPortRect.bottom) {
                selectFit.scrollAmount += selectFit.fitVertical.forward;
                selectFit.verticalOffset += selectFit.fitVertical.forward;
                this.global_yOffset = selectFit.verticalOffset;
            } else {
                selectFit.verticalOffset = -selectFit.contentElementRect.height + selectFit.targetRect.height;
                this.global_yOffset = selectFit.verticalOffset;
            }
        }
    }

    /**
     * Sets element's style which effectively positions the provided element
     * @param element Element to position
     * @param selectFit selectFit to use for computation.
     * @param initialCall should be true if this is the initial call to the position method calling setStyles
     */
    protected setStyles(contentElement: HTMLElement, selectFit: SelectFit) {
        super.setStyle(contentElement, selectFit.targetRect, selectFit.contentElementRect, selectFit);
        contentElement.style.width = `${selectFit.styles.contentElementNewWidth}px`; // manage container based on paddings?
        this.global_styles.contentElementNewWidth = selectFit.styles.contentElementNewWidth;
    }

    /**
     * Calculate the necessary input and selected item styles to be used for positioning item text over input text.
     * Calculate & Set default items container width.
     * @param selectFit selectFit to use for computation.
     */
    private calculateStyles(selectFit: SelectFit): SelectStyles  {
        const styles: SelectStyles = {};
        const inputElementStyles = window.getComputedStyle(this.settings.target as Element);
        const itemElementStyles = window.getComputedStyle(selectFit.itemElement);
        const numericInputFontSize = parseFloat(inputElementStyles.fontSize);
        const itemFontSize = itemElementStyles.fontSize;
        const numericItemFontSize = parseFloat(itemFontSize);
        const inputTextToInputTop = (selectFit.targetRect.bottom - selectFit.targetRect.top - numericInputFontSize) / 2;
        const itemTextToItemTop = (selectFit.itemRect.height - numericItemFontSize) / 2;
         // Adjust for input top padding
        const negateInputPaddings = (
                parseFloat(inputElementStyles.paddingTop) -
                parseFloat(inputElementStyles.paddingBottom)
            ) / 2;
        styles.itemTextToInputTextDiff = Math.ceil(itemTextToItemTop - inputTextToInputTop + negateInputPaddings);

        const itemLeftPadding = itemElementStyles.paddingLeft;
        const itemTextIndent = itemElementStyles.textIndent;
        const numericLeftPadding = parseFloat(itemLeftPadding);
        const numericTextIndent = parseFloat(itemTextIndent);

        styles.itemTextPadding = numericLeftPadding;
        styles.itemTextIndent = numericTextIndent;
        // 24 is the input's toggle ddl icon width
        styles.contentElementNewWidth = selectFit.targetRect.width + 24 + numericLeftPadding * 2;

        return styles;
    }

    /**
     * Obtain the selected item if there is such one or otherwise use the first one
     */
    public getInteractionItemElement(): HTMLElement {
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

    /**
     * Calculate how much to offset the overlay container for Y-axis.
     */
    private calculateYoffset(selectFit: SelectFit) {
        selectFit.verticalOffset = -(selectFit.itemRect.top - selectFit.contentElementRect.top +
            selectFit.styles.itemTextToInputTextDiff - selectFit.scrollAmount);
        this.global_yOffset = selectFit.verticalOffset;
    }

    /**
     * Calculate how much to offset the overlay container for X-axis.
     */
    private calculateXoffset(selectFit: SelectFit) {
        selectFit.horizontalOffset = selectFit.styles.itemTextIndent - selectFit.styles.itemTextPadding;
        this.global_xOffset = selectFit.horizontalOffset;
    }
}

/** @hidden */
export interface SelectFit extends ConnectedFit {
    itemElement?: HTMLElement;
    scrollContainer: HTMLElement;
    scrollContainerRect: ClientRect;
    itemRect?: ClientRect;
    styles?: SelectStyles;
    scrollAmount?: number;
}

/** @hidden */
export interface SelectStyles {
    itemTextPadding?: number;
    itemTextIndent?: number;
    itemTextToInputTextDiff?: number;
    contentElementNewWidth?: number;
    numericLeftPadding?: number;
}
