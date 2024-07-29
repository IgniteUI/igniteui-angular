import { IconMeta } from "./types";
import type { IconReference, IconThemeKey, MetaReference } from './types';

type Icon = { [key in IconThemeKey]?: IconMeta };

export const iconReferences: MetaReference[] = [];

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

    iconReferences.push(icon as MetaReference);
}

addIcon('more_vert', {
    default: {
        name: 'more_vert',
        family: 'material',
    }
});
addIcon('arrow_prev', {
    default: {
        name: 'chevron_left',
        family: 'material',
    },
    fluent: {
        name: 'arrow_upward',
        family: 'material',
    },
});
addIcon('arrow_next', {
    default: {
        name: 'chevron_right',
        family: 'material',
    },
    fluent: {
        name: 'arrow_downward',
        family: 'material',
    },
});
addIcon('expand', {
    default: {
        name: 'expand_more',
        family: 'material',
    }
});
addIcon('collapse', {
    default: {
        name: 'expand_less',
        family: 'material',
    }
});
addIcon('carousel_prev', {
      default: {
        name: 'arrow_back',
        family: 'material',
      },
      indigo: {
        name: 'chevron_left',
        family: 'material',
      },
});
addIcon('carousel_next', {
      default: {
        name: 'arrow_forward',
        family: 'material',
      },
      indigo: {
        name: 'chevron_right',
        family: 'material',
      },
});
addIcon('arrow_back', {
    default: {
        name: 'arrow_back',
        family: 'material',
    },
});
addIcon('arrow_forward', {
    default: {
        name: 'arrow_forward',
        family: 'material',
    },
});
addIcon('selected', {
    default: {
        name: 'done',
        family: 'material',
    },
});
addIcon('remove', {
    default: {
        name: 'cancel',
        family: 'material',
    },
});
addIcon('input_clear', {
    default: {
        name: 'clear',
        family: 'material',
    },
    material: {
        name: 'cancel',
        family: 'material',
    },
});
addIcon('input_expand', {
    default: {
        name: 'arrow_drop_down',
        family: 'material',
    },
    material: {
        name: 'expand_more',
        family: 'material',
    },
});
addIcon('input_collapse', {
    default: {
        name: 'arrow_drop_up',
        family: 'material',
    },
    material: {
        name: 'expand_less',
        family: 'material',
    },
});
addIcon('arrow_drop_down', {
    default: {
        name: 'arrow_drop_up',
        family: 'material',
    },
});
addIcon('case_sensitive', {
    default: {
        name: 'case-sensitive',
        family: 'imx-icons',
    },
});
addIcon('today', {
    default: {
        name: 'calendar_today',
        family: 'material',
    },
});
addIcon('clock', {
    default: {
        name: 'access_time',
        family: 'material',
    },
});
addIcon('date_range', {
    default: {
        name: 'date_range',
        family: 'material',
    },
});
addIcon('prev', {
    default: {
        name: 'navigate_before',
        family: 'material',
    },
});
addIcon('next', {
    default: {
        name: 'navigate_next',
        family: 'material',
    },
});
addIcon('first_page', {
    default: {
        name: 'first_page',
        family: 'material',
    },
});
addIcon('last_page', {
    default: {
        name: 'last_page',
        family: 'material',
    },
});
addIcon('add', {
    default: {
        name: 'add',
        family: 'material',
    },
});
addIcon('close', {
    default: {
        name: 'close',
        family: 'material',
    },
});
addIcon('error', {
    default: {
        name: 'error',
        family: 'material',
    },
});
addIcon('confirm', {
    default: {
        name: 'check',
        family: 'material',
    },
});
addIcon('cancel', {
    default: {
        name: 'close',
        family: 'material',
    },
});
addIcon('edit', {
    default: {
        name: 'edit',
        family: 'material',
    },
});
addIcon('delete', {
    default: {
        name: 'delete',
        family: 'material',
    },
});
addIcon('pin', {
    default: {
        name: 'pin-left',
        family: 'imx-icons',
    },
});

addIcon('unpin', {
    default: {
        name: 'unpin-left',
        family: 'imx-icons',
    },
});
addIcon('show', {
    default: {
        name: 'visibility',
        family: 'material',
    },
});
addIcon('hide', {
    default: {
        name: 'visibility_off',
        family: 'material',
    },
});
addIcon('tree_expand', {
    default: {
        name: 'chevron_right',
        family: 'material',
    },
});
addIcon('tree_collapse', {
    default: {
        name: 'expand_more',
        family: 'material',
    },
});
addIcon('chevron_right', {
    default: {
        name: 'chevron_right',
        family: 'material',
    },
});
addIcon('chevron_left', {
    default: {
        name: 'chevron_left',
        family: 'material',
    },
});
addIcon('expand_more', {
    default: {
        name: 'expand_more',
        family: 'material',
    },
});
addIcon('filter_list', {
    default: {
        name: 'filter_list',
        family: 'material',
    },
});
addIcon('import_export', {
    default: {
        name: 'import_export',
        family: 'material',
    },
});
addIcon('unfold_more', {
    default: {
        name: 'unfold_more',
        family: 'material',
    },
});
addIcon('unfold_less', {
    default: {
        name: 'unfold_less',
        family: 'material',
    },
});
addIcon('drag_indicator', {
    default: {
        name: 'drag_indicator',
        family: 'material',
    },
});
addIcon('group_work', {
    default: {
        name: 'group_work',
        family: 'material',
    },
});
addIcon('sort_asc', {
    default: {
        name: 'arrow_upward',
        family: 'material',
    },
});
addIcon('sort_desc', {
    default: {
        name: 'arrow_downward',
        family: 'material',
    },
});
addIcon('search', {
    default: {
        name: 'search',
        family: 'material',
    },
});
addIcon('sum', {
    default: {
        name: 'functions',
        family: 'material',
    },
});
addIcon('table_rows', {
    default: {
        name: 'table_rows',
        family: 'material',
    },
});
addIcon('view_column', {
    default: {
        name: 'view_column',
        family: 'material',
    },
});
addIcon('refresh', {
    default: {
        name: 'refresh',
        family: 'material',
    },
});
addIcon('add_row', {
    default: {
        name: 'add-row',
        family: 'imx-icons',
    },
});
addIcon('add_child', {
    default: {
        name: 'add-child',
        family: 'imx-icons',
    },
});
addIcon('jump_up', {
    default: {
        name: 'jump-up',
        family: 'imx-icons',
    },
});
addIcon('jump_down', {
    default: {
        name: 'jump-down',
        family: 'imx-icons',
    },
});
