/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
export function parseCookieValue(cookieStr, name) {
    name = encodeURIComponent(name);
    try {
        for (var _a = tslib_1.__values(cookieStr.split(';')), _b = _a.next(); !_b.done; _b = _a.next()) {
            var cookie = _b.value;
            var eqIndex = cookie.indexOf('=');
            var _c = tslib_1.__read(eqIndex == -1 ? [cookie, ''] : [cookie.slice(0, eqIndex), cookie.slice(eqIndex + 1)], 2), cookieName = _c[0], cookieValue = _c[1];
            if (cookieName.trim() === name) {
                return decodeURIComponent(cookieValue);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return null;
    var e_1, _d;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29va2llLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9jb29raWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFRQSxNQUFNLDJCQUEyQixTQUFpQixFQUFFLElBQVk7SUFDOUQsSUFBSSxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDOztRQUNoQyxHQUFHLENBQUMsQ0FBaUIsSUFBQSxLQUFBLGlCQUFBLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUEsZ0JBQUE7WUFBcEMsSUFBTSxNQUFNLFdBQUE7WUFDZixJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BDLGtIQUFPLGtCQUFVLEVBQUUsbUJBQVcsQ0FDMkQ7WUFDekYsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUN4QztTQUNGOzs7Ozs7Ozs7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDOztDQUNiIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDb29raWVWYWx1ZShjb29raWVTdHI6IHN0cmluZywgbmFtZTogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICBuYW1lID0gZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpO1xuICBmb3IgKGNvbnN0IGNvb2tpZSBvZiBjb29raWVTdHIuc3BsaXQoJzsnKSkge1xuICAgIGNvbnN0IGVxSW5kZXggPSBjb29raWUuaW5kZXhPZignPScpO1xuICAgIGNvbnN0IFtjb29raWVOYW1lLCBjb29raWVWYWx1ZV06IHN0cmluZ1tdID1cbiAgICAgICAgZXFJbmRleCA9PSAtMSA/IFtjb29raWUsICcnXSA6IFtjb29raWUuc2xpY2UoMCwgZXFJbmRleCksIGNvb2tpZS5zbGljZShlcUluZGV4ICsgMSldO1xuICAgIGlmIChjb29raWVOYW1lLnRyaW0oKSA9PT0gbmFtZSkge1xuICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChjb29raWVWYWx1ZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuIl19