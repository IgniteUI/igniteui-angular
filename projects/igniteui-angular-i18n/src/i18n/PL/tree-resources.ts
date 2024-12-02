import { ITreeResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Polish resource strings for IgxTree
 */
export const TreeResourceStringsPL = {
    igx_expand: 'Rozwiń',
    igx_collapse: 'Zwiń'
} satisfies MakeRequired<ITreeResourceStrings>;
