export class CenterPositionStrategy {

    position (element): void {
        element.classList.add('show-center');
        // TODO: Below css should go to the 'show-center'.
        element.addClass = 'show-center';
        element.style.display = 'flex';
        element.style.position = 'fixed';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.top = '0';
        element.style.right = '0';
        element.style.left = '0';
        element.style.bottom = '0';
        element.style.zIndex = '99999';
    }

    // cleanup
    dispose(element): void {
    // remove the CenterPositionStrategy css class attached
        element.classList.remove('show-center');
    }
}

