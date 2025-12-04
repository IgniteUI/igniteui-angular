import { IChipResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Norwegian resource strings for IgxChip
 */
export const ChipResourceStringsNB = {
    igx_chip_remove: 'Fjern brikke',
    igx_chip_select: 'Velg brikke'
} satisfies MakeRequired<IChipResourceStrings>;
