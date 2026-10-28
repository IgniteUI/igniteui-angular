import { Directive, DoCheck } from '@angular/core';

/**
 * Counts the checks of the view that declares it. Hooks do not run in checkNoChanges passes.
 * Shared by the combo and simple-combo specs; it lives in test-utils because importing a spec
 * file that contains tests registers all of its suites in the importing file.
 */
@Directive({ selector: '[igxCheckCount]' })
export class CheckCountDirective implements DoCheck {
    public checks = 0;

    public ngDoCheck(): void {
        this.checks++;
    }
}
