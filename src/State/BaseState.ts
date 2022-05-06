import React from "react";
import "reflect-metadata";
import { Optional } from "../Types";
import { ActionType, ActionEvent } from "./ActionType";

export abstract class BaseState {
	private dispatch: Optional<React.Dispatch<ActionEvent>> = null;
	private deferred: any[] = [];
	private deferCount: number = 0;
	private isDeferring: boolean = false;

	reset = () => {
		const isServer = typeof window === "undefined";
		if (isServer) return;

		if (this.dispatch === null) {
			console.warn("reset call failed: no dispatcher", this);
			return;
		}

		this.dispatch({
			type: ActionType.Reset,
		});
	};

	private dispatchDeferredState = () => {
		if (this.dispatch === null) {
			this.deferCount++;

			if (this.deferCount > 25) {
				console.warn("Deferred state failed to dispatch for: ", this);
				this.deferCount = 0;
				this.deferred = [];
				this.isDeferring = false;
			} else {
				setTimeout(() => this.dispatchDeferredState(), 10);
			}

			return;
		}

		if (this.deferred.length > 0) {
			let updates: any = {};
			while (this.deferred.length > 0) {
				const data = this.deferred.shift();
				updates = {
					...updates,
					...data,
				};
			}

			this.dispatch({
				type: ActionType.Bound,
				payload: updates,
			});
		}

		this.isDeferring = false;
	};

	private dispatchStateInternal = (payload: any) => {
		const isServer = typeof window === "undefined";
		if (isServer) return;

		if (this.dispatch === null) {
			this.deferred.push(payload);
			this.deferCount++;
			if (!this.isDeferring) {
				setTimeout(() => this.dispatchDeferredState(), 10);
				this.isDeferring = true;
			}
			return;
		}

		this.dispatch({
			type: ActionType.Bound,
			payload,
		});
	};

	protected dispatchStoreState = () => this.dispatchStateInternal(this);
}

type BabelPropertyDescriptor<T> = TypedPropertyDescriptor<T> & {
	initializer?: Function;
};

export function Action<T>(target: any, key: string, descriptor?: BabelPropertyDescriptor<T>): any {
	if (!descriptor) {
		throw new Error(`@Action: descriptor was not found`);
	}

	if (descriptor && descriptor.value === undefined && descriptor.initializer === undefined) {
		throw new Error(`@Action decorator can only be applied to arrow functions (for now)`);
	}

	let initializer = descriptor?.initializer;
	if (initializer) {
		if (typeof initializer !== "function") {
			throw new TypeError(`@Action decorator can only be applied to arrow functions, not ${typeof initializer}`);
		}

		return {
			enumerable: true,
			configurable: true,
			writable: true,
			initializer() {
				return (...args: any[]) => {
					if (!initializer) {
						console.log("@Action: no initializer");
						return;
					}

					const method = initializer.call(this);
					const result = method.apply(this, args);

					if (result && typeof result.finally === "function") {
						return (result as Promise<any>).finally(() => this.dispatchStateInternal(this));
					}

					this.dispatchStateInternal(this);

					return result;
				};
			},
		} as any;
	} else {
		let value: any = target[key];
		if (value && typeof value !== "function") {
			throw new TypeError(`@Action decorator can only be applied to arrow functions, not ${typeof value}`);
		}

		let func: any;
		let patchedFunc: any;

		if (descriptor) {
			func = descriptor.value;
		}

		return {
			enumerable: false,
			configurable: true,
			set(method: any) {
				// console.log(`${key}: ${method}`);
				patchedFunc = undefined;
				func = method;
			},
			get() {
				if (!patchedFunc) {
					patchedFunc = (...args: any[]) => {
						if (!func) {
							console.log("@Action: no initializer");
							return;
						}

						const result = func.call(this, ...args);

						if (result && typeof result.finally === "function") {
							return (result as Promise<any>).finally(() => this.dispatchStateInternal(this));
						}

						this.dispatchStateInternal(this);

						return result;
					};
				}
				return patchedFunc;
			},
		};
	}
}
