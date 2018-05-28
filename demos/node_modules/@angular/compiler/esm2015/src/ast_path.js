/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A path is an ordered set of elements. Typically a path is to  a
 * particular offset in a source file. The head of the list is the top
 * most node. The tail is the node that contains the offset directly.
 *
 * For example, the expression `a + b + c` might have an ast that looks
 * like:
 *     +
 *    / \
 *   a   +
 *      / \
 *     b   c
 *
 * The path to the node at offset 9 would be `['+' at 1-10, '+' at 7-10,
 * 'c' at 9-10]` and the path the node at offset 1 would be
 * `['+' at 1-10, 'a' at 1-2]`.
 */
export class AstPath {
    constructor(path, position = -1) {
        this.path = path;
        this.position = position;
    }
    get empty() { return !this.path || !this.path.length; }
    get head() { return this.path[0]; }
    get tail() { return this.path[this.path.length - 1]; }
    parentOf(node) {
        return node && this.path[this.path.indexOf(node) - 1];
    }
    childOf(node) { return this.path[this.path.indexOf(node) + 1]; }
    first(ctor) {
        for (let i = this.path.length - 1; i >= 0; i--) {
            let item = this.path[i];
            if (item instanceof ctor)
                return item;
        }
    }
    push(node) { this.path.push(node); }
    pop() { return this.path.pop(); }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN0X3BhdGguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvYXN0X3BhdGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUg7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFDSCxNQUFNO0lBQ0osWUFBb0IsSUFBUyxFQUFTLFdBQW1CLENBQUMsQ0FBQztRQUF2QyxTQUFJLEdBQUosSUFBSSxDQUFLO1FBQVMsYUFBUSxHQUFSLFFBQVEsQ0FBYTtJQUFHLENBQUM7SUFFL0QsSUFBSSxLQUFLLEtBQWMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNoRSxJQUFJLElBQUksS0FBa0IsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hELElBQUksSUFBSSxLQUFrQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFbkUsUUFBUSxDQUFDLElBQWlCO1FBQ3hCLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBQ0QsT0FBTyxDQUFDLElBQU8sSUFBaUIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRWhGLEtBQUssQ0FBYyxJQUErQjtRQUNoRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQy9DLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEIsRUFBRSxDQUFDLENBQUMsSUFBSSxZQUFZLElBQUksQ0FBQztnQkFBQyxNQUFNLENBQUksSUFBSSxDQUFDO1FBQzNDLENBQUM7SUFDSCxDQUFDO0lBRUQsSUFBSSxDQUFDLElBQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFdkMsR0FBRyxLQUFRLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBSSxDQUFDLENBQUMsQ0FBQztDQUN2QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBBIHBhdGggaXMgYW4gb3JkZXJlZCBzZXQgb2YgZWxlbWVudHMuIFR5cGljYWxseSBhIHBhdGggaXMgdG8gIGFcbiAqIHBhcnRpY3VsYXIgb2Zmc2V0IGluIGEgc291cmNlIGZpbGUuIFRoZSBoZWFkIG9mIHRoZSBsaXN0IGlzIHRoZSB0b3BcbiAqIG1vc3Qgbm9kZS4gVGhlIHRhaWwgaXMgdGhlIG5vZGUgdGhhdCBjb250YWlucyB0aGUgb2Zmc2V0IGRpcmVjdGx5LlxuICpcbiAqIEZvciBleGFtcGxlLCB0aGUgZXhwcmVzc2lvbiBgYSArIGIgKyBjYCBtaWdodCBoYXZlIGFuIGFzdCB0aGF0IGxvb2tzXG4gKiBsaWtlOlxuICogICAgICtcbiAqICAgIC8gXFxcbiAqICAgYSAgICtcbiAqICAgICAgLyBcXFxuICogICAgIGIgICBjXG4gKlxuICogVGhlIHBhdGggdG8gdGhlIG5vZGUgYXQgb2Zmc2V0IDkgd291bGQgYmUgYFsnKycgYXQgMS0xMCwgJysnIGF0IDctMTAsXG4gKiAnYycgYXQgOS0xMF1gIGFuZCB0aGUgcGF0aCB0aGUgbm9kZSBhdCBvZmZzZXQgMSB3b3VsZCBiZVxuICogYFsnKycgYXQgMS0xMCwgJ2EnIGF0IDEtMl1gLlxuICovXG5leHBvcnQgY2xhc3MgQXN0UGF0aDxUPiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcGF0aDogVFtdLCBwdWJsaWMgcG9zaXRpb246IG51bWJlciA9IC0xKSB7fVxuXG4gIGdldCBlbXB0eSgpOiBib29sZWFuIHsgcmV0dXJuICF0aGlzLnBhdGggfHwgIXRoaXMucGF0aC5sZW5ndGg7IH1cbiAgZ2V0IGhlYWQoKTogVHx1bmRlZmluZWQgeyByZXR1cm4gdGhpcy5wYXRoWzBdOyB9XG4gIGdldCB0YWlsKCk6IFR8dW5kZWZpbmVkIHsgcmV0dXJuIHRoaXMucGF0aFt0aGlzLnBhdGgubGVuZ3RoIC0gMV07IH1cblxuICBwYXJlbnRPZihub2RlOiBUfHVuZGVmaW5lZCk6IFR8dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gbm9kZSAmJiB0aGlzLnBhdGhbdGhpcy5wYXRoLmluZGV4T2Yobm9kZSkgLSAxXTtcbiAgfVxuICBjaGlsZE9mKG5vZGU6IFQpOiBUfHVuZGVmaW5lZCB7IHJldHVybiB0aGlzLnBhdGhbdGhpcy5wYXRoLmluZGV4T2Yobm9kZSkgKyAxXTsgfVxuXG4gIGZpcnN0PE4gZXh0ZW5kcyBUPihjdG9yOiB7bmV3ICguLi5hcmdzOiBhbnlbXSk6IE59KTogTnx1bmRlZmluZWQge1xuICAgIGZvciAobGV0IGkgPSB0aGlzLnBhdGgubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGxldCBpdGVtID0gdGhpcy5wYXRoW2ldO1xuICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBjdG9yKSByZXR1cm4gPE4+aXRlbTtcbiAgICB9XG4gIH1cblxuICBwdXNoKG5vZGU6IFQpIHsgdGhpcy5wYXRoLnB1c2gobm9kZSk7IH1cblxuICBwb3AoKTogVCB7IHJldHVybiB0aGlzLnBhdGgucG9wKCkgITsgfVxufVxuIl19