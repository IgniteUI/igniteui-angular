import { filter, fromEvent, sampleTime, Subscription } from 'rxjs';
import { IgxQueryBuilderTreeComponent } from './query-builder-tree.component';
import { ElementRef, Inject, Injectable } from '@angular/core';
import { ExpressionGroupItem, ExpressionItem, ExpressionOperandItem, QueryBuilderSelectors } from './query-builder.common';
import { IgxChipComponent } from '../chips/chip.component';

const DEFAULT_SET_Z_INDEX_DELAY = 10;
const Z_INDEX_TO_SET = 10010; //overlay z-index is 10005

/** @hidden @internal */
@Injectable()
export class IgxQueryBuilderDragService {
    constructor(
        @Inject(IgxQueryBuilderTreeComponent)
        private _queryBuilderTreeComponent: IgxQueryBuilderTreeComponent,
        private _queryBuilderTreeComponentElRef: ElementRef,
        @Inject(IgxQueryBuilderTreeComponent)
        private _deleteExpression: (expressionItem: ExpressionItem) => void,
        @Inject(IgxQueryBuilderTreeComponent)
        private _focusChipAfterDrag: (index: number) => void,
    ) { }

    /** The ExpressionItem that's actually the drop ghost's content */
    public dropGhostExpression: ExpressionItem;
    public isKeyboardDrag: boolean;
    private _sourceExpressionItem: ExpressionItem;
    private _sourceElement: HTMLElement;
    private _targetExpressionItem: ExpressionItem;
    private _dropUnder: boolean;
    private _ghostChipMousemoveSubscription$: Subscription;
    private _keyboardSubscription$: Subscription;
    private _keyDragCurrentIndex: number = 0;
    private _keyDragInitialIndex: number = 0;
    private _isKeyDragsFirstMove: boolean = true;
    /** Stores a flat ordered list of possible drop locations as Tuple <[targetExpression, dropUnder]>, while performing the keyboard drag&drop */
    private _possibleDropLocations: Array<[ExpressionItem, boolean]>;
    private _timeoutId: any;


    /** Get the dragged ghost as a HTMLElement*/
    private get getDragGhostElement(): HTMLElement {
        return (document.querySelector('.igx-chip__ghost[ghostclass="igx-chip__ghost"]') as HTMLElement);
    }

    /** Get the drop ghost chip component */
    private get getDropGhostElement(): IgxChipComponent {
        return this._queryBuilderTreeComponent.expressionsChips.find(x => x.data === this.dropGhostExpression);
    }

    private get getMainExpressionTree(): HTMLElement {
        return this._queryBuilderTreeComponentElRef.nativeElement.querySelector(`.${QueryBuilderSelectors.FILTER_TREE}`);
    }

    /** When chip is picked up for dragging
     * 
     * @param sourceDragElement The HTML element of the chip that's been dragged
     * @param sourceExpressionItem The expressionItem of the chip that's been dragged
     * @param isKeyboardDrag If it's a mouse drag or keyboard reorder
     * 
    */
    public onMoveStart(sourceDragElement: HTMLElement, sourceExpressionItem: ExpressionItem, isKeyboardDrag: boolean): void {
        this.resetDragAndDrop(true);
        this._queryBuilderTreeComponent._expressionTreeCopy = this._queryBuilderTreeComponent._expressionTree;
        this.isKeyboardDrag = isKeyboardDrag;
        this._sourceExpressionItem = sourceExpressionItem;
        this._sourceElement = sourceDragElement;

        this.listenToKeyboard();

        if (!this.isKeyboardDrag) {
            //TODO display-none should be done by angular?
            this._sourceElement.style.display = 'none';
            this.setDragGhostZIndex();
        }
    }

    /** When dragged chip is let go outside a proper drop zone */
    public onMoveEnd(): void {
        if (!this._sourceElement || !this._sourceExpressionItem) {
            return;
        }

        if (this.dropGhostExpression) {
            //If there is a ghost chip presented to the user, execute drop
            this.onChipDropped();
        } else {
            this.resetDragAndDrop(true);
        }

        this._ghostChipMousemoveSubscription$?.unsubscribe();
        this._keyboardSubscription$?.unsubscribe();
    }

