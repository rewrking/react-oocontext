"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRootStoreProvider = void 0;
var react_1 = __importDefault(require("react"));
var makeRootStoreProvider = function (providers) {
    return react_1.default.memo(function (props) {
        var lastChild = react_1.default.createElement(react_1.default.Fragment, null, props.children);
        for (var i = providers.length - 1; i >= 0; --i) {
            var Component = providers[i];
            lastChild = react_1.default.createElement(Component, null, lastChild);
        }
        return lastChild;
    });
};
exports.makeRootStoreProvider = makeRootStoreProvider;
//# sourceMappingURL=RootStoreProvider.js.map