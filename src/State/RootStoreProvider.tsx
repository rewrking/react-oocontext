import React from "react";
import { StoreProvider } from "./CreateStore";

const makeRootStoreProvider = (providers: StoreProvider[]) => {
	return React.memo(
		(props: React.PropsWithChildren<object>): JSX.Element => {
			let lastChild: JSX.Element | undefined = <>{props.children}</>;
			for (let i = providers.length - 1; i >= 0; --i) {
				const Component = providers[i];
				lastChild = <Component>{lastChild}</Component>;
			}
			return lastChild;
		}
	);
};

export { makeRootStoreProvider };
