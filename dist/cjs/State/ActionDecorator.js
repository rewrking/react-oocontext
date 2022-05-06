"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = void 0;
function Action(target, key, descriptor) {
    if (!descriptor) {
        throw new Error("@Action: descriptor was not found");
    }
    if (descriptor && descriptor.value === undefined && descriptor.initializer === undefined) {
        throw new Error("@Action decorator can only be applied to arrow functions (for now)");
    }
    var initializer = descriptor === null || descriptor === void 0 ? void 0 : descriptor.initializer;
    if (initializer) {
        if (typeof initializer !== "function") {
            throw new TypeError("@Action decorator can only be applied to arrow functions, not ".concat(typeof initializer));
        }
        return {
            enumerable: true,
            configurable: true,
            writable: true,
            initializer: function () {
                var _this = this;
                return function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    if (!initializer) {
                        console.warn("@Action: no initializer");
                        return;
                    }
                    var method = initializer.call(_this);
                    var result = method.apply(_this, args);
                    if (result && typeof result.finally === "function") {
                        return result.finally(function () {
                            return _this._oocontext.dispatchStateInternal(_this);
                        });
                    }
                    _this._oocontext.dispatchStateInternal(_this);
                    return result;
                };
            },
        };
    }
    else {
        var value = target[key];
        if (value && typeof value !== "function") {
            throw new TypeError("@Action decorator can only be applied to arrow functions, not ".concat(typeof value));
        }
        var func_1;
        var patchedFunc_1;
        if (descriptor) {
            func_1 = descriptor.value;
        }
        return {
            enumerable: false,
            configurable: true,
            set: function (method) {
                patchedFunc_1 = undefined;
                func_1 = method;
            },
            get: function () {
                var _this = this;
                if (!patchedFunc_1) {
                    patchedFunc_1 = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        if (!func_1) {
                            console.warn("@Action: no initializer");
                            return;
                        }
                        var result = func_1.call.apply(func_1, __spreadArray([_this], args, false));
                        if (result && typeof result.finally === "function") {
                            return result.finally(function () {
                                return _this._oocontext.dispatchStateInternal(_this);
                            });
                        }
                        _this._oocontext.dispatchStateInternal(_this);
                        return result;
                    };
                }
                return patchedFunc_1;
            },
        };
    }
}
exports.Action = Action;
//# sourceMappingURL=ActionDecorator.js.map