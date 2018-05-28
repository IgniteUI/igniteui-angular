/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { dashCaseToCamelCase } from '../../util';
import { AnimationStyleNormalizer } from './animation_style_normalizer';
export class WebAnimationsStyleNormalizer extends AnimationStyleNormalizer {
    /**
     * @param {?} propertyName
     * @param {?} errors
     * @return {?}
     */
    normalizePropertyName(propertyName, errors) {
        return dashCaseToCamelCase(propertyName);
    }
    /**
     * @param {?} userProvidedProperty
     * @param {?} normalizedProperty
     * @param {?} value
     * @param {?} errors
     * @return {?}
     */
    normalizeStyleValue(userProvidedProperty, normalizedProperty, value, errors) {
        let /** @type {?} */ unit = '';
        const /** @type {?} */ strVal = value.toString().trim();
        if (DIMENSIONAL_PROP_MAP[normalizedProperty] && value !== 0 && value !== '0') {
            if (typeof value === 'number') {
                unit = 'px';
            }
            else {
                const /** @type {?} */ valAndSuffixMatch = value.match(/^[+-]?[\d\.]+([a-z]*)$/);
                if (valAndSuffixMatch && valAndSuffixMatch[1].length == 0) {
                    errors.push(`Please provide a CSS unit value for ${userProvidedProperty}:${value}`);
                }
            }
        }
        return strVal + unit;
    }
}
const /** @type {?} */ DIMENSIONAL_PROP_MAP = makeBooleanMap('width,height,minWidth,minHeight,maxWidth,maxHeight,left,top,bottom,right,fontSize,outlineWidth,outlineOffset,paddingTop,paddingLeft,paddingBottom,paddingRight,marginTop,marginLeft,marginBottom,marginRight,borderRadius,borderWidth,borderTopWidth,borderLeftWidth,borderRightWidth,borderBottomWidth,textIndent,perspective'
    .split(','));
/**
 * @param {?} keys
 * @return {?}
 */
