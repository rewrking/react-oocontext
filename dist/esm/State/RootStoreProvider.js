import React from "react";
var makeRootStoreProvider = function (providers) {
    return React.memo(function (props) {
        var lastChild = React.createElement(React.Fragment, null, props.children);
        for (var i = providers.length - 1; i >= 0; --i) {
            var Component = providers[i];
            lastChild = React.createElement(Component, null, lastChild);
        }
        return lastChild;
    });
};
export { makeRootStoreProvider };
//# sourceMappingURL=RootStoreProvider.js.map