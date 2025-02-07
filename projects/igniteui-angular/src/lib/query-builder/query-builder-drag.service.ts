import { filter, fromEvent, sampleTime, Subscription, tap } from 'rxjs';
import { IgxQueryBuilderTreeComponent } from './query-builder-tree.component';
import { ElementRef, Inject, Injectable } from '@angular/core';
import { ExpressionGroupItem, ExpressionItem, QueryBuilderSelectors } from './query-builder.common';

const DEFAULT_SET_Z_INDEX_DELAY = 10;
const Z_INDEX_TO_SET = 10010; //overlay z-index is 10005

@Injectable()
export class IgxQueryBuilderDragService {
    constructor(
        @Inject(IgxQueryBuilderTreeComponent)
        private _queryBuilderTreeComponent: IgxQueryBuilderTreeComponent,
        private _queryBuilderTreeComponentElRef: ElementRef,
        @Inject(IgxQueryBuilderTreeComponent)
        private _queryBuilderTreeComponentDeleteItem: (expressionItem: ExpressionItem) => void,
    ) { }

    public sourceExpressionItem: ExpressionItem;
    public sourceElement: HTMLElement;
    public targetExpressionItem: ExpressionItem;
    public targetElement: HTMLElement;
    public dropUnder: boolean;
    public dropGhostChipNode: Node;

    private _ghostChipMousemoveSubscription$: Subscription;
    private _keyboardSubscription$: Subscription;
    private _keyDragOffsetIndex: number = 0;
    private _keyDragFirstMove: boolean = true;
    private _isKeyboardDrag: boolean;
    private _dropZonesList: HTMLElement[];   //stores a flat ordered list of all chips, including +Condition button, while performing the keyboard drag&drop
    private _expressionsList: ExpressionItem[]; //stores a flat ordered list of all expressions, including +Condition button, while performing the keyboard drag&drop
    private _timeoutId: any;



    //Get the dragged ghost as a HTMLElement
    private get dragGhostElement(): HTMLElement {
        return (document.querySelector('.igx-chip__ghost[ghostclass="igx-chip__ghost"]') as HTMLElement);
    }

    //Get the drop ghost as a HTMLElement
    private get dropGhostElement(): HTMLElement {
        return (document.querySelector(`.${QueryBuilderSelectors.FILTER_TREE_EXPRESSION_ITEM_DROP_GHOST}`) as HTMLElement);
    }

    private get mainExpressionTree(): HTMLElement {
        return this._queryBuilderTreeComponentElRef.nativeElement.querySelector(`.${QueryBuilderSelectors.FILTER_TREE}`);
    }

    //When we pick up a chip
    public onMoveStart(sourceDragElement: HTMLElement, sourceExpressionItem: ExpressionItem, isKeyboardDrag: boolean): void {
        //console.log('Picked up:', event, sourceDragElement);
        this.resetDragAndDrop(true);
        this._isKeyboardDrag = isKeyboardDrag;
        this.sourceExpressionItem = sourceExpressionItem;
        this.sourceElement = sourceDragElement;

        this.listenToKeyboard();

        if (!this._isKeyboardDrag) {
            this.sourceElement.style.display = 'none';
            this.setDragGhostZIndex();
        }
    }

    //When we let go a chip outside a proper drop zone
    public onMoveEnd(): void {
        // console.log('Let go:');
        if (!this.sourceElement || !this.sourceExpressionItem) return;

        if (this.dropGhostChipNode) {
            //If there is a ghost chip presented to the user, execute drop
            this.onChipDropped();
        } else {
            this.resetDragAndDrop(true);
        }

        this._ghostChipMousemoveSubscription$?.unsubscribe();
        this._keyboardSubscription$?.unsubscribe();
    }

    //On entering a drop area of another chip
    public onDivEnter(targetDragElement: HTMLElement, targetExpressionItem: ExpressionItem) {
        this.onChipEnter(targetDragElement, targetExpressionItem)
    }

    public onChipEnter(targetDragElement: HTMLElement, targetExpressionItem: ExpressionItem) {
        // console.log('Entering:', targetDragElement, targetExpressionItem);
        if (!this.sourceElement || !this.sourceExpressionItem) return;

        //If entering the one that's been picked up
        if (targetDragElement == this.sourceElement) return;

        //Simulate leaving the last entered chip in case of no Leave event triggered due to the artificial drop zone of a north positioned ghost chip
        if (this.targetElement) {
            this.resetDragAndDrop(false);
        }

        this.targetElement = targetDragElement;
        this.targetExpressionItem = targetExpressionItem;

        //Determine the middle point of the chip.
        const appendUnder = this.ghostInLowerPart(targetDragElement);

        this.renderDropGhostChip(targetDragElement, appendUnder);
    }

    //On moving the dragged chip in a drop area
    public onDivOver(targetDragElement: HTMLElement, targetExpressionItem: ExpressionItem) {
        if (this.targetExpressionItem === targetExpressionItem) {
            this.onChipOver(targetDragElement)
        } else {
            this.onChipEnter(targetDragElement, targetExpressionItem);
        }
    }

    public onChipOver(targetDragElement: HTMLElement): void {
        //console.log('Over:', targetDragElement, 'type: ', typeof event);
        if (!this.sourceElement || !this.sourceExpressionItem) return;

        //Determine the middle point of the chip.
        const appendUnder = this.ghostInLowerPart(targetDragElement);

        this.renderDropGhostChip(targetDragElement, appendUnder);
    }

    public onChipLeave() {
        if (!this.sourceElement || !this.sourceExpressionItem || !this.targetElement) return;
        //console.log('Leaving:', targetDragElement.textContent.trim());

        //if the drag ghost is on the drop ghost row don't trigger leave
        if (this.dragGhostIsOnDropGhostRow(this.dragGhostElement, this.dropGhostChipNode?.firstChild as HTMLElement)) {
            return;
        }

        if (this.targetElement) {
            this.resetDragAndDrop(false)
        }
    }

    //On dropped in a drop area of another chip
    public onDivDropped(targetExpressionItem: ExpressionItem) {
        if (targetExpressionItem != this.sourceExpressionItem) {
            this.onChipDropped();
        }
    }

    public onChipDropped() {
        if (!this.sourceElement || !this.sourceExpressionItem || !this.targetElement) return;

        //console.log('Move: [', this.sourceElement.children[0].textContent.trim(), (this.dropUnder ? '] under: [' : '] over:'), this.targetExpressionItem)
        this.moveDraggedChipToNewLocation(this.sourceExpressionItem, this.targetExpressionItem, this.dropUnder)
        this.resetDragAndDrop(true);

        this._queryBuilderTreeComponent.exitEditAddMode();
    }


    public onGroupRootOver(targetDragElement: HTMLElement, targetExpressionItem: ExpressionGroupItem) {
        //console.log('Entering:', targetDragElement, targetExpressionItem);
        if (!this.sourceElement || !this.sourceExpressionItem) return;

        let newTargetElement, newTargetExpressionItem;

        if (this.ghostInLowerPart(targetDragElement) || !targetExpressionItem.parent) {
            //if ghost in lower part of the AND/OR (or it's the main group) => drop before the group starts
            newTargetElement = targetDragElement.nextElementSibling.firstElementChild;
            newTargetElement = (newTargetElement.className.indexOf(QueryBuilderSelectors.FILTER_TREE_EXPRESSION_ITEM_DROP_GHOST) !== -1) ? newTargetElement.nextElementSibling : newTargetElement;
            newTargetExpressionItem = targetExpressionItem.children[0];
        } else {
            //if ghost in upper part or it's the root group => drop as first child of that group
            newTargetElement = targetDragElement.parentElement.parentElement;
            newTargetExpressionItem = targetExpressionItem;
        }

        if (newTargetElement && (this.targetElement !== newTargetElement || this.targetExpressionItem !== newTargetExpressionItem)) {
            this.resetDragAndDrop(false);
            this.targetElement = newTargetElement;
            this.targetExpressionItem = newTargetExpressionItem;
            this.renderDropGhostChip(this.targetElement, false);
        }
    }

