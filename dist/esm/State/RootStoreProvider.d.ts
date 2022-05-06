import React from "react";
import { StoreProvider } from "./CreateStore";
declare const makeRootStoreProvider: (providers: StoreProvider[]) => React.MemoExoticComponent<(props: React.PropsWithChildren<object>) => JSX.Element>;
export { makeRootStoreProvider };
