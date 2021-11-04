import { isDevMode } from '@angular/core';

/**
 * @hidden
 */
export const showMessage = (message: string, isMessageShown: boolean): boolean => {
    if (!isMessageShown && isDevMode()) {
        console.warn(message);
    }

    return true;
};