    /** When mouse drag enters a chip's area
     * @param targetDragElement The HTML element of the drop area chip that's been dragged to
     * @param targetExpressionItem The expressionItem of the drop area chip that's been dragged to
    */
    public onChipEnter(targetDragElement: HTMLElement, targetExpressionItem: ExpressionItem) {
        if (!this._sourceElement || !this._sourceExpressionItem) {
            return;
        }

        //If entering the one that's been picked up don't do any thing
        if (targetExpressionItem === this.dropGhostExpression) {
            return;
        }

        //Simulate leaving the last entered chip in case of no Leave event triggered due to the artificial drop zone of a north positioned ghost chip
        if (this._targetExpressionItem) {
            this.resetDragAndDrop(false);
        }

        this._targetExpressionItem = targetExpressionItem;

        //Determine the middle point of the chip.
        const appendUnder = this.ghostInLowerPart(targetDragElement);

        this.renderDropGhostChip(appendUnder);
    }

    /** When mouse drag moves in a div's drop area 
     * @param targetDragElement The HTML element of the drop area chip that's been dragged to
     * @param targetExpressionItem The expressionItem of the drop area chip that's been dragged to
    */
    public onDivOver(targetDragElement: HTMLElement, targetExpressionItem: ExpressionItem) {
        if (this._targetExpressionItem === targetExpressionItem) {
            this.onChipOver(targetDragElement)
        } else {
            this.onChipEnter(targetDragElement, targetExpressionItem);
        }
    }

    /** When mouse drag moves in a chip's drop area 
     * @param targetDragElement The HTML element of the drop area chip that's been dragged to
    */
    public onChipOver(targetDragElement: HTMLElement): void {
        if (!this._sourceElement || !this._sourceExpressionItem) {
            return;
        }

        //Determine the middle point of the chip.
        const appendUnder = this.ghostInLowerPart(targetDragElement);

        this.renderDropGhostChip(appendUnder);
    }

    /** When mouse drag leaves a chip's drop area */
    public onChipLeave() {
        if (!this._sourceElement || !this._sourceExpressionItem) {
            return;
        }

        //if the drag ghost is on the drop ghost row don't trigger leave
        if (this.dragGhostIsOnDropGhostRow()) {
            return;
        }

        if (this._targetExpressionItem) {
            this.resetDragAndDrop(false)
        }
    }

    /** When dragged chip is let go in div's drop area 
     * @param targetExpressionItem The expressionItem of the drop area chip that's been dragged to
    */
    public onDivDropped(targetExpressionItem: ExpressionItem) {
        if (targetExpressionItem !== this._sourceExpressionItem) {
            this.onChipDropped();
        }
    }

    /** When dragged chip is let go in chip's drop area */
    public onChipDropped() {
        if (!this._sourceElement || !this._sourceExpressionItem) {
            return;
        }

        //Determine which chip to be focused after drop completes
        const [dropLocationIndex, _] = this.countChipsBeforeDropLocation(this._queryBuilderTreeComponent.rootGroup);

        //Delete from old place
        this._deleteExpression(this._sourceExpressionItem);
        this.dropGhostExpression = null;

        this._focusChipAfterDrag(dropLocationIndex);

        this.resetDragAndDrop(true);

        this._queryBuilderTreeComponent.exitEditAddMode();
    }

    /** When mouse drag moves in a AND/OR drop area 
     * @param targetDragElement The HTML element of the drop area chip that's been dragged to
     * @param targetExpressionItem The expressionItem of the drop area chip that's been dragged to
    */
    public onGroupRootOver(targetDragElement: HTMLElement, targetExpressionItem: ExpressionGroupItem) {
        if (!this._sourceElement || !this._sourceExpressionItem) {
            return;
        }

        let newTargetExpressionItem;

        if (this.ghostInLowerPart(targetDragElement) || !targetExpressionItem.parent) {
            //if ghost is in lower part of the AND/OR (or it's the main group) => drop as first child of that group    
            //accounting for the fact that the drop ghost might already be there as first child        
            if (targetExpressionItem.children[0] !== this.dropGhostExpression) {
                newTargetExpressionItem = targetExpressionItem.children[0];
            } else {
                newTargetExpressionItem = targetExpressionItem.children[1];
            }
        } else {
            //if ghost is in upper part => drop before the group starts             
            newTargetExpressionItem = targetExpressionItem;
        }

        if (this._targetExpressionItem !== newTargetExpressionItem) {
            this.resetDragAndDrop(false);
            this._targetExpressionItem = newTargetExpressionItem;
            this.renderDropGhostChip(false);
        }
    }

