import { ITreeResourceStrings } from 'igniteui-angular/core';

// only use `satisfies` operator so export is typed by its schema
/**
 * German resource strings for IgxTree
 */
export const TreeResourceStringsDE = {
    igx_expand: 'Erweitern',
    igx_collapse: 'Reduzieren'
} satisfies MakeRequired<ITreeResourceStrings>;
