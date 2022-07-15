import React, { useReducer, useContext, useEffect, useLayoutEffect, PropsWithChildren } from "react";

import { ClassType, Optional } from "../Types";
import { ActionEvent, ActionType } from "./ActionType";

export type StoreProvider = (props: PropsWithChildren<object>) => JSX.Element;

const canUseDOM = typeof window !== "undefined";
const useIsomorphicLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;

export function createStore<T extends object>(
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

	const initialize = (state: T): T => {
		const newInst = new classConstructor(...args);
		for (const [key, value] of Object.entries(newInst)) {
			if (typeof value === "function" || key === "_oocontext") continue;
			state[key] = value;
		}
		return state;
	};

	const update = (state: T, payload: T): T => {
		const updates = {};
		for (const [key, value] of Object.entries(payload)) {
			if (typeof value === "function" || key === "_oocontext") continue;
			updates[key] = value;
		}
		return {
			...state,
			...updates,
		};
	};

	const reducer = (state: T, action: ActionEvent<T>): T => {
		switch (action.type) {
			case ActionType.Bound:
				return update(state, action.payload as any);

			case ActionType.Reset:
				return initialize(state);
		}
	};

	const Provider = (props: PropsWithChildren<object>) => {
		const [state, dispatcher] = useReducer(reducer, undefined, getValue);

		useIsomorphicLayoutEffect(() => {
			// dispatcher is private, so inst is cast to any to get around it
			(getValue() as any)._oocontext.dispatcher = dispatcher;

			return () => {
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
		if ((value as any)._oocontext.dispatcher === null) {
			throw new Error(`Store getter for ${classConstructor.name} called outside of its context.`);
		}
		return value;
	};

	return [Provider, ContextHook, getInstance];
}