    /** When mouse drag moves in 'Add condition' button's drop area 
     * @param addConditionElement The Add condition button HTML Element
     * @param rootGroup The root group of the query tree
    */
    public onAddConditionEnter(addConditionElement: HTMLElement, rootGroup: ExpressionGroupItem) {
        if (!this._sourceElement || !this._sourceExpressionItem) {
            return;
        }
        const lastElement = addConditionElement.parentElement.previousElementSibling.lastElementChild;

        //simulate entering in the lower part of the last chip/group
        this.onChipEnter(lastElement as HTMLElement, rootGroup.children[rootGroup.children.length - 1]);
    }

    /** When chip's drag indicator is focused
     * 
     * @param sourceDragElement The HTML element of the chip that's been dragged
     * @param sourceExpressionItem The expressionItem of the chip that's been dragged
     * 
    */
    public onChipDragIndicatorFocus(sourceDragElement: HTMLElement, sourceExpressionItem: ExpressionItem) {
        //if drag is not underway, already
        if (!this.getDropGhostElement) {
            this.onMoveStart(sourceDragElement, sourceExpressionItem, true);
        }
    }

    /** When chip's drag indicator looses focus*/
    public onChipDragIndicatorFocusOut() {
        if (this._sourceElement?.style?.display !== 'none') {
            this.resetDragAndDrop(true);
            this._keyboardSubscription$?.unsubscribe();
        }
    }

    /** Upon blurring the tree, if Keyboard drag is underway and the next active item is not the drop ghost's drag indicator icon, cancel the drag&drop procedure*/
    public onDragFocusOut() {
        if (this.isKeyboardDrag && this.getDropGhostElement) {
            //have to wait a tick because upon blur, the next activeElement is always body, right before the next element gains focus
            setTimeout(() => {
                if (document.activeElement.className.indexOf(QueryBuilderSelectors.DRAG_INDICATOR) === -1) {
                    this.resetDragAndDrop(true);
                    this._keyboardSubscription$?.unsubscribe();
                }
            }, 0);
        }
    }

    /** Checks if the dragged ghost is horizontally on the same line with the drop ghost*/
    private dragGhostIsOnDropGhostRow() {
        const dragGhostBounds = this.getDragGhostElement.getBoundingClientRect();

        const dropGhostBounds = this.getDropGhostElement?.nativeElement?.parentElement.getBoundingClientRect();

        if (!dragGhostBounds || !dropGhostBounds) {
            return false;
        }

        const tolerance = dragGhostBounds.bottom - dragGhostBounds.top;

        return !(dragGhostBounds.bottom < dropGhostBounds.top - tolerance || dragGhostBounds.top > dropGhostBounds.bottom + tolerance);
    }

    /** Checks if the dragged ghost is north or south of a target element's center*/
    private ghostInLowerPart(ofElement: HTMLElement) {
        const ghostBounds = this.getDragGhostElement.getBoundingClientRect();
        const targetBounds = ofElement.getBoundingClientRect();

        return ((ghostBounds.top + ghostBounds.bottom) / 2) >= ((targetBounds.top + targetBounds.bottom) / 2);
    }

    /** Make a copy of the _sourceExpressionItem's chip and paste it in the tree north or south of the _targetExpressionItem's chip */
    private renderDropGhostChip(appendUnder: boolean): void {
        if (appendUnder !== this._dropUnder || this.isKeyboardDrag) {
            this.clearDropGhost();

            //Copy dragged chip
            const dragCopy = { ...this._sourceExpressionItem };
            dragCopy.parent = this._targetExpressionItem.parent;
            this.dropGhostExpression = dragCopy;

            //Paste chip
            this._dropUnder = appendUnder;
            const pasteIndex = this._targetExpressionItem.parent.children.indexOf(this._targetExpressionItem);
            this._targetExpressionItem.parent.children.splice(pasteIndex + (this._dropUnder ? 1 : 0), 0, dragCopy);
        }

        //Put focus on the drag icon of the ghost while performing keyboard drag
        if (this.isKeyboardDrag) {
            setTimeout(() => { // this will make the execution after the drop ghost is rendered
                const dropGhostDragIndicator = this.getDropGhostElement?.nativeElement?.querySelector(`.${QueryBuilderSelectors.DRAG_INDICATOR}`) as HTMLElement;
                if (dropGhostDragIndicator) {
                    dropGhostDragIndicator.focus();
                }
            }, 0);
        }

        //Attach a mousemove event listener (if not already in place) to the dragged ghost (if present)
        if (!this.isKeyboardDrag && this.getDragGhostElement && (!this._ghostChipMousemoveSubscription$ || this._ghostChipMousemoveSubscription$?.closed === true)) {
            const mouseMoves = fromEvent<MouseEvent>(this.getDragGhostElement, 'mousemove');

            //When mouse moves and there is a drop ghost => trigger onChipLeave to check if the drop ghost has to be removed 
            //effectively solving the case when mouse leaves the QB and a drop ghost is still in place
            this._ghostChipMousemoveSubscription$ = mouseMoves.pipe(sampleTime(100)).subscribe(() => {
                if (this.getDropGhostElement) {
                    this.onChipLeave();
                }
            });
        }

        this.setDragCursor('grab');
    }

