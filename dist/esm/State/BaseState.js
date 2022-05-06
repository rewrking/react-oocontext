var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import "reflect-metadata";
import { ActionType } from "./ActionType";
var BaseState = /** @class */ (function () {
    function BaseState(options) {
        var _this = this;
        this._oocontext = {
            name: "",
            dispatcher: null,
            deferred: [],
            deferCount: 0,
            maxDeferCount: 25,
            deferTimeout: 10,
            isDeferring: false,
            dispatchDeferredState: function () {
                var _this = this;
                if (this.dispatcher === null) {
                    this.deferCount++;
                    if (this.deferCount > this.maxDeferCount) {
                        console.warn("Deferred state failed to dispatch for: ", this.name);
                        this.deferCount = 0;
                        this.deferred = [];
                        this.isDeferring = false;
                    }
                    else {
                        setTimeout(function () { return _this.dispatchDeferredState(); }, this.deferTimeout);
                    }
                    return;
                }
                if (this.deferred.length > 0) {
                    var updates = {};
                    while (this.deferred.length > 0) {
                        var data = this.deferred.shift();
                        updates = __assign(__assign({}, updates), data);
                    }
                    this.dispatcher({
                        type: ActionType.Bound,
                        payload: updates,
                    });
                }
                this.isDeferring = false;
            },
            dispatchStateInternal: function (payload) {
                var _this = this;
                var isServer = typeof window === "undefined";
                if (isServer)
                    return;
                if (this.dispatcher === null) {
                    this.deferred.push(payload);
                    this.deferCount++;
                    if (!this.isDeferring) {
                        setTimeout(function () { return _this.dispatchDeferredState(); }, this.deferTimeout);
                        this.isDeferring = true;
                    }
                    return;
                }
                this.dispatcher({
                    type: ActionType.Bound,
                    payload: payload,
                });
            },
        };
        this.reset = function () {
            var isServer = typeof window === "undefined";
            if (isServer)
                return;
            if (_this._oocontext.dispatcher === null) {
                console.warn("reset call failed: no dispatcher", _this);
                return;
            }
            _this._oocontext.dispatcher({
                type: ActionType.Reset,
            });
        };
        this.dispatchStoreState = function () { return _this._oocontext.dispatchStateInternal(_this); };
        this._oocontext.name = this.constructor.name;
        if (!!options) {
            var maxDeferCount = options.maxDeferCount, deferTimeout = options.deferTimeout;
            if (!!maxDeferCount) {
                if (maxDeferCount >= 1 && maxDeferCount <= 100) {
                    this._oocontext.maxDeferCount = maxDeferCount;
                }
                else {
                    throw new Error("BaseState: maxDeferCount must be between 1 and 100. Default is 25");
                }
            }
            if (!!deferTimeout) {
                if (deferTimeout >= 10 && deferTimeout <= 250) {
                    this._oocontext.deferTimeout = deferTimeout;
                }
                else {
                    throw new Error("BaseState: deferTimeout must be between 10 and 250. Default is 10");
                }
            }
        }
    }
    return BaseState;
}());
export { BaseState };
//# sourceMappingURL=BaseState.js.map