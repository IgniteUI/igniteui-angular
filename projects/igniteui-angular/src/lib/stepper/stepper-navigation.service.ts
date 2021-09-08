// import { Injectable, OnDestroy } from '@angular/core';
// import { Subject } from 'rxjs';
// import { IgxStepperComponent } from './igx-stepper.component';
// import { IgxStepComponent } from './step/igx-step.component';


// /** @hidden @internal */
// @Injectable()
// export class IgxStepperNavigationService implements OnDestroy {
//     private stepper: IgxStepperComponent;

//     private _focusedStep: IgxStepComponent = null;

//     private _visibleChildren: IgxStepComponent[] = [];
//     // private _invisibleChildren: Set<IgxStepComponent> = new Set();
//     // private _disabledChildren: Set<IgxStepComponent> = new Set();

//     private _cacheChange = new Subject<void>();

//     constructor() {
//         this._cacheChange.subscribe(() => {
//             // this._visibleChildren =
//             //     this.stepper?.steps ?
//             //         this.stepper.steps.filter(e => !(this._invisibleChildren.has(e) || this._disabledChildren.has(e))) :
//             //         [];
//         });
//     }

//     public register(stepper: IgxStepperComponent) {
//         this.stepper = stepper;
//     }

//     public get focusedStep() {
//         return this._focusedStep;
//     }

//     public set focusedStep(value: IgxStepComponent) {
//         if (this._focusedStep === value) {
//             return;
//         }
//         this._focusedStep = value;
//     }

//     public get visibleChildren(): IgxStepComponent[] {
//         return this._visibleChildren;
//     }

//     // public update_disabled_cache(step: IgxStepComponent): void {
//     //     if (step.disabled) {
//     //         this._disabledChildren.add(step);
//     //     } else {
//     //         this._disabledChildren.delete(step);
//     //     }
//     //     this._cacheChange.next();
//     // }

//     // public init_invisible_cache() {
//     //     this.stepper.steps.filter(e => e.level === 0).forEach(step => {
//     //         this.update_visible_cache(step, step.expanded, false);
//     //     });
//     //     this._cacheChange.next();
//     // }

//     // public update_visible_cache(step: IgxStepComponent, expanded: boolean, shouldEmit = true): void {
//     //     if (expanded) {
//     //         step._children.forEach(child => {
//     //             this._invisibleChildren.delete(child);
//     //             this.update_visible_cache(child, child.expanded, false);
//     //         });
//     //     } else {
//     //         step.allChildren.forEach(c => this._invisibleChildren.add(c));
//     //     }

//     //     if (shouldEmit) {
//     //         this._cacheChange.next();
//     //     }
//     // }

//     // /** Handler for keydown events. Used in stepper.component.ts */
//     // public handleKeydown(event: KeyboardEvent) {
//     //     const key = event.key.toLowerCase();
//     //     if (!this.focusedStep) {
//     //         return;
//     //     }
//     //     if (!(NAVIGATION_KEYS.has(key) || key === '*')) {
//     //         if (key === 'enter') {
//     //             this.activeStep = this.focusedStep;
//     //         }
//     //         return;
//     //     }
//     //     event.preventDefault();
//     //     if (event.repeat) {
//     //         setTimeout(() => this.handleNavigation(event), 1);
//     //     } else {
//     //         this.handleNavigation(event);
//     //     }
//     // }

//     public ngOnDestroy() {
//         this._cacheChange.next();
//         this._cacheChange.complete();
//     }

//     // private handleNavigation(event: KeyboardEvent) {
//     //     switch (event.key.toLowerCase()) {
//     //         case 'home':
//     //             this.setFocusedAndActiveStep(this.visibleChildren[0]);
//     //             break;
//     //         case 'end':
//     //             this.setFocusedAndActiveStep(this.visibleChildren[this.visibleChildren.length - 1]);
//     //             break;
//     //         case 'arrowleft':
//     //         case 'left':
//     //             this.handleArrowLeft();
//     //             break;
//     //         case 'arrowright':
//     //         case 'right':
//     //             this.handleArrowRight();
//     //             break;
//     //         case 'arrowup':
//     //         case 'up':
//     //             this.handleUpDownArrow(true, event);
//     //             break;
//     //         case 'arrowdown':
//     //         case 'down':
//     //             this.handleUpDownArrow(false, event);
//     //             break;
//     //         case '*':
//     //             this.handleAsterisk();
//     //             break;
//     //         case ' ':
//     //         case 'spacebar':
//     //         case 'space':
//     //             this.handleSpace(event.shiftKey);
//     //             break;
//     //         default:
//     //             return;
//     //     }
//     // }

//     // private handleArrowLeft(): void {
//     //     if (this.focusedStep.expanded &&
//     // !this.stepperService.collapsingSteps.has(this.focusedStep) && this.focusedStep._children?.length) {
//     //         this.activeStep = this.focusedStep;
//     //         this.focusedStep.collapse();
//     //     } else {
//     //         const parentStep = this.focusedStep.parentStep;
//     //         if (parentStep && !parentStep.disabled) {
//     //             this.setFocusedAndActiveStep(parentStep);
//     //         }
//     //     }
//     // }

//     // private handleArrowRight(): void {
//     //     if (this.focusedStep._children.length > 0) {
//     //         if (!this.focusedStep.expanded) {
//     //             this.activeStep = this.focusedStep;
//     //             this.focusedStep.expand();
//     //         } else {
//     //             if (this.stepperService.collapsingSteps.has(this.focusedStep)) {
//     //                 this.focusedStep.expand();
//     //                 return;
//     //             }
//     //             const firstChild = this.focusedStep._children.find(step => !step.disabled);
//     //             if (firstChild) {
//     //                 this.setFocusedAndActiveStep(firstChild);
//     //             }
//     //         }
//     //     }
//     // }

//     // private handleUpDownArrow(isUp: boolean, event: KeyboardEvent): void {
//     //     const next = this.getVisibleStep(this.focusedStep, isUp ? -1 : 1);
//     //     if (next === this.focusedStep) {
//     //         return;
//     //     }

//     //     if (event.ctrlKey) {
//     //         this.setFocusedAndActiveStep(next, false);
//     //     } else {
//     //         this.setFocusedAndActiveStep(next);
//     //     }
//     // }

//     // private handleAsterisk(): void {
//     //     const steps = this.focusedStep.parentStep ? this.focusedStep.parentStep._children : this.stepper.rootSteps;
//     //     steps?.forEach(step => {
//     //         if (!step.disabled && (!step.expanded || this.stepperService.collapsingSteps.has(step))) {
//     //             step.expand();
//     //         }
//     //     });
//     // }

//     // private handleSpace(shiftKey = false): void {
//     //     if (this.stepper.selection === IgxStepperSelectionType.None) {
//     //         return;
//     //     }

//     //     this.activeStep = this.focusedStep;
//     //     if (shiftKey) {
//     //         this.selectionService.selectMultipleSteps(this.focusedStep);
//     //         return;
//     //     }

//     //     if (this.focusedStep.selected) {
//     //         this.selectionService.deselectStep(this.focusedStep);
//     //     } else {
//     //         this.selectionService.selectStep(this.focusedStep);
//     //     }
//     // }

//     // /** Gets the next visible step in the given direction - 1 -> next, -1 -> previous */
//     // private getVisibleStep(step: IgxStepComponent, dir: 1 | -1 = 1): IgxStepComponent {
//     //     const stepIndex = this.visibleChildren.indexOf(step);
//     //     return this.visibleChildren[stepIndex + dir] || step;
//     // }
// }
