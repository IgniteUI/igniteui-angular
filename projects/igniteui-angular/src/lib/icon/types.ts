/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { Theme } from 'igniteui-webcomponents/theming/types.js';

// Exported internal types
export type IconThemeKey = Theme | 'default';

export type IconReferencePair = {
  alias: IconMeta;
  target: IconMeta;
  overwrite: boolean;
};
export type IconType = "svg" | "font" | "liga";

export type IconReference = IconMeta & FamilyMeta;

export type MetaReference = {
  alias: IconMeta;
  target: Map<IconThemeKey, IconMeta>;
};

export interface FamilyMeta {
    className: string;
    type: IconType;
    prefix?: string;
}

export interface IconFamily {
    name: string;
    meta: FamilyMeta;
}

// Exported public types
export interface IconMeta {
    name: string;
    family: string;
    type?: IconType;
}