    public onAddConditionEnter(addConditionElement: HTMLElement, rootGroup: ExpressionGroupItem) {
        //console.log('onAddConditionEnter', addConditionElement);
        if (!this.sourceElement || !this.sourceExpressionItem) return;

        const lastElement = addConditionElement.parentElement.previousElementSibling.lastElementChild;
        if (lastElement == this.dropGhostChipNode) return;

        //simulate entering in the lower part of the last chip/group
        this.onChipEnter(lastElement as HTMLElement, rootGroup.children[rootGroup.children.length - 1]);
    }

    public onChipDragIndicatorFocus(sourceDragElement: HTMLElement, sourceExpressionItem: ExpressionItem) {
        (sourceDragElement.querySelector(`.${QueryBuilderSelectors.DRAG_INDICATOR}`) as HTMLElement).setAttribute('aria-hidden', 'false'); //Temp solution for aria-hidden bug #35759
        this.onMoveStart(sourceDragElement, sourceExpressionItem, true);
    }

    public onChipDragIndicatorFocusOut() {
        if (this.sourceElement?.style?.display !== 'none') {
            this.resetDragAndDrop(true);
            this._keyboardSubscription$?.unsubscribe();
        }
    }

    //Upon blurring the tree, if Keyboard drag is underway and the next active item is not the drop ghost's drag indicator icon, cancel the drag&drop procedure
    public onDragFocusOut() {
        if (this._isKeyboardDrag && this.dropGhostElement) {
            //have to wait a tick because upon blur, the next activeElement is always body, right before the next element gains focus
            setTimeout(() => {
                if (document.activeElement.className.indexOf(QueryBuilderSelectors.DRAG_INDICATOR) === -1) {
                    this.resetDragAndDrop(true);
                    this._keyboardSubscription$?.unsubscribe();
                }
            }, 0);
        }
    }

    //Checks if the dragged ghost is horizontally on the same line with the drop ghost
    private dragGhostIsOnDropGhostRow(dragGhost: HTMLElement, dropGhost: HTMLElement) {
        const dragGhostBounds = dragGhost.getBoundingClientRect();
        const dropGhostBounds = dropGhost.getBoundingClientRect();

        if (!dragGhostBounds || !dropGhostBounds) return false;

        const ghostHeight = dragGhostBounds.bottom - dragGhostBounds.top;

        return !(dragGhostBounds.bottom < dropGhostBounds.top - ghostHeight || dragGhostBounds.top > dropGhostBounds.bottom + ghostHeight);
    }

    //Checks if the dragged ghost is north or south of a target element's center
    private ghostInLowerPart(ofElement: HTMLElement) {
        //if (event == null) return true;
        const ghostBounds = this.dragGhostElement.getBoundingClientRect();
        const targetBounds = ofElement.getBoundingClientRect();

        return ((ghostBounds.top + ghostBounds.bottom) / 2) >= ((targetBounds.top + targetBounds.bottom) / 2);
    }

    //Create the drop ghost node based on the base chip that's been dragged
    private createDropGhost(keyboardMode?: boolean) {
        const dragCopy = this.sourceElement.cloneNode(true);
        (dragCopy as HTMLElement).classList.add(QueryBuilderSelectors.FILTER_TREE_EXPRESSION_ITEM_DROP_GHOST);
        (dragCopy as HTMLElement).style.display = '';
        (dragCopy.firstChild as HTMLElement).style.visibility = 'visible';
        dragCopy.removeChild(dragCopy.childNodes[3]);

        if (!keyboardMode) {
            var span = document.createElement('span')
            span.innerHTML = this._queryBuilderTreeComponent.resourceStrings.igx_query_builder_drop_ghost_text;

            dragCopy.firstChild.firstChild.removeChild(dragCopy.firstChild.firstChild.childNodes[1]);
            dragCopy.firstChild.firstChild.removeChild(dragCopy.firstChild.firstChild.childNodes[1]);
            (dragCopy.firstChild.firstChild.firstChild as HTMLElement).replaceChildren(span);
            (dragCopy.firstChild.firstChild as HTMLElement).classList.add(QueryBuilderSelectors.FILTER_TREE_EXPRESSION_ITEM_GHOST);
        }
        return dragCopy;
    }

