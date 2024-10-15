/** READ BEFORE YOU MODIFY THIS FILE!
 *
 * Before you add/modify an icon reference, please think about the semantics of the icon you are adding/modifying.
 *
 * Icon aliases have sematic meaning depending on the context in which they are used.
 * For instance, if your component handles toggling between expanded and collapsed states,
 * you may want to use the already existing `expand` and `collapse` aliases that point to
 * the `expand_more` and `expand_less` icons in the material font set.
 *
 * It may so happen, however, that the design of your component requires you to use the `chevron_right` for the
 * expand icon and the `expand_more` for the collapse icon. In this case the `tree_expand` and `tree_collapse` aliases
 * would be appropriate.
 * This distinction is important when choosing which icon to use for your component as it will have an impact
 * when a user decides to rewire the `expand`/`collapse` icons to some other icons.
 *
 * Likewise, modifying existing references should be handled with caution as many component in the framework already
 * share icons that have equivalent semantic meaning. For example, the `Paginator`, `Grid Filtering Row`,
 * and `Tabs` components in Ignite UI for Angular all use the `prev` and `next` icons for navigating between pages
 * or lists of items. Changing the underlying target for those icons should be done in a way that suits all components.
 *
 * Keep in mind that icon aliases and their underlying names are shared between Ignite UI component frameworks
 * and changing an alias name here should be reflected in the other frameworks as well.
 *
 * To get acquainted with which component uses what icon, please make sure to read the
 * [docs](https://infragistics.com/products/ignite-ui-angular/Angular/components/icon-service#internal-usage).
 */
import { IconMeta } from "./types";
import type { IconReference, IconThemeKey, MetaReference } from './types';

type Icon = { [key in IconThemeKey]?: IconMeta };

const makeIconRefs = (icons: Icon) => {
  return new Map(
    Object.entries(icons).map((icon) => {
      return icon as [theme: IconThemeKey, IconReference];
    })
  );
};

const addIcon = (name: string, target: Icon) => {
    const icon = {
        alias: {
            name,
            family: 'default'
        },
        target: makeIconRefs(target)
    };

    return icon as MetaReference;
}

const loadIconRefs = () => [
    addIcon('more_vert', {
        default: {
            name: 'more_vert',
            family: 'material',
        }
    }),
    addIcon('arrow_prev', {
        default: {
            name: 'chevron_left',
            family: 'material',
        },
        fluent: {
            name: 'arrow_upward',
            family: 'material',
        },
        indigo: {
            name: 'chevron_left',
            family: 'internal_indigo',
        },
    }),
    addIcon('arrow_next', {
        default: {
            name: 'chevron_right',
            family: 'material',
        },
        fluent: {
            name: 'arrow_downward',
            family: 'material',
        },
        indigo: {
            name: 'chevron_right',
            family: 'internal_indigo',
        },
    }),
    addIcon('expand', {
        default: {
            name: 'expand_more',
            family: 'material',
        },
        indigo: {
            name: 'chevron_down',
            family: 'internal_indigo',
        }
    }),
    addIcon('collapse', {
        default: {
            name: 'expand_less',
            family: 'material',
        },
        indigo: {
            name: 'chevron_up',
            family: 'internal_indigo',
        }
    }),
    addIcon('carousel_prev', {
          default: {
            name: 'keyboard_arrow_left',
            family: 'material',
          },
          indigo: {
            name: 'chevron_left',
            family: 'internal_indigo',
          },
    }),
    addIcon('carousel_next', {
          default: {
            name: 'keyboard_arrow_right',
            family: 'material',
          },
          indigo: {
            name: 'chevron_right',
            family: 'internal_indigo',
          },
    }),
    addIcon('arrow_back', {
        default: {
            name: 'arrow_back',
            family: 'material',
        },
        indigo: {
            name: 'arrow_back',
            family: 'internal_indigo',
        },
    }),
    addIcon('arrow_forward', {
        default: {
            name: 'arrow_forward',
            family: 'material',
        },
        indigo: {
            name: 'arrow_forward',
            family: 'internal_indigo',
        },
    }),
    addIcon('selected', {
        default: {
            name: 'done',
            family: 'material',
        },
        indigo: {
            name: 'check',
            family: 'internal_indigo',
        },
    }),
    addIcon('remove', {
        default: {
            name: 'cancel',
            family: 'material',
        },
        indigo: {
            name: 'cancel',
            family: 'internal_indigo',
        },
    }),
    addIcon('input_clear', {
        default: {
            name: 'clear',
            family: 'material',
        },
        indigo: {
            name: 'clear',
            family: 'internal_indigo',
        },
    }),
    addIcon('input_expand', {
        default: {
            name: 'expand_more',
            family: 'material',
        },
        indigo: {
            name: 'chevron_down',
            family: 'internal_indigo',
        },
    }),
    addIcon('input_collapse', {
        default: {
            name: 'expand_less',
            family: 'material',
        },
        indigo: {
            name: 'chevron_up',
            family: 'internal_indigo',
        },
    }),
    addIcon('arrow_drop_down', {
        default: {
            name: 'keyboard_arrow_down',
            family: 'material',
        },
        indigo: {
            name: 'chevron_down',
            family: 'internal_indigo',
        },
    }),
    addIcon('case_sensitive', {
        default: {
            name: 'case-sensitive',
            family: 'imx-icons',
        },
    }),
    addIcon('today', {
        default: {
            name: 'calendar_today',
            family: 'material',
        },
        indigo: {
            name: 'calendar_today',
            family: 'internal_indigo',
        },
    }),
    addIcon('clock', {
        default: {
            name: 'access_time',
            family: 'material',
        },
        indigo: {
            name: 'access_time',
            family: 'internal_indigo',
        }
    }),
    addIcon('date_range', {
        default: {
            name: 'date_range',
            family: 'material',
        },
        indigo: {
            name: 'calendar_today',
            family: 'internal_indigo',
        },
    }),
    addIcon('prev', {
        default: {
            name: 'navigate_before',
            family: 'material',
        },
        indigo: {
            name: 'chevron_left',
            family: 'internal_indigo',
        },
    }),
    addIcon('next', {
        default: {
            name: 'navigate_next',
            family: 'material',
        },
        indigo: {
            name: 'chevron_right',
            family: 'internal_indigo',
        },
    }),
    addIcon('first_page', {
        default: {
            name: 'first_page',
            family: 'material',
        },
        indigo: {
            name: 'first_page',
            family: 'internal_indigo',
        },
    }),
    addIcon('last_page', {
        default: {
            name: 'last_page',
            family: 'material',
        },
        indigo: {
            name: 'last_page',
            family: 'internal_indigo',
        },
    }),
    addIcon('add', {
        default: {
            name: 'add',
            family: 'material',
        },
        indigo: {
            name: 'add',
            family: 'internal_indigo',
        }
    }),
    addIcon('close', {
        default: {
            name: 'close',
            family: 'material',
        },
        indigo: {
            name: 'clear',
            family: 'internal_indigo',
        },
    }),
    addIcon('error', {
        default: {
            name: 'error',
            family: 'material',
        },
        indigo: {
            name: 'error',
            family: 'internal_indigo',
        }
    }),
    addIcon('confirm', {
        default: {
            name: 'check',
            family: 'material',
        },
        indigo: {
            name: 'check',
            family: 'internal_indigo',
        },
    }),
    addIcon('cancel', {
        default: {
            name: 'close',
            family: 'material',
        },
        indigo: {
            name: 'clear',
            family: 'internal_indigo',
        },
    }),
    addIcon('edit', {
        default: {
            name: 'edit',
            family: 'material',
        },
    }),
    addIcon('delete', {
        default: {
            name: 'delete',
            family: 'material',
        },
    }),
    addIcon('pin', {
        default: {
            name: 'pin-left',
            family: 'imx-icons',
        },
        indigo: {
            name: 'pin',
            family: 'internal_indigo',
        },
    }),
    addIcon('unpin', {
        default: {
            name: 'unpin-left',
            family: 'imx-icons',
        },
        indigo: {
            name: 'unpin',
            family: 'internal_indigo',
        },
    }),
    addIcon('show', {
        default: {
            name: 'visibility',
            family: 'material',
        },
    }),
    addIcon('hide', {
        default: {
            name: 'visibility_off',
            family: 'material',
        },
    }),
    addIcon('tree_expand', {
        default: {
            name: 'chevron_right',
            family: 'material',
        },
        indigo: {
            name: 'chevron_right',
            family: 'internal_indigo',
        },
    }),
    addIcon('tree_collapse', {
        default: {
            name: 'expand_more',
            family: 'material',
        },
        indigo: {
            name: 'chevron_down',
            family: 'internal_indigo',
        },
    }),
    addIcon('chevron_right', {
        default: {
            name: 'chevron_right',
            family: 'material',
        },
        indigo: {
            name: 'chevron_right',
            family: 'internal_indigo',
        },
    }),
    addIcon('chevron_left', {
        default: {
            name: 'chevron_left',
            family: 'material',
        },
        indigo: {
            name: 'chevron_left',
            family: 'internal_indigo',
        },
    }),
    addIcon('expand_more', {
        default: {
            name: 'expand_more',
            family: 'material',
        },
        indigo: {
            name: 'chevron_down',
            family: 'internal_indigo',
        },
    }),
    addIcon('filter_list', {
        default: {
            name: 'filter_list',
            family: 'material',
        },
        indigo: {
            name: 'filter_list',
            family: 'internal_indigo',
        },
    }),
    addIcon('import_export', {
        default: {
            name: 'import_export',
            family: 'material',
        },
    }),
    addIcon('unfold_more', {
        default: {
            name: 'unfold_more',
            family: 'material',
        },
        indigo: {
            name: 'unfold_more',
            family: 'internal_indigo',
        },
    }),
    addIcon('unfold_less', {
        default: {
            name: 'unfold_less',
            family: 'material',
        },
        indigo: {
            name: 'unfold_less',
            family: 'internal_indigo',
        },
    }),
    addIcon('drag_indicator', {
        default: {
            name: 'drag_indicator',
            family: 'material',
        },
    }),
    addIcon('group_work', {
        default: {
            name: 'group_work',
            family: 'material',
        },
    }),
    addIcon('sort_asc', {
        default: {
            name: 'arrow_upward',
            family: 'material',
        },
        indigo: {
            name: 'arrow_upward',
            family: 'internal_indigo',
        },
    }),
    addIcon('sort_desc', {
        default: {
            name: 'arrow_downward',
            family: 'material',
        },
        indigo: {
            name: 'arrow_downward',
            family: 'internal_indigo',
        },
    }),
    addIcon('search', {
        default: {
            name: 'search',
            family: 'material',
        },
        indigo: {
            name: 'search',
            family: 'internal_indigo',
        },
    }),
    addIcon('functions', {
        default: {
            name: 'functions',
            family: 'material',
        },
    }),
    addIcon('table_rows', {
        default: {
            name: 'table_rows',
            family: 'material',
        },
    }),
    addIcon('view_column', {
        default: {
            name: 'view_column',
            family: 'material',
        },
    }),
    addIcon('refresh', {
        default: {
            name: 'refresh',
            family: 'material',
        },
        indigo: {
            name: 'refresh',
            family: 'internal_indigo',
        },
    }),
    addIcon('add_row', {
        default: {
            name: 'add-row',
            family: 'imx-icons',
        },
    }),
    addIcon('add_child', {
        default: {
            name: 'add-child',
            family: 'imx-icons',
        },
    }),
    addIcon('jump_up', {
        default: {
            name: 'jump-up',
            family: 'imx-icons',
        },
    }),
    addIcon('jump_down', {
        default: {
            name: 'jump-down',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_null', {
        default: {
            name: 'is-null',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_not_null', {
        default: {
            name: 'is-not-null',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_in', {
        default: {
            name: 'is-in',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_all', {
        default: {
            name: 'select-all',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_true', {
        default: {
            name: 'is-true',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_false', {
        default: {
            name: 'is-false',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_empty', {
        default: {
            name: 'is-empty',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_not_empty', {
        default: {
            name: 'not-empty',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_equal', {
        default: {
            name: 'equals',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_not_equal', {
        default: {
            name: 'not-equal',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_before', {
        default: {
            name: 'is-before',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_after', {
        default: {
            name: 'is-after',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_today', {
        default: {
            name: 'today',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_yesterday', {
        default: {
            name: 'yesterday',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_this_month', {
        default: {
            name: 'this-month',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_last_month', {
        default: {
            name: 'last-month',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_next_month', {
        default: {
            name: 'next-month',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_this_year', {
        default: {
            name: 'this-year',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_last_year', {
        default: {
            name: 'last-year',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_next_year', {
        default: {
            name: 'next-year',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_greater_than', {
        default: {
            name: 'greater-than',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_less_than', {
        default: {
            name: 'less-than',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_greater_than_or_equal', {
        default: {
            name: 'greater-than-or-equal',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_less_than_or_equal', {
        default: {
            name: 'less-than-or-equal',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_contains', {
        default: {
            name: 'contains',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_does_not_contain', {
        default: {
            name: 'does-not-contain',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_starts_with', {
        default: {
            name: 'starts-with',
            family: 'imx-icons',
        },
    }),
    addIcon('filter_ends_with', {
        default: {
            name: 'ends-with',
            family: 'imx-icons',
        },
    }),
    addIcon('ungroup', {
        default: {
            name: 'ungroup',
            family: 'imx-icons',
        },
    }),
    addIcon('file_download', {
        default: {
            name: 'file_download',
            family: 'material',
        },
        indigo: {
            name: 'file_download',
            family: 'internal_indigo',
        }
    }),
    addIcon('file_upload', {
        default: {
            name: 'file_upload',
            family: 'material',
        },
        indigo: {
            name: 'file_upload',
            family: 'internal_indigo',
        }
    }),
    addIcon('horizontal_rule', {
        default: {
            name: 'horizontal_rule',
            family: 'material',
        },
        indigo: {
            name: 'horizontal_rule',
            family: 'internal_indigo',
        }
    }),
    addIcon('menu', {
        default: {
            name: 'menu',
            family: 'material',
        },
        indigo: {
            name: 'menu',
            family: 'internal_indigo',
        }
    }),
];

export const iconReferences = /*@__PURE__*/ loadIconRefs();