    /** Set the cursor when dragging a ghost*/
    private setDragCursor(cursor: string) {
        if (this.getDragGhostElement) {
            this.getDragGhostElement.style.cursor = cursor;
        }
    }

    /** Removes the drop ghost expression from the tree and it's chip effectively  */
    private clearDropGhost() {
        if (this.dropGhostExpression) {
            const children = this.dropGhostExpression.parent.children;
            const delIndex = children.indexOf(this.dropGhostExpression);
            children.splice(delIndex, 1);
            this.dropGhostExpression = null;
        }
    }

    /** Reset Drag&Drop vars. Optionally the drag source vars too*/
    private resetDragAndDrop(clearDragged: boolean) {
        this._targetExpressionItem = null;
        this._dropUnder = null;
        this.clearDropGhost();
        this._keyDragInitialIndex = 0;
        this._keyDragCurrentIndex = 0;
        this._possibleDropLocations = null;
        this._isKeyDragsFirstMove = true;
        this.setDragCursor('no-drop');

        if (this._queryBuilderTreeComponent._expressionTreeCopy) {
            this._queryBuilderTreeComponent._expressionTree = this._queryBuilderTreeComponent._expressionTreeCopy;
        }

        if ((clearDragged || this.isKeyboardDrag) && this._sourceElement) {
            this._sourceElement.style.display = '';
        }

        if (clearDragged) {
            this._queryBuilderTreeComponent._expressionTreeCopy = null;
            this._sourceExpressionItem = null;
            this._sourceElement = null;
        }
    }

    /** Start listening for drag and drop specific keys */
    private listenToKeyboard() {
        this._keyboardSubscription$?.unsubscribe();
        this._keyboardSubscription$ = fromEvent<KeyboardEvent>(this.getMainExpressionTree, 'keydown')
            .pipe(filter(e => ['ArrowUp', 'ArrowDown', 'Enter', 'Space', 'Escape', 'Tab'].includes(e.key)))
            // .pipe(tap(e => {
            //     //Inhibit Tabs if keyboard drag is underway (don't allow to loose focus of the drop ghost's drag indicator)
            //     if (e.key === 'Tab' && this.getDropGhostElement) {
            //         e.preventDefault();
            //     }
            // }))
            .pipe(filter(event => !event.repeat))
            .subscribe(e => {
                if (e.key === 'Escape') {
                    //TODO cancel mouse drag once it's implemented in igx-chip draggable
                    this.resetDragAndDrop(false);
                    //Regain focus on the drag icon after keyboard drag cancel
                    if (this.isKeyboardDrag) {
                        (this._sourceElement.firstElementChild.firstElementChild.firstElementChild.firstElementChild as HTMLElement).focus();
                    }
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    this.arrowDrag(e.key);
                } else if (e.key === 'Enter' || e.key === 'Space') {
                    //this.platform.isActivationKey(eventArgs) Maybe use this rather that Enter/Space?
                    this.onChipDropped();
                    this._keyboardSubscription$.unsubscribe();
                }
            });
    }

