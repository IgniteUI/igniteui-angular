import * as tslib_1 from "tslib";
var ElementInstructionMap = /** @class */ (function () {
    function ElementInstructionMap() {
        this._map = new Map();
    }
    ElementInstructionMap.prototype.consume = function (element) {
        var instructions = this._map.get(element);
        if (instructions) {
            this._map.delete(element);
        }
        else {
            instructions = [];
        }
        return instructions;
    };
    ElementInstructionMap.prototype.append = function (element, instructions) {
        var existingInstructions = this._map.get(element);
        if (!existingInstructions) {
            this._map.set(element, existingInstructions = []);
        }
        existingInstructions.push.apply(existingInstructions, tslib_1.__spread(instructions));
    };
    ElementInstructionMap.prototype.has = function (element) { return this._map.has(element); };
    ElementInstructionMap.prototype.clear = function () { this._map.clear(); };
    return ElementInstructionMap;
}());
export { ElementInstructionMap };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudF9pbnN0cnVjdGlvbl9tYXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL2RzbC9lbGVtZW50X2luc3RydWN0aW9uX21hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBU0EsSUFBQTs7b0JBQ2lCLElBQUksR0FBRyxFQUF1Qzs7SUFFN0QsdUNBQU8sR0FBUCxVQUFRLE9BQVk7UUFDbEIsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUMsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMzQjtRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sWUFBWSxHQUFHLEVBQUUsQ0FBQztTQUNuQjtRQUNELE1BQU0sQ0FBQyxZQUFZLENBQUM7S0FDckI7SUFFRCxzQ0FBTSxHQUFOLFVBQU8sT0FBWSxFQUFFLFlBQTRDO1FBQy9ELElBQUksb0JBQW9CLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLG9CQUFvQixHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQ25EO1FBQ0Qsb0JBQW9CLENBQUMsSUFBSSxPQUF6QixvQkFBb0IsbUJBQVMsWUFBWSxHQUFFO0tBQzVDO0lBRUQsbUNBQUcsR0FBSCxVQUFJLE9BQVksSUFBYSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRTtJQUU3RCxxQ0FBSyxHQUFMLGNBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFO2dDQWhDaEM7SUFpQ0MsQ0FBQTtBQXhCRCxpQ0F3QkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb259IGZyb20gJy4vYW5pbWF0aW9uX3RpbWVsaW5lX2luc3RydWN0aW9uJztcblxuZXhwb3J0IGNsYXNzIEVsZW1lbnRJbnN0cnVjdGlvbk1hcCB7XG4gIHByaXZhdGUgX21hcCA9IG5ldyBNYXA8YW55LCBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uW10+KCk7XG5cbiAgY29uc3VtZShlbGVtZW50OiBhbnkpOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uW10ge1xuICAgIGxldCBpbnN0cnVjdGlvbnMgPSB0aGlzLl9tYXAuZ2V0KGVsZW1lbnQpO1xuICAgIGlmIChpbnN0cnVjdGlvbnMpIHtcbiAgICAgIHRoaXMuX21hcC5kZWxldGUoZWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGluc3RydWN0aW9ucyA9IFtdO1xuICAgIH1cbiAgICByZXR1cm4gaW5zdHJ1Y3Rpb25zO1xuICB9XG5cbiAgYXBwZW5kKGVsZW1lbnQ6IGFueSwgaW5zdHJ1Y3Rpb25zOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uW10pIHtcbiAgICBsZXQgZXhpc3RpbmdJbnN0cnVjdGlvbnMgPSB0aGlzLl9tYXAuZ2V0KGVsZW1lbnQpO1xuICAgIGlmICghZXhpc3RpbmdJbnN0cnVjdGlvbnMpIHtcbiAgICAgIHRoaXMuX21hcC5zZXQoZWxlbWVudCwgZXhpc3RpbmdJbnN0cnVjdGlvbnMgPSBbXSk7XG4gICAgfVxuICAgIGV4aXN0aW5nSW5zdHJ1Y3Rpb25zLnB1c2goLi4uaW5zdHJ1Y3Rpb25zKTtcbiAgfVxuXG4gIGhhcyhlbGVtZW50OiBhbnkpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX21hcC5oYXMoZWxlbWVudCk7IH1cblxuICBjbGVhcigpIHsgdGhpcy5fbWFwLmNsZWFyKCk7IH1cbn1cbiJdfQ==