/** PURE_IMPORTS_START _Observable,_scheduler_async,_util_isNumeric,_util_isScheduler PURE_IMPORTS_END */
import { Observable } from '../Observable';
import { async } from '../scheduler/async';
import { isNumeric } from '../util/isNumeric';
import { isScheduler } from '../util/isScheduler';
/**
 * Creates an Observable that starts emitting after an `initialDelay` and
 * emits ever increasing numbers after each `period` of time thereafter.
 *
 * <span class="informal">Its like {@link interval}, but you can specify when
 * should the emissions start.</span>
 *
 * <img src="./img/timer.png" width="100%">
 *
 * `timer` returns an Observable that emits an infinite sequence of ascending
 * integers, with a constant interval of time, `period` of your choosing
 * between those emissions. The first emission happens after the specified
 * `initialDelay`. The initial delay may be a {@link Date}. By default, this
 * operator uses the `async` IScheduler to provide a notion of time, but you
 * may pass any IScheduler to it. If `period` is not specified, the output
 * Observable emits only one value, `0`. Otherwise, it emits an infinite
 * sequence.
 *
 * @example <caption>Emits ascending numbers, one every second (1000ms), starting after 3 seconds</caption>
 * var numbers = Rx.Observable.timer(3000, 1000);
 * numbers.subscribe(x => console.log(x));
 *
 * @example <caption>Emits one number after five seconds</caption>
 * var numbers = Rx.Observable.timer(5000);
 * numbers.subscribe(x => console.log(x));
 *
 * @see {@link interval}
 * @see {@link delay}
 *
 * @param {number|Date} [dueTime] The initial delay time to wait before
 * emitting the first value of `0`.
 * @param {number|SchedulerLike} [periodOrScheduler] The period of time between emissions of the
 * subsequent numbers.
 * @param {SchedulerLike} [scheduler=async] The IScheduler to use for scheduling
 * the emission of values, and providing a notion of "time".
 * @return {Observable} An Observable that emits a `0` after the
 * `initialDelay` and ever increasing numbers after each `period` of time
 * thereafter.
 * @static true
 * @name timer
 * @owner Observable
 */
export function timer(dueTime, periodOrScheduler, scheduler) {
    if (dueTime === void 0) {
        dueTime = 0;
    }
    var period = -1;
    if (isNumeric(periodOrScheduler)) {
        period = Number(periodOrScheduler) < 1 && 1 || Number(periodOrScheduler);
    }
    else if (isScheduler(periodOrScheduler)) {
        scheduler = periodOrScheduler;
    }
    if (!isScheduler(scheduler)) {
        scheduler = async;
    }
    return new Observable(function (subscriber) {
        var due = isNumeric(dueTime)
            ? dueTime
            : (+dueTime - scheduler.now());
        return scheduler.schedule(dispatch, due, {
            index: 0, period: period, subscriber: subscriber
        });
    });
}
function dispatch(state) {
    var index = state.index, period = state.period, subscriber = state.subscriber;
    subscriber.next(index);
    if (subscriber.closed) {
        return;
    }
    else if (period === -1) {
        return subscriber.complete();
    }
    state.index = index + 1;
    this.schedule(state, period);
}
//# sourceMappingURL=timer.js.map
