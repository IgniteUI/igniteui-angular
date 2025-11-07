import { ComponentFixture } from '@angular/core/testing';

/**
 * Helper function to wait for toggle/dropdown/overlay to open after calling open() or toggle()
 * This is needed because the toggle directive uses afterNextRender() which requires
 * waiting for the rendering cycle to complete in tests.
 * 
 * @param fixture The component fixture
 * @returns Promise that resolves when rendering is done
 * 
 * @example
 * ```typescript
 * select.open();
 * await waitForToggleOpen(fixture);
 * expect(select.collapsed).toBeFalsy();
 * ```
 */
export async function waitForToggleOpen(fixture: ComponentFixture<any>): Promise<void> {
    await fixture.whenRenderingDone();
    fixture.detectChanges();
}

/**
 * Helper function for fakeAsync tests that need to wait for toggle operations.
 * Since afterNextRender() doesn't work in fakeAsync, tests should use async/await instead.
 * This function is kept for backwards compatibility but will log a warning.
 * 
 * @deprecated Use async/await with waitForToggleOpen instead of fakeAsync
 */
export function waitForToggleOpenSync(): void {
    console.warn('waitForToggleOpenSync called - tests using afterNextRender should use async/await');
}
