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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useReducer, useContext, useEffect } from "react";
import { ActionType } from "./ActionType";
export function createStore(classConstructor) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var ctx = null;
    var getValue = function () {
        if (!ctx) {
            ctx = React.createContext(new (classConstructor.bind.apply(classConstructor, __spreadArray([void 0], args, false)))());
        }
        return ctx._currentValue;
    };
    var initialize = function (state) {
        if (!state) {
            state = getValue();
        }
        var newInst = new (classConstructor.bind.apply(classConstructor, __spreadArray([void 0], args, false)))();
        for (var _i = 0, _a = Object.entries(newInst); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (typeof value === "function" || key === "dispatch")
                continue;
            state[key] = value;
        }
        return state;
    };
    var reducer = function (state, action) {
        switch (action.type) {
            case ActionType.Bound:
                return __assign({}, action.payload); // payload is inst, as "this"
            case ActionType.Reset:
                return initialize(state);
        }
    };
    var Provider = function (props) {
        var _a = useReducer(reducer, undefined, getValue), state = _a[0], dispatcher = _a[1];
        useEffect(function () {
            // dispatch is private, so inst is cast to any to get around it
            getValue().dispatch = dispatcher;
            return function () {
                getValue().dispatch = null;
                ctx = null;
            };
            // eslint-disable-next-line
        }, []);
        var CtxProvider = ctx.Provider;
        return React.createElement(CtxProvider, { value: state }, props.children);
    };
    // Public Context
    var ContextHook = function () {
        if (ctx === null) {
            throw new Error("Store hook for ".concat(classConstructor.name, " called outside of its context."));
        }
        return useContext(ctx);
    };
    // Public getter
    var getInstance = function () {
        var value = getValue();
        if (value.dispatch === null) {
            throw new Error("Store getter for ".concat(classConstructor.name, " called outside of its context."));
        }
        return value;
    };
    return [Provider, ContextHook, getInstance];
}
//# sourceMappingURL=CreateStore.js.map