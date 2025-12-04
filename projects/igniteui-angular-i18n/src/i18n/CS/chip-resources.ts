import { IChipResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Czech resource strings for IgxChip
 */
export const ChipResourceStringsCS = {
    igx_chip_remove: 'Odebrat čip',
    igx_chip_select: 'Vybrat čip'
} satisfies MakeRequired<IChipResourceStrings>;