    //Make a copy of the drag chip and place it in the DOM north or south of the drop chip
    private renderDropGhostChip(appendToElement: HTMLElement, appendUnder: boolean, keyboardMode?: boolean): void {
        const dragCopy = this.createDropGhost(keyboardMode);

        //Append the ghost
        if ((!appendUnder && this.dropUnder !== false) || //mouse mode
            (keyboardMode && !appendUnder)) {
            //over
            (this.dropGhostChipNode as HTMLElement)?.remove();
            this.dropGhostChipNode = dragCopy;
            this.dropUnder = false;
            appendToElement.parentNode.insertBefore(this.dropGhostChipNode, appendToElement);
        } else if ((appendUnder && this.dropUnder !== true) || //mouse mode
            (keyboardMode && appendUnder)) {
            //under
            (this.dropGhostChipNode as HTMLElement)?.remove();
            this.dropGhostChipNode = dragCopy;
            this.dropUnder = true;
            appendToElement.parentNode.insertBefore(this.dropGhostChipNode, appendToElement.nextElementSibling);
        }

        //Put focus on the drag icon of the ghost while performing keyboard drag
        if (this._isKeyboardDrag) {
            ((this.dropGhostChipNode as HTMLElement).querySelector(`.${QueryBuilderSelectors.DRAG_INDICATOR}`) as HTMLElement).focus();
        }

        //Attach a mousemove event listener (if not already in place) to the dragged ghost (if present)
        if (this.dragGhostElement && (!this._ghostChipMousemoveSubscription$ || this._ghostChipMousemoveSubscription$?.closed === true)) {
            const mouseMoves = fromEvent<MouseEvent>(this.dragGhostElement, 'mousemove');

            this._ghostChipMousemoveSubscription$ = mouseMoves.pipe(sampleTime(100)).subscribe(() => {
                this.onChipLeave();
            });
        }

        this.setDragCursor('grab');
    }

    //Set the cursor when dragging a ghost
    private setDragCursor(cursor: string) {
        if (this.dragGhostElement) {
            this.dragGhostElement.style.cursor = cursor;
        }
    }

    //Execute the drop
    private moveDraggedChipToNewLocation(sourceExpressionItem: ExpressionItem, appendToExpressionItem: ExpressionItem, dropUnder: boolean) {
        //Copy dragged chip
        const dragCopy = { ...sourceExpressionItem };
        dragCopy.parent = appendToExpressionItem.parent;

        //Paste on new place
        const index = appendToExpressionItem.parent.children.indexOf(appendToExpressionItem);
        appendToExpressionItem.parent.children.splice(index + (dropUnder ? 1 : 0), 0, dragCopy);

        //Delete from old place
        this._queryBuilderTreeComponentDeleteItem(sourceExpressionItem);

        // this._queryBuilderTreeComponent._lastFocusedChipIndex = index;
        // this._queryBuilderTreeComponent.focusEditedExpressionChip();
    }

    //Reset Drag&Drop vars. Optionally the drag source vars too
    private resetDragAndDrop(clearDragged: boolean) {
        this.targetExpressionItem = null;
        this.targetElement = null;
        this.dropUnder = null;
        (this.dropGhostChipNode as HTMLElement)?.remove();
        this.dropGhostChipNode = null;
        this._keyDragOffsetIndex = 0;
        this._keyDragFirstMove = true;
        this.setDragCursor('no-drop');

        if ((clearDragged || this._isKeyboardDrag) && this.sourceElement) {
            this.sourceElement.style.display = '';
        }

        if (clearDragged) {
            this.sourceExpressionItem = null;
            this.sourceElement = null;
            this._dropZonesList = null;
            this._expressionsList = null;
        }
    }

    private listenToKeyboard() {
        this._keyboardSubscription$?.unsubscribe();
        this._keyboardSubscription$ = fromEvent<KeyboardEvent>(this.mainExpressionTree, 'keydown')
            .pipe(filter(key => ['ArrowUp', 'ArrowDown', 'Enter', 'Space', 'Escape', 'Tab'].includes(key.code)))
            .pipe(tap(e => {
                //Inhibit Tabs if keyboard drag is underway
                if (e.key !== 'Tab' || this.dropGhostElement) e.preventDefault();
            }))
            .pipe(filter(event => !event.repeat))
            .subscribe(key => {
                if (key.code == 'Escape') {
                    //TODO cancel mouse drag
                    this.resetDragAndDrop(false);
                    //Regain focus on the drag icon after keyboard drag cancel
                    if (this._isKeyboardDrag) {
                        (this.sourceElement.firstElementChild.firstElementChild.firstElementChild.firstElementChild as HTMLElement).focus();
                    }
                } else if (key.code == 'ArrowUp' || key.code == 'ArrowDown') {
                    this.arrowDrag(key);
                } else if (key.code == 'Enter' || key.code == 'Space') {
                    //this.platform.isActivationKey(eventArgs) Maybe use this rather that Enter/Space?
                    this.onChipDropped();
                    this._keyboardSubscription$.unsubscribe();
                }
            });
    }

    //Perform up/down movement of drop ghost along the expression tree
    private arrowDrag(key: KeyboardEvent) {
        if (!this.sourceElement || !this.sourceExpressionItem) return;

        if (this._keyDragFirstMove) {
            this._expressionsList = this.getListedExpressions(this._queryBuilderTreeComponent.rootGroup);
            this._dropZonesList = this.getListedDropZones();
            this.sourceElement.style.display = 'none';
        }

        //const index = this.expressionsList.indexOf(this.sourceExpressionItem);
        const index = this._dropZonesList.indexOf(this.sourceElement);

        if (index === -1) console.error("Dragged expression not found");

        let newKeyIndexOffset = 0;
        if (key.code == 'ArrowUp') {
            //decrease index offset capped at top of tree
            newKeyIndexOffset = this._keyDragOffsetIndex - 1 >= index * -2 - 1 ? this._keyDragOffsetIndex - 1 : this._keyDragOffsetIndex;
        } else if (key.code == 'ArrowDown') {
            //increase index offset capped at bottom of tree
            newKeyIndexOffset = this._keyDragOffsetIndex + 1 <= (this._dropZonesList.length - 2 - index) * 2 + 2 ? this._keyDragOffsetIndex + 1 : this._keyDragOffsetIndex;
        } else {
            console.error('wrong key');
            return;
        }

        //if up/down limits not reached
        if (newKeyIndexOffset != this._keyDragOffsetIndex) {
            this._keyDragOffsetIndex = newKeyIndexOffset;
            const indexOffset = ~~(this._keyDragOffsetIndex / 2);

            if (index + indexOffset <= this._expressionsList.length - 1) {
                let under = this._keyDragOffsetIndex < 0 ? this._keyDragOffsetIndex % 2 == 0 ? true : false : this._keyDragOffsetIndex % 2 == 0 ? false : true;

                if (this._dropZonesList[index + indexOffset].className.indexOf(QueryBuilderSelectors.FILTER_TREE_EXPRESSION_CONTEXT_MENU) === -1) {
                    this.targetElement = this._dropZonesList[index + indexOffset]
                    this.targetExpressionItem = this._expressionsList[index + indexOffset];
                } else {
                    //if the current drop zone is a group root (AND/OR)
                    if (index + indexOffset === 0) {
                        //If the root group's AND/OR
                        this.targetElement = this._dropZonesList[0]
                        this.targetExpressionItem = this._queryBuilderTreeComponent.rootGroup.children[0];
                        under = true;
                    } else if (under) {
                        //If under AND/OR
                        this.targetElement = this._dropZonesList[index + indexOffset]
                        this.targetExpressionItem = this._expressionsList[index + indexOffset + 1];
                    } else {
                        //if over AND/OR
                        this.targetElement = this._dropZonesList[index + indexOffset].parentElement.parentElement;
                        this.targetExpressionItem = this._expressionsList[index + indexOffset];
                    }

                    //If should drop under AND/OR => drop over first chip in that AND/OR's group
                    if (under) {
                        this.targetElement = this.targetElement.nextElementSibling.firstElementChild as HTMLElement;
                        if (this.targetElement === this.dropGhostChipNode) this.targetElement = this.targetElement.nextElementSibling as HTMLElement;
                        under = false;
                    }
                }
                const before = this.getPreviousChip(this.dropGhostElement);
                const after = this.getNextChip(this.dropGhostElement);

                this.renderDropGhostChip(this.targetElement, under, true);

                //If it's the first arrow hit OR drop ghost is not displayed OR hasn't actually moved, move one more step in the same direction
                if (this._keyDragFirstMove ||
                    !this.dropGhostElement ||
                    (this.getPreviousChip(this.dropGhostElement) === before && this.getNextChip(this.dropGhostElement) === after)) {
                    this._keyDragFirstMove = false;
                    this.arrowDrag(key);
                }
            } else {
                //Dropping on '+ Condition button' => drop as last condition in the root group
                let lastElement = this._dropZonesList[this._dropZonesList.length - 1].parentElement.previousElementSibling
                if (lastElement.className.indexOf(QueryBuilderSelectors.FILTER_TREE_EXPRESSION_SECTION) !== -1) lastElement = lastElement.lastElementChild;
                if (lastElement.className.indexOf(QueryBuilderSelectors.FILTER_TREE_SUBQUERY) !== -1) lastElement = lastElement.previousElementSibling;
                if (lastElement === this.dropGhostChipNode) lastElement = lastElement.previousElementSibling;

                const getParentExpression = (expression: ExpressionItem) => {
                    return expression.parent ? getParentExpression(expression.parent) : expression
                };
                const rootGroup = getParentExpression(this._expressionsList[this._expressionsList.length - 1]);

                this.targetElement = lastElement as HTMLElement;
                this.targetExpressionItem = rootGroup.children[rootGroup.children.length - 1];

                this.renderDropGhostChip(lastElement as HTMLElement, true, true);
            }
        }

        return;
    }

    //Get previous chip area taking into account a possible hidden sub-tree or collapsed base chip
    private getPreviousChip(chipSubject: Element) {
        let prevElement = chipSubject;

        do {
            prevElement = prevElement?.previousElementSibling;
        }
        while (prevElement && getComputedStyle(prevElement).display === 'none')

        return prevElement;
    }

    //Get next chip area taking into account a possible hidden sub-tree or collapsed base chip
    private getNextChip(chipSubject: Element) {
        let nextElement = chipSubject;

        do {
            nextElement = nextElement?.nextElementSibling;
        }
        while (nextElement && getComputedStyle(nextElement).display === 'none')

        return nextElement;
    }

    //Get all expressions from the tree flatten out as a list, including the expression groups
    private getListedExpressions(group: ExpressionGroupItem): ExpressionItem[] {
        const expressions: ExpressionItem[] = [];

        expressions.push(group);
        group.children.forEach(child => {
            if (child instanceof ExpressionGroupItem) {
                expressions.push(...this.getListedExpressions(child));
            } else {
                expressions.push(child);
            }
        });

        return expressions;
    }

    //Gets all chip elements owned by this tree (discard child trees), AND/OR group roots and '+condition' button, flatten out as a list of HTML elements
    private getListedDropZones(): HTMLElement[] {
        const expressionElementList = (this._queryBuilderTreeComponentElRef.nativeElement as HTMLElement).querySelectorAll(QueryBuilderSelectors.VIABLE_DROP_AREA);
        const ownChipElements = [];

        const isNotFromThisTree = (qb, parent) => {
            if (parent == qb) return false;
            else if (parent?.style?.display === 'none' || parent.classList.contains(QueryBuilderSelectors.QUERY_BUILDER_TREE)) return true;
            else if (parent.parentElement) return isNotFromThisTree(qb, parent.parentElement);
            else return false;
        }

        expressionElementList.forEach(element => {
            if (!isNotFromThisTree(this._queryBuilderTreeComponentElRef.nativeElement, element) && getComputedStyle(element).display !== 'none')
                ownChipElements.push(element);
        });

        return ownChipElements;
    }

    //Sets the z-index of the drag ghost with a little delay, since we don't have access to ghostCreated() but we know it's executed right after moveStart()
    private setDragGhostZIndex() {
        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
        }

        this._timeoutId = setTimeout(() => {
            if (this.dragGhostElement?.style) this.dragGhostElement.style.zIndex = `${Z_INDEX_TO_SET}`;
        }, DEFAULT_SET_Z_INDEX_DELAY);
    }
}