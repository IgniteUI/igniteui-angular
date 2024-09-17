import { ITreeResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * French resource strings for IgxTree
 */
export const TreeResourceStringsFR = {
    igx_expand: 'Développer',
    igx_collapse: 'Réduire'
} satisfies MakeRequired<ITreeResourceStrings>;