    /** Perform up/down movement of drop ghost along the expression tree*/
    private arrowDrag(key: string) {
        if (!this._sourceElement || !this._sourceExpressionItem) {
            return;
        }

        const rootGroup = this._queryBuilderTreeComponent.rootGroup;

        if (this._isKeyDragsFirstMove) {
            this._possibleDropLocations = this.getPossibleDropLocations(rootGroup, true);
            this._keyDragInitialIndex = this._possibleDropLocations.findIndex(e => e[0] === this._sourceExpressionItem && e[1] === true);
            this._keyDragCurrentIndex = this._keyDragInitialIndex;
            if (this._keyDragInitialIndex === -1) {
                console.error("Dragged expression not found");
            }
            this._sourceElement.style.display = 'none';
        }

        let newKeyIndexOffset = this._keyDragCurrentIndex;
        if (key === 'ArrowUp') {
            //decrease index capped at top of tree
            newKeyIndexOffset && newKeyIndexOffset--;
        } else if (key === 'ArrowDown') {
            //increase index capped at bottom of tree
            newKeyIndexOffset < this._possibleDropLocations.length - 1 && newKeyIndexOffset++;
        } else {
            console.error('wrong key');
            return;
        }

        //if drop location has no change
        if (newKeyIndexOffset !== this._keyDragCurrentIndex || this._isKeyDragsFirstMove) {
            this._keyDragCurrentIndex = newKeyIndexOffset;

            const newDropTarget = this._possibleDropLocations[this._keyDragCurrentIndex];
            this._targetExpressionItem = newDropTarget[0]

            this.renderDropGhostChip(newDropTarget[1]);

            //Situations when drop ghost hasn't really moved, run one more time
            if (this._keyDragCurrentIndex === this._keyDragInitialIndex ||
                (this._isKeyDragsFirstMove && this._keyDragCurrentIndex === this._keyDragInitialIndex - 1)) {
                this._isKeyDragsFirstMove = false;
                this.arrowDrag(key);
            }

            this._isKeyDragsFirstMove = false;
        }

        return;
    }

    /** Produces a flat ordered list of possible drop locations as Tuple <[targetExpression, dropUnder]>, while performing the keyboard drag&drop */
    private getPossibleDropLocations(group: ExpressionGroupItem, isRoot: boolean): Array<[ExpressionItem, boolean]> {
        const result = new Array() as Array<[ExpressionItem, boolean]>;

        //Add dropZone under AND/OR (as first child of group)
        result.push([(group as ExpressionGroupItem).children[0], false]);

        for (let i = 0; i < group.children.length; i++) {
            if (group.children[i] instanceof ExpressionGroupItem) {
                result.push(...this.getPossibleDropLocations(group.children[i] as ExpressionGroupItem, false));
            } else {
                result.push([group.children[i], true]);
            }
        }

        //Add dropZone under the whole group
        if (!isRoot) {
            result.push([group, true]);
        }

        return result;
    }

    /** Counts how many chips will be in the tree (from top to bottom) before the dropped one */
    private countChipsBeforeDropLocation(group: ExpressionGroupItem): [number, boolean] {
        let count = 0, totalCount = 0, targetReached = false;

        for (let i = 0; i < group.children.length; i++) {
            const child = group.children[i];

            if (targetReached) {
                break;
            }

            if (child instanceof ExpressionGroupItem) {
                if (child === this._targetExpressionItem && !this._dropUnder) {
                    targetReached = true;
                } else {
                    [count, targetReached] = this.countChipsBeforeDropLocation(child as ExpressionGroupItem);
                    totalCount += count;
                }
            } else {
                if (child !== this._sourceExpressionItem && //not the hidden source chip
                    child !== this.dropGhostExpression && //not the drop ghost
                    !((child as ExpressionOperandItem).inEditMode && this._queryBuilderTreeComponent.operandCanBeCommitted() !== true) //not a chip in edit mode that will be discarded
                ) {
                    totalCount++;
                }

                if (child === this._targetExpressionItem) {
                    targetReached = true;
                    if (!this._dropUnder &&
                        !((child as ExpressionOperandItem).inEditMode && this._queryBuilderTreeComponent.operandCanBeCommitted() !== true)) {
                        totalCount--;
                    }
                }
            }
        }

        totalCount === -1 && totalCount++;

        return [totalCount, targetReached];
    }

    /** Sets the z-index of the drag ghost with a little delay, since we don't have access to ghostCreated() but we know it's executed right after moveStart() */
    private setDragGhostZIndex() {
        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
        }

        this._timeoutId = setTimeout(() => {
            if (this.getDragGhostElement?.style) {
                this.getDragGhostElement.style.zIndex = `${Z_INDEX_TO_SET}`;
            }
        }, DEFAULT_SET_Z_INDEX_DELAY);
    }
}