function makeBooleanMap(keys) {
    const /** @type {?} */ map = {};
    keys.forEach(key => map[key] = true);
    return map;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViX2FuaW1hdGlvbnNfc3R5bGVfbm9ybWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvZHNsL3N0eWxlX25vcm1hbGl6YXRpb24vd2ViX2FuaW1hdGlvbnNfc3R5bGVfbm9ybWFsaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBT0EsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRS9DLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBRXRFLE1BQU0sbUNBQW9DLFNBQVEsd0JBQXdCOzs7Ozs7SUFDeEUscUJBQXFCLENBQUMsWUFBb0IsRUFBRSxNQUFnQjtRQUMxRCxNQUFNLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLENBQUM7S0FDMUM7Ozs7Ozs7O0lBRUQsbUJBQW1CLENBQ2Ysb0JBQTRCLEVBQUUsa0JBQTBCLEVBQUUsS0FBb0IsRUFDOUUsTUFBZ0I7UUFDbEIscUJBQUksSUFBSSxHQUFXLEVBQUUsQ0FBQztRQUN0Qix1QkFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXZDLEVBQUUsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLGtCQUFrQixDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsSUFBSSxLQUFLLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM3RSxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixJQUFJLEdBQUcsSUFBSSxDQUFDO2FBQ2I7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTix1QkFBTSxpQkFBaUIsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7Z0JBQ2hFLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixJQUFJLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMxRCxNQUFNLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxvQkFBb0IsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO2lCQUNyRjthQUNGO1NBQ0Y7UUFDRCxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztLQUN0QjtDQUNGO0FBRUQsdUJBQU0sb0JBQW9CLEdBQUcsY0FBYyxDQUN2QyxnVUFBZ1U7S0FDM1QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Ozs7O0FBRXJCLHdCQUF3QixJQUFjO0lBQ3BDLHVCQUFNLEdBQUcsR0FBNkIsRUFBRSxDQUFDO0lBQ3pDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDckMsTUFBTSxDQUFDLEdBQUcsQ0FBQztDQUNaIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtkYXNoQ2FzZVRvQ2FtZWxDYXNlfSBmcm9tICcuLi8uLi91dGlsJztcblxuaW1wb3J0IHtBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXJ9IGZyb20gJy4vYW5pbWF0aW9uX3N0eWxlX25vcm1hbGl6ZXInO1xuXG5leHBvcnQgY2xhc3MgV2ViQW5pbWF0aW9uc1N0eWxlTm9ybWFsaXplciBleHRlbmRzIEFuaW1hdGlvblN0eWxlTm9ybWFsaXplciB7XG4gIG5vcm1hbGl6ZVByb3BlcnR5TmFtZShwcm9wZXJ0eU5hbWU6IHN0cmluZywgZXJyb3JzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGRhc2hDYXNlVG9DYW1lbENhc2UocHJvcGVydHlOYW1lKTtcbiAgfVxuXG4gIG5vcm1hbGl6ZVN0eWxlVmFsdWUoXG4gICAgICB1c2VyUHJvdmlkZWRQcm9wZXJ0eTogc3RyaW5nLCBub3JtYWxpemVkUHJvcGVydHk6IHN0cmluZywgdmFsdWU6IHN0cmluZ3xudW1iZXIsXG4gICAgICBlcnJvcnM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgICBsZXQgdW5pdDogc3RyaW5nID0gJyc7XG4gICAgY29uc3Qgc3RyVmFsID0gdmFsdWUudG9TdHJpbmcoKS50cmltKCk7XG5cbiAgICBpZiAoRElNRU5TSU9OQUxfUFJPUF9NQVBbbm9ybWFsaXplZFByb3BlcnR5XSAmJiB2YWx1ZSAhPT0gMCAmJiB2YWx1ZSAhPT0gJzAnKSB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICB1bml0ID0gJ3B4JztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHZhbEFuZFN1ZmZpeE1hdGNoID0gdmFsdWUubWF0Y2goL15bKy1dP1tcXGRcXC5dKyhbYS16XSopJC8pO1xuICAgICAgICBpZiAodmFsQW5kU3VmZml4TWF0Y2ggJiYgdmFsQW5kU3VmZml4TWF0Y2hbMV0ubGVuZ3RoID09IDApIHtcbiAgICAgICAgICBlcnJvcnMucHVzaChgUGxlYXNlIHByb3ZpZGUgYSBDU1MgdW5pdCB2YWx1ZSBmb3IgJHt1c2VyUHJvdmlkZWRQcm9wZXJ0eX06JHt2YWx1ZX1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3RyVmFsICsgdW5pdDtcbiAgfVxufVxuXG5jb25zdCBESU1FTlNJT05BTF9QUk9QX01BUCA9IG1ha2VCb29sZWFuTWFwKFxuICAgICd3aWR0aCxoZWlnaHQsbWluV2lkdGgsbWluSGVpZ2h0LG1heFdpZHRoLG1heEhlaWdodCxsZWZ0LHRvcCxib3R0b20scmlnaHQsZm9udFNpemUsb3V0bGluZVdpZHRoLG91dGxpbmVPZmZzZXQscGFkZGluZ1RvcCxwYWRkaW5nTGVmdCxwYWRkaW5nQm90dG9tLHBhZGRpbmdSaWdodCxtYXJnaW5Ub3AsbWFyZ2luTGVmdCxtYXJnaW5Cb3R0b20sbWFyZ2luUmlnaHQsYm9yZGVyUmFkaXVzLGJvcmRlcldpZHRoLGJvcmRlclRvcFdpZHRoLGJvcmRlckxlZnRXaWR0aCxib3JkZXJSaWdodFdpZHRoLGJvcmRlckJvdHRvbVdpZHRoLHRleHRJbmRlbnQscGVyc3BlY3RpdmUnXG4gICAgICAgIC5zcGxpdCgnLCcpKTtcblxuZnVuY3Rpb24gbWFrZUJvb2xlYW5NYXAoa2V5czogc3RyaW5nW10pOiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn0ge1xuICBjb25zdCBtYXA6IHtba2V5OiBzdHJpbmddOiBib29sZWFufSA9IHt9O1xuICBrZXlzLmZvckVhY2goa2V5ID0+IG1hcFtrZXldID0gdHJ1ZSk7XG4gIHJldHVybiBtYXA7XG59XG4iXX0=