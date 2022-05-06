import { PropsWithChildren } from "react";
import { BaseState } from "./BaseState";
import { ClassType } from "../Types";
export declare type StoreProvider = (props: PropsWithChildren<object>) => JSX.Element;
export declare function createStore<T extends BaseState>(classConstructor: ClassType<T>, ...args: any[]): [StoreProvider, () => T, () => T];
