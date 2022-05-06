import React, { useReducer, useContext, useEffect, useLayoutEffect, PropsWithChildren } from "react";

import { BaseState } from "./BaseState";
import { ClassType, Optional } from "../Types";
import { ActionEvent, ActionType } from "./ActionType";

export type StoreProvider = (props: PropsWithChildren<object>) => JSX.Element;

const canUseDOM = typeof window !== "undefined";
const useIsomorphicLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;

export function createStore<T extends BaseState>(
	classConstructor: ClassType<T>,
	...args: any[]
): [StoreProvider, () => T, () => T] {
	let ctx: Optional<React.Context<T>> = null;

	const getValue = (): T => {
		if (!ctx) {
			ctx = React.createContext(new classConstructor(...args));
		}
		return (ctx as any)._currentValue as T;
	};

	const initialize = (state?: T): T => {
		if (!state) {
			state = getValue();
		}
		const newInst = new classConstructor(...args);
		for (const [key, value] of Object.entries(newInst)) {
			if (typeof value === "function" || key === "dispatch") continue;
			state[key] = value;
		}
		return state;
	};

	const reducer = (state: T, action: ActionEvent<T>): T => {
		switch (action.type) {
			case ActionType.Bound:
				return { ...action.payload } as T; // payload is inst, as "this"

			case ActionType.Reset:
				return initialize(state);
		}
	};

	const Provider = (props: PropsWithChildren<object>) => {
		const [state, dispatcher] = useReducer(reducer, undefined, getValue);

		useIsomorphicLayoutEffect(() => {
			// dispatch is private, so inst is cast to any to get around it
			(getValue() as any).dispatch = dispatcher;

			return () => {
				(getValue() as any).dispatch = null;
				ctx = null;
			};
			// eslint-disable-next-line
		}, []);

		const CtxProvider = ctx!.Provider;
		return <CtxProvider value={state}>{props.children}</CtxProvider>;
	};

	// Public Context
	const ContextHook = () => {
		if (ctx === null) {
			throw new Error(`Store hook for ${classConstructor.name} called outside of its context.`);
		}
		return useContext(ctx);
	};

	// Public getter
	const getInstance = (): T => {
		const value = getValue();
		console.log(value);
		if ((value as any).dispatch === null) {
			throw new Error(`Store getter for ${classConstructor.name} called outside of its context.`);
		}
		return value;
	};

	return [Provider, ContextHook, getInstance];
}
