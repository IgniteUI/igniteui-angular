/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { assertEqual, assertNotNull } from './assert';
/**
 * @param {?} node
 * @param {?} type
 * @return {?}
 */
export function assertNodeType(node, type) {
    assertNotNull(node, 'should be called with a node');
    assertEqual(node.type, type, `should be a ${typeName(type)}`);
}
/**
 * @param {?} node
 * @param {...?} types
 * @return {?}
 */
export function assertNodeOfPossibleTypes(node, ...types) {
    assertNotNull(node, 'should be called with a node');
    const /** @type {?} */ found = types.some(type => node.type === type);
    assertEqual(found, true, `Should be one of ${types.map(typeName).join(', ')}`);
}
/**
 * @param {?} type
 * @return {?}
 */
function typeName(type) {
    if (type == 1 /* Projection */)
        return 'Projection';
    if (type == 0 /* Container */)
        return 'Container';
    if (type == 2 /* View */)
        return 'View';
    if (type == 3 /* Element */)
        return 'Element';
    return '<unknown>';
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZV9hc3NlcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL25vZGVfYXNzZXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLFdBQVcsRUFBRSxhQUFhLEVBQUMsTUFBTSxVQUFVLENBQUM7Ozs7OztBQUdwRCxNQUFNLHlCQUF5QixJQUFXLEVBQUUsSUFBZTtJQUN6RCxhQUFhLENBQUMsSUFBSSxFQUFFLDhCQUE4QixDQUFDLENBQUM7SUFDcEQsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLGVBQWUsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUMvRDs7Ozs7O0FBRUQsTUFBTSxvQ0FBb0MsSUFBVyxFQUFFLEdBQUcsS0FBa0I7SUFDMUUsYUFBYSxDQUFDLElBQUksRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO0lBQ3BELHVCQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQztJQUNyRCxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxvQkFBb0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ2hGOzs7OztBQUVELGtCQUFrQixJQUFlO0lBQy9CLEVBQUUsQ0FBQyxDQUFDLElBQUksc0JBQXdCLENBQUM7UUFBQyxNQUFNLENBQUMsWUFBWSxDQUFDO0lBQ3RELEVBQUUsQ0FBQyxDQUFDLElBQUkscUJBQXVCLENBQUM7UUFBQyxNQUFNLENBQUMsV0FBVyxDQUFDO0lBQ3BELEVBQUUsQ0FBQyxDQUFDLElBQUksZ0JBQWtCLENBQUM7UUFBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQzFDLEVBQUUsQ0FBQyxDQUFDLElBQUksbUJBQXFCLENBQUM7UUFBQyxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ2hELE1BQU0sQ0FBQyxXQUFXLENBQUM7Q0FDcEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7YXNzZXJ0RXF1YWwsIGFzc2VydE5vdE51bGx9IGZyb20gJy4vYXNzZXJ0JztcbmltcG9ydCB7TE5vZGUsIExOb2RlVHlwZX0gZnJvbSAnLi9pbnRlcmZhY2VzL25vZGUnO1xuXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0Tm9kZVR5cGUobm9kZTogTE5vZGUsIHR5cGU6IExOb2RlVHlwZSkge1xuICBhc3NlcnROb3ROdWxsKG5vZGUsICdzaG91bGQgYmUgY2FsbGVkIHdpdGggYSBub2RlJyk7XG4gIGFzc2VydEVxdWFsKG5vZGUudHlwZSwgdHlwZSwgYHNob3VsZCBiZSBhICR7dHlwZU5hbWUodHlwZSl9YCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROb2RlT2ZQb3NzaWJsZVR5cGVzKG5vZGU6IExOb2RlLCAuLi50eXBlczogTE5vZGVUeXBlW10pIHtcbiAgYXNzZXJ0Tm90TnVsbChub2RlLCAnc2hvdWxkIGJlIGNhbGxlZCB3aXRoIGEgbm9kZScpO1xuICBjb25zdCBmb3VuZCA9IHR5cGVzLnNvbWUodHlwZSA9PiBub2RlLnR5cGUgPT09IHR5cGUpO1xuICBhc3NlcnRFcXVhbChmb3VuZCwgdHJ1ZSwgYFNob3VsZCBiZSBvbmUgb2YgJHt0eXBlcy5tYXAodHlwZU5hbWUpLmpvaW4oJywgJyl9YCk7XG59XG5cbmZ1bmN0aW9uIHR5cGVOYW1lKHR5cGU6IExOb2RlVHlwZSk6IHN0cmluZyB7XG4gIGlmICh0eXBlID09IExOb2RlVHlwZS5Qcm9qZWN0aW9uKSByZXR1cm4gJ1Byb2plY3Rpb24nO1xuICBpZiAodHlwZSA9PSBMTm9kZVR5cGUuQ29udGFpbmVyKSByZXR1cm4gJ0NvbnRhaW5lcic7XG4gIGlmICh0eXBlID09IExOb2RlVHlwZS5WaWV3KSByZXR1cm4gJ1ZpZXcnO1xuICBpZiAodHlwZSA9PSBMTm9kZVR5cGUuRWxlbWVudCkgcmV0dXJuICdFbGVtZW50JztcbiAgcmV0dXJuICc8dW5rbm93bj4nO1xufVxuIl19