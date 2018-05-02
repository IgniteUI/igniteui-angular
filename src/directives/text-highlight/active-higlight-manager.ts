import { ElementRef } from "@angular/core";
import { IgxTextHighlightDirective } from "./text-highlight.directive";

interface IHighlightGroupInfo {
    elements: ElementRef[];
    activeIndex: number;
    restoreIndex: number;
}

export class ActiveHighlightManager {

    private static highlightGroupsMap = new Map<string, IHighlightGroupInfo>();
    private static highlightDirectivesMap = new Map<IgxTextHighlightDirective, ElementRef[]>();

    public static registerHighlightInfo(highlight: IgxTextHighlightDirective): void {
        if (ActiveHighlightManager.highlightGroupsMap.has(highlight.groupName) === false) {
            ActiveHighlightManager.highlightGroupsMap.set(highlight.groupName, {
                elements: [],
                activeIndex: -1,
                restoreIndex: -1
            });
        }

        if (ActiveHighlightManager.highlightDirectivesMap.has(highlight) === false) {
            ActiveHighlightManager.highlightDirectivesMap.set(highlight, new Array<ElementRef>());
        }
    }

    public static registerHighlight(highlight: IgxTextHighlightDirective, element: ElementRef, restore: boolean): void {
        const groupInfo = ActiveHighlightManager.highlightGroupsMap.get(highlight.groupName);

        if (restore && groupInfo.restoreIndex !== -1) {
            groupInfo.restoreIndex = Math.max(groupInfo.restoreIndex, 0);
            groupInfo.elements.splice(groupInfo.restoreIndex++, 0, element);
        } else {
            groupInfo.elements.push(element);
        }

        const directiveRefs = ActiveHighlightManager.highlightDirectivesMap.get(highlight);
        directiveRefs.push(element);
    }

    public static unregisterHighlightInfo(highlight: IgxTextHighlightDirective): void {
        let elementToRemove = [];
        if (ActiveHighlightManager.highlightDirectivesMap.has(highlight)) {
            elementToRemove = ActiveHighlightManager.highlightDirectivesMap.get(highlight);
            ActiveHighlightManager.highlightDirectivesMap.delete(highlight);
        }

        if (ActiveHighlightManager.highlightGroupsMap.has(highlight.groupName)) {
            const groupInfo = ActiveHighlightManager.highlightGroupsMap.get(highlight.groupName);
            const currentElements = groupInfo.elements;

            elementToRemove.forEach((element) => {
                const index = currentElements.indexOf(element);
                if (index !== -1) {
                    if (groupInfo.activeIndex === index) {
                        groupInfo.activeIndex = -1;
                    }  else if (groupInfo.activeIndex > index) {
                        groupInfo.activeIndex--;
                    }

                    currentElements.splice(index, 1);
                }
            });
        }

    }

    public static unregisterHighlight(highlight: IgxTextHighlightDirective, element: ElementRef, store: boolean) {
        const groupInfo = ActiveHighlightManager.highlightGroupsMap.get(highlight.groupName);
        const groupElements = groupInfo.elements;
        const indexInGroupElements = groupElements.indexOf(element);

        if (indexInGroupElements !== -1) {
            if (store) {
                if (groupInfo.activeIndex === indexInGroupElements) {
                    groupInfo.activeIndex = -1;
                } else if (groupInfo.activeIndex > indexInGroupElements) {
                    groupInfo.activeIndex--;
                }
            } else {
                groupInfo.restoreIndex = indexInGroupElements;
            }

            groupElements.splice(indexInGroupElements, 1);
        }

        const directiveElements = ActiveHighlightManager.highlightDirectivesMap.get(highlight);
        const indexInDirectiveElements = directiveElements.indexOf(element);

        if (indexInDirectiveElements !== -1) {
            directiveElements.splice(indexInDirectiveElements, 1);
        }
    }

    public static moveNext(groupName: string): void {
        ActiveHighlightManager.activateElement(groupName, 1);
    }

    public static movePrev(groupName: string): void {
        ActiveHighlightManager.activateElement(groupName, -1);
    }

    public static restoreHighlight(groupName: string): void {
        const groupInfo = ActiveHighlightManager.highlightGroupsMap.get(groupName);

        groupInfo.restoreIndex = -1;

        if (groupInfo.activeIndex !== -1) {
            ActiveHighlightManager.activateElement(groupName, 0);
        }
    }

    private static activateElement(groupName: string, increment: number): void {
        if (ActiveHighlightManager.highlightGroupsMap.has(groupName) === false) {
            return;
        }

        const groupInfo = ActiveHighlightManager.highlightGroupsMap.get(groupName);
        let activeIndex = groupInfo.activeIndex === - 1 ? 0 : groupInfo.activeIndex + increment;

        if (activeIndex > groupInfo.elements.length - 1) {
            activeIndex = 0;
        } else if (activeIndex < 0) {
            activeIndex = groupInfo.elements.length - 1;
        }

        const elementToActivate = groupInfo.elements[activeIndex];

        let directive: IgxTextHighlightDirective;

        ActiveHighlightManager.highlightDirectivesMap.forEach((value, key) => {
            if (value.indexOf(elementToActivate) !== -1) {
                directive = key;
            }
        });

        if (directive) {
            ActiveHighlightManager.deactivateElement(directive);

            directive.renderer.addClass(elementToActivate, directive.activeCssClass);
            directive.renderer.setAttribute(elementToActivate, "style", "background:orange;font-weight:bold");

            groupInfo.activeIndex = activeIndex;
        }
    }

    private static deactivateElement(directive: IgxTextHighlightDirective) {
        const groupName = directive.groupName;
        const groupInfoMap = ActiveHighlightManager.highlightGroupsMap;
        const groupInfo =  groupInfoMap.get(groupName);

        if (groupInfo.activeIndex === -1) {
            return;
        }

        const element = groupInfo.elements[groupInfo.activeIndex];

        directive.renderer.removeClass(element, directive.activeCssClass);
        directive.renderer.setAttribute(element, "style", "background:yellow;font-weight:bold");

        groupInfo.activeIndex = -1;
    }
}
