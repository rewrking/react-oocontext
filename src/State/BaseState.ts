import React from "react";
import { ClassType, Optional } from "../Types";
import { ActionType, ActionEvent } from "./ActionType";

export type BaseStateOptions = {
	maxDeferCount?: number;
	deferTimeout?: number;
};

type InternalBaseState = {
	name: string;
	dispatcher: Optional<React.Dispatch<ActionEvent>>;
	deferred: any[];
	deferCount: number;
	maxDeferCount: number;
	deferTimeout: number;
	isDeferring: boolean;
	dispatchDeferredState(): void;
	dispatchStateInternal(payload: any): void;
};

type IOoContext<T extends ClassType> = T &
	ClassType<{
		_oocontext: InternalBaseState;
		reset: () => void;
		dispatchStoreState: () => void;
	}>;

export function BaseState<T extends ClassType>(options?: BaseStateOptions) {
	return function (Target: T): IOoContext<T> {
		return class extends Target {
			private _oocontext: InternalBaseState = {
				name: "",
				dispatcher: null,
				deferred: [],
				deferCount: 0,
				maxDeferCount: 25,
				deferTimeout: 10,
				isDeferring: false,
				dispatchDeferredState() {
					if (this.dispatcher === null) {
						this.deferCount++;

						if (this.deferCount > this.maxDeferCount) {
							console.warn("Deferred state failed to dispatch for:", this.name);
							this.deferCount = 0;
							this.deferred = [];
							this.isDeferring = false;
						} else {
							setTimeout(() => this.dispatchDeferredState(), this.deferTimeout);
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

						this.dispatcher({
							type: ActionType.Bound,
							payload: updates,
						});
					}

					this.isDeferring = false;
				},
				dispatchStateInternal(payload: any) {
					const isServer = typeof window === "undefined";
					if (isServer) return;

					if (this.dispatcher === null) {
						this.deferred.push(payload);
						this.deferCount++;
						if (!this.isDeferring) {
							setTimeout(() => this.dispatchDeferredState(), this.deferTimeout);
							this.isDeferring = true;
						}
						return;
					}

					this.dispatcher({
						type: ActionType.Bound,
						payload,
					});
				},
			};

			constructor(...args: any[]) {
				super(...args);
				this._oocontext.name = super.constructor.name;

				const actions = (this.constructor as any).actions;
				if (actions) {
					const keys: string[] = (this.constructor as any).actions;

					for (const key of keys) {
						const method = this[key];
						if (typeof method === "function") {
							this[key] = (...args: any[]) => {
								const result = method.apply(this, args);

								if (result && typeof result.finally === "function") {
									return (result as Promise<any>).finally(() =>
										(this as any)._oocontext.dispatchStateInternal(this)
									);
								}

								(this as any)._oocontext.dispatchStateInternal(this);

								return result;
							};
						} else {
							throw new TypeError(
								`@Action decorator can only be applied to class methods, not ${typeof method}`
							);
						}
					}
					delete (this.constructor as any).actions;
				}

				if (!!options) {
					const { maxDeferCount, deferTimeout } = options;
					if (!!maxDeferCount) {
						if (maxDeferCount >= 1 && maxDeferCount <= 100) {
							this._oocontext.maxDeferCount = maxDeferCount;
						} else {
							throw new Error(`BaseState: maxDeferCount must be between 1 and 100. Default is 25`);
						}
					}
					if (!!deferTimeout) {
						if (deferTimeout >= 10 && deferTimeout <= 250) {
							this._oocontext.deferTimeout = deferTimeout;
						} else {
							throw new Error(`BaseState: deferTimeout must be between 10 and 250. Default is 10`);
						}
					}
				}
			}

			reset = () => {
				const isServer = typeof window === "undefined";
				if (isServer) return;

				if (this._oocontext.dispatcher === null) {
					console.warn("reset call failed: no dispatcher", this);
					return;
				}

				this._oocontext.dispatcher({
					type: ActionType.Reset,
				});
			};

			protected dispatchStoreState = () => this._oocontext.dispatchStateInternal(this);
		};
	};
}
