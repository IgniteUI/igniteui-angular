/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { AUTO_STYLE } from '@angular/animations';
import { buildAnimationAst } from '../dsl/animation_ast_builder';
import { buildAnimationTimelines } from '../dsl/animation_timeline_builder';
import { ElementInstructionMap } from '../dsl/element_instruction_map';
import { ENTER_CLASSNAME, LEAVE_CLASSNAME } from '../util';
import { getOrSetAsInMap, listenOnPlayer, makeAnimationEvent, normalizeKeyframes, optimizeGroupPlayer } from './shared';
const /** @type {?} */ EMPTY_INSTRUCTION_MAP = new ElementInstructionMap();
export class TimelineAnimationEngine {
    /**
     * @param {?} _driver
     * @param {?} _normalizer
     */
    constructor(_driver, _normalizer) {
        this._driver = _driver;
        this._normalizer = _normalizer;
        this._animations = {};
        this._playersById = {};
        this.players = [];
    }
    /**
     * @param {?} id
     * @param {?} metadata
     * @return {?}
     */
    register(id, metadata) {
        const /** @type {?} */ errors = [];
        const /** @type {?} */ ast = buildAnimationAst(this._driver, metadata, errors);
        if (errors.length) {
            throw new Error(`Unable to build the animation due to the following errors: ${errors.join("\n")}`);
        }
        else {
            this._animations[id] = ast;
        }
    }
    /**
     * @param {?} i
     * @param {?} preStyles
     * @param {?=} postStyles
     * @return {?}
     */
    _buildPlayer(i, preStyles, postStyles) {
        const /** @type {?} */ element = i.element;
        const /** @type {?} */ keyframes = normalizeKeyframes(this._driver, this._normalizer, element, i.keyframes, preStyles, postStyles);
        return this._driver.animate(element, keyframes, i.duration, i.delay, i.easing, [], true);
    }
    /**
     * @param {?} id
     * @param {?} element
     * @param {?=} options
     * @return {?}
     */
    create(id, element, options = {}) {
        const /** @type {?} */ errors = [];
        const /** @type {?} */ ast = this._animations[id];
        let /** @type {?} */ instructions;
        const /** @type {?} */ autoStylesMap = new Map();
        if (ast) {
            instructions = buildAnimationTimelines(this._driver, element, ast, ENTER_CLASSNAME, LEAVE_CLASSNAME, {}, {}, options, EMPTY_INSTRUCTION_MAP, errors);
            instructions.forEach(inst => {
                const /** @type {?} */ styles = getOrSetAsInMap(autoStylesMap, inst.element, {});
                inst.postStyleProps.forEach(prop => styles[prop] = null);
            });
        }
        else {
            errors.push('The requested animation doesn\'t exist or has already been destroyed');
            instructions = [];
        }
        if (errors.length) {
            throw new Error(`Unable to create the animation due to the following errors: ${errors.join("\n")}`);
        }
        autoStylesMap.forEach((styles, element) => {
            Object.keys(styles).forEach(prop => { styles[prop] = this._driver.computeStyle(element, prop, AUTO_STYLE); });
        });
        const /** @type {?} */ players = instructions.map(i => {
            const /** @type {?} */ styles = autoStylesMap.get(i.element);
            return this._buildPlayer(i, {}, styles);
        });
        const /** @type {?} */ player = optimizeGroupPlayer(players);
        this._playersById[id] = player;
        player.onDestroy(() => this.destroy(id));
        this.players.push(player);
        return player;
    }
    /**
     * @param {?} id
     * @return {?}
     */
    destroy(id) {
        const /** @type {?} */ player = this._getPlayer(id);
        player.destroy();
        delete this._playersById[id];
        const /** @type {?} */ index = this.players.indexOf(player);
        if (index >= 0) {
            this.players.splice(index, 1);
        }
    }
    /**
     * @param {?} id
     * @return {?}
     */
    _getPlayer(id) {
        const /** @type {?} */ player = this._playersById[id];
        if (!player) {
            throw new Error(`Unable to find the timeline player referenced by ${id}`);
        }
        return player;
    }
    /**
     * @param {?} id
     * @param {?} element
     * @param {?} eventName
     * @param {?} callback
     * @return {?}
     */
    listen(id, element, eventName, callback) {
        // triggerName, fromState, toState are all ignored for timeline animations
        const /** @type {?} */ baseEvent = makeAnimationEvent(element, '', '', '');
        listenOnPlayer(this._getPlayer(id), eventName, baseEvent, callback);
        return () => { };
    }
    /**
     * @param {?} id
     * @param {?} element
     * @param {?} command
     * @param {?} args
     * @return {?}
     */
    command(id, element, command, args) {
        if (command == 'register') {
            this.register(id, /** @type {?} */ (args[0]));
            return;
        }
        if (command == 'create') {
            const /** @type {?} */ options = /** @type {?} */ ((args[0] || {}));
            this.create(id, element, options);
            return;
        }
        const /** @type {?} */ player = this._getPlayer(id);
        switch (command) {
            case 'play':
                player.play();
                break;
            case 'pause':
                player.pause();
                break;
            case 'reset':
                player.reset();
                break;
            case 'restart':
                player.restart();
                break;
            case 'finish':
                player.finish();
                break;
            case 'init':
                player.init();
                break;
            case 'setPosition':
                player.setPosition(parseFloat(/** @type {?} */ (args[0])));
                break;
            case 'destroy':
                this.destroy(id);
                break;
        }
    }
}
function TimelineAnimationEngine_tsickle_Closure_declarations() {
    /** @type {?} */
    TimelineAnimationEngine.prototype._animations;
    /** @type {?} */
    TimelineAnimationEngine.prototype._playersById;
    /** @type {?} */
    TimelineAnimationEngine.prototype.players;
    /** @type {?} */
    TimelineAnimationEngine.prototype._driver;
    /** @type {?} */
    TimelineAnimationEngine.prototype._normalizer;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZWxpbmVfYW5pbWF0aW9uX2VuZ2luZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvcmVuZGVyL3RpbWVsaW5lX2FuaW1hdGlvbl9lbmdpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQU9BLE9BQU8sRUFBQyxVQUFVLEVBQTBGLE1BQU0scUJBQXFCLENBQUM7QUFHeEksT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDL0QsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFFMUUsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFFckUsT0FBTyxFQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFHekQsT0FBTyxFQUFDLGVBQWUsRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFFdEgsdUJBQU0scUJBQXFCLEdBQUcsSUFBSSxxQkFBcUIsRUFBRSxDQUFDO0FBRTFELE1BQU07Ozs7O0lBS0osWUFBb0IsT0FBd0IsRUFBVSxXQUFxQztRQUF2RSxZQUFPLEdBQVAsT0FBTyxDQUFpQjtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUEwQjsyQkFKekIsRUFBRTs0QkFDWixFQUFFO3VCQUN0QixFQUFFO0tBRXlEOzs7Ozs7SUFFL0YsUUFBUSxDQUFDLEVBQVUsRUFBRSxRQUErQztRQUNsRSx1QkFBTSxNQUFNLEdBQVUsRUFBRSxDQUFDO1FBQ3pCLHVCQUFNLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM5RCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZ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LEtBQUssRUFBRSxDQUFDO2dCQUNmLEtBQUssQ0FBQztZQUNSLEtBQUssU0FBUztnQkFDWixNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQztZQUNSLEtBQUssUUFBUTtnQkFDWCxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2hCLEtBQUssQ0FBQztZQUNSLEtBQUssTUFBTTtnQkFDVCxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2QsS0FBSyxDQUFDO1lBQ1IsS0FBSyxhQUFhO2dCQUNoQixNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsbUJBQUMsSUFBSSxDQUFDLENBQUMsQ0FBVyxFQUFDLENBQUMsQ0FBQztnQkFDbEQsS0FBSyxDQUFDO1lBQ1IsS0FBSyxTQUFTO2dCQUNaLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQztTQUNUO0tBQ0Y7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QVVUT19TVFlMRSwgQW5pbWF0aW9uTWV0YWRhdGEsIEFuaW1hdGlvbk1ldGFkYXRhVHlwZSwgQW5pbWF0aW9uT3B0aW9ucywgQW5pbWF0aW9uUGxheWVyLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7QXN0fSBmcm9tICcuLi9kc2wvYW5pbWF0aW9uX2FzdCc7XG5pbXBvcnQge2J1aWxkQW5pbWF0aW9uQXN0fSBmcm9tICcuLi9kc2wvYW5pbWF0aW9uX2FzdF9idWlsZGVyJztcbmltcG9ydCB7YnVpbGRBbmltYXRpb25UaW1lbGluZXN9IGZyb20gJy4uL2RzbC9hbmltYXRpb25fdGltZWxpbmVfYnVpbGRlcic7XG5pbXBvcnQge0FuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb259IGZyb20gJy4uL2RzbC9hbmltYXRpb25fdGltZWxpbmVfaW5zdHJ1Y3Rpb24nO1xuaW1wb3J0IHtFbGVtZW50SW5zdHJ1Y3Rpb25NYXB9IGZyb20gJy4uL2RzbC9lbGVtZW50X2luc3RydWN0aW9uX21hcCc7XG5pbXBvcnQge0FuaW1hdGlvblN0eWxlTm9ybWFsaXplcn0gZnJvbSAnLi4vZHNsL3N0eWxlX25vcm1hbGl6YXRpb24vYW5pbWF0aW9uX3N0eWxlX25vcm1hbGl6ZXInO1xuaW1wb3J0IHtFTlRFUl9DTEFTU05BTUUsIExFQVZFX0NMQVNTTkFNRX0gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7QW5pbWF0aW9uRHJpdmVyfSBmcm9tICcuL2FuaW1hdGlvbl9kcml2ZXInO1xuaW1wb3J0IHtnZXRPclNldEFzSW5NYXAsIGxpc3Rlbk9uUGxheWVyLCBtYWtlQW5pbWF0aW9uRXZlbnQsIG5vcm1hbGl6ZUtleWZyYW1lcywgb3B0aW1pemVHcm91cFBsYXllcn0gZnJvbSAnLi9zaGFyZWQnO1xuXG5jb25zdCBFTVBUWV9JTlNUUlVDVElPTl9NQVAgPSBuZXcgRWxlbWVudEluc3RydWN0aW9uTWFwKCk7XG5cbmV4cG9ydCBjbGFzcyBUaW1lbGluZUFuaW1hdGlvbkVuZ2luZSB7XG4gIHByaXZhdGUgX2FuaW1hdGlvbnM6IHtbaWQ6IHN0cmluZ106IEFzdDxBbmltYXRpb25NZXRhZGF0YVR5cGU+fSA9IHt9O1xuICBwcml2YXRlIF9wbGF5ZXJzQnlJZDoge1tpZDogc3RyaW5nXTogQW5pbWF0aW9uUGxheWVyfSA9IHt9O1xuICBwdWJsaWMgcGxheWVyczogQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9kcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgcHJpdmF0ZSBfbm9ybWFsaXplcjogQW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyKSB7fVxuXG4gIHJlZ2lzdGVyKGlkOiBzdHJpbmcsIG1ldGFkYXRhOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdKSB7XG4gICAgY29uc3QgZXJyb3JzOiBhbnlbXSA9IFtdO1xuICAgIGNvbnN0IGFzdCA9IGJ1aWxkQW5pbWF0aW9uQXN0KHRoaXMuX2RyaXZlciwgbWV0YWRhdGEsIGVycm9ycyk7XG4gICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVW5hYmxlIHRvIGJ1aWxkIHRoZSBhbmltYXRpb24gZHVlIHRvIHRoZSBmb2xsb3dpbmcgZXJyb3JzOiAke2Vycm9ycy5qb2luKFwiXFxuXCIpfWApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9hbmltYXRpb25zW2lkXSA9IGFzdDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9idWlsZFBsYXllcihcbiAgICAgIGk6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb24sIHByZVN0eWxlczogybVTdHlsZURhdGEsXG4gICAgICBwb3N0U3R5bGVzPzogybVTdHlsZURhdGEpOiBBbmltYXRpb25QbGF5ZXIge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBpLmVsZW1lbnQ7XG4gICAgY29uc3Qga2V5ZnJhbWVzID0gbm9ybWFsaXplS2V5ZnJhbWVzKFxuICAgICAgICB0aGlzLl9kcml2ZXIsIHRoaXMuX25vcm1hbGl6ZXIsIGVsZW1lbnQsIGkua2V5ZnJhbWVzLCBwcmVTdHlsZXMsIHBvc3RTdHlsZXMpO1xuICAgIHJldHVybiB0aGlzLl9kcml2ZXIuYW5pbWF0ZShlbGVtZW50LCBrZXlmcmFtZXMsIGkuZHVyYXRpb24sIGkuZGVsYXksIGkuZWFzaW5nLCBbXSwgdHJ1ZSk7XG4gIH1cblxuICBjcmVhdGUoaWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zID0ge30pOiBBbmltYXRpb25QbGF5ZXIge1xuICAgIGNvbnN0IGVycm9yczogYW55W10gPSBbXTtcbiAgICBjb25zdCBhc3QgPSB0aGlzLl9hbmltYXRpb25zW2lkXTtcbiAgICBsZXQgaW5zdHJ1Y3Rpb25zOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uW107XG5cbiAgICBjb25zdCBhdXRvU3R5bGVzTWFwID0gbmV3IE1hcDxhbnksIMm1U3R5bGVEYXRhPigpO1xuXG4gICAgaWYgKGFzdCkge1xuICAgICAgaW5zdHJ1Y3Rpb25zID0gYnVpbGRBbmltYXRpb25UaW1lbGluZXMoXG4gICAgICAgICAgdGhpcy5fZHJpdmVyLCBlbGVtZW50LCBhc3QsIEVOVEVSX0NMQVNTTkFNRSwgTEVBVkVfQ0xBU1NOQU1FLCB7fSwge30sIG9wdGlvbnMsXG4gICAgICAgICAgRU1QVFlfSU5TVFJVQ1RJT05fTUFQLCBlcnJvcnMpO1xuICAgICAgaW5zdHJ1Y3Rpb25zLmZvckVhY2goaW5zdCA9PiB7XG4gICAgICAgIGNvbnN0IHN0eWxlcyA9IGdldE9yU2V0QXNJbk1hcChhdXRvU3R5bGVzTWFwLCBpbnN0LmVsZW1lbnQsIHt9KTtcbiAgICAgICAgaW5zdC5wb3N0U3R5bGVQcm9wcy5mb3JFYWNoKHByb3AgPT4gc3R5bGVzW3Byb3BdID0gbnVsbCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3JzLnB1c2goJ1RoZSByZXF1ZXN0ZWQgYW5pbWF0aW9uIGRvZXNuXFwndCBleGlzdCBvciBoYXMgYWxyZWFkeSBiZWVuIGRlc3Ryb3llZCcpO1xuICAgICAgaW5zdHJ1Y3Rpb25zID0gW107XG4gICAgfVxuXG4gICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVW5hYmxlIHRvIGNyZWF0ZSB0aGUgYW5pbWF0aW9uIGR1ZSB0byB0aGUgZm9sbG93aW5nIGVycm9yczogJHtlcnJvcnMuam9pbihcIlxcblwiKX1gKTtcbiAgICB9XG5cbiAgICBhdXRvU3R5bGVzTWFwLmZvckVhY2goKHN0eWxlcywgZWxlbWVudCkgPT4ge1xuICAgICAgT2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKFxuICAgICAgICAgIHByb3AgPT4geyBzdHlsZXNbcHJvcF0gPSB0aGlzLl9kcml2ZXIuY29tcHV0ZVN0eWxlKGVsZW1lbnQsIHByb3AsIEFVVE9fU1RZTEUpOyB9KTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHBsYXllcnMgPSBpbnN0cnVjdGlvbnMubWFwKGkgPT4ge1xuICAgICAgY29uc3Qgc3R5bGVzID0gYXV0b1N0eWxlc01hcC5nZXQoaS5lbGVtZW50KTtcbiAgICAgIHJldHVybiB0aGlzLl9idWlsZFBsYXllcihpLCB7fSwgc3R5bGVzKTtcbiAgICB9KTtcbiAgICBjb25zdCBwbGF5ZXIgPSBvcHRpbWl6ZUdyb3VwUGxheWVyKHBsYXllcnMpO1xuICAgIHRoaXMuX3BsYXllcnNCeUlkW2lkXSA9IHBsYXllcjtcbiAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHRoaXMuZGVzdHJveShpZCkpO1xuXG4gICAgdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICByZXR1cm4gcGxheWVyO1xuICB9XG5cbiAgZGVzdHJveShpZDogc3RyaW5nKSB7XG4gICAgY29uc3QgcGxheWVyID0gdGhpcy5fZ2V0UGxheWVyKGlkKTtcbiAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgIGRlbGV0ZSB0aGlzLl9wbGF5ZXJzQnlJZFtpZF07XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnBsYXllcnMuaW5kZXhPZihwbGF5ZXIpO1xuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICB0aGlzLnBsYXllcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9nZXRQbGF5ZXIoaWQ6IHN0cmluZyk6IEFuaW1hdGlvblBsYXllciB7XG4gICAgY29uc3QgcGxheWVyID0gdGhpcy5fcGxheWVyc0J5SWRbaWRdO1xuICAgIGlmICghcGxheWVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBmaW5kIHRoZSB0aW1lbGluZSBwbGF5ZXIgcmVmZXJlbmNlZCBieSAke2lkfWApO1xuICAgIH1cbiAgICByZXR1cm4gcGxheWVyO1xuICB9XG5cbiAgbGlzdGVuKGlkOiBzdHJpbmcsIGVsZW1lbnQ6IHN0cmluZywgZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYW55KTpcbiAgICAgICgpID0+IHZvaWQge1xuICAgIC8vIHRyaWdnZXJOYW1lLCBmcm9tU3RhdGUsIHRvU3RhdGUgYXJlIGFsbCBpZ25vcmVkIGZvciB0aW1lbGluZSBhbmltYXRpb25zXG4gICAgY29uc3QgYmFzZUV2ZW50ID0gbWFrZUFuaW1hdGlvbkV2ZW50KGVsZW1lbnQsICcnLCAnJywgJycpO1xuICAgIGxpc3Rlbk9uUGxheWVyKHRoaXMuX2dldFBsYXllcihpZCksIGV2ZW50TmFtZSwgYmFzZUV2ZW50LCBjYWxsYmFjayk7XG4gICAgcmV0dXJuICgpID0+IHt9O1xuICB9XG5cbiAgY29tbWFuZChpZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIGNvbW1hbmQ6IHN0cmluZywgYXJnczogYW55W10pOiB2b2lkIHtcbiAgICBpZiAoY29tbWFuZCA9PSAncmVnaXN0ZXInKSB7XG4gICAgICB0aGlzLnJlZ2lzdGVyKGlkLCBhcmdzWzBdIGFzIEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGNvbW1hbmQgPT0gJ2NyZWF0ZScpIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSAoYXJnc1swXSB8fCB7fSkgYXMgQW5pbWF0aW9uT3B0aW9ucztcbiAgICAgIHRoaXMuY3JlYXRlKGlkLCBlbGVtZW50LCBvcHRpb25zKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLl9nZXRQbGF5ZXIoaWQpO1xuICAgIHN3aXRjaCAoY29tbWFuZCkge1xuICAgICAgY2FzZSAncGxheSc6XG4gICAgICAgIHBsYXllci5wbGF5KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncGF1c2UnOlxuICAgICAgICBwbGF5ZXIucGF1c2UoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdyZXNldCc6XG4gICAgICAgIHBsYXllci5yZXNldCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Jlc3RhcnQnOlxuICAgICAgICBwbGF5ZXIucmVzdGFydCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2ZpbmlzaCc6XG4gICAgICAgIHBsYXllci5maW5pc2goKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdpbml0JzpcbiAgICAgICAgcGxheWVyLmluaXQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzZXRQb3NpdGlvbic6XG4gICAgICAgIHBsYXllci5zZXRQb3NpdGlvbihwYXJzZUZsb2F0KGFyZ3NbMF0gYXMgc3RyaW5nKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZGVzdHJveSc6XG4gICAgICAgIHRoaXMuZGVzdHJveShpZCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufVxuIl19