type BabelPropertyDescriptor<T> = TypedPropertyDescriptor<T> & {
	initializer?: Function;
};

function Action<T>(prototype: any, key: string, descriptor?: BabelPropertyDescriptor<T>): any {
	if (descriptor && descriptor.value === undefined && descriptor.initializer === undefined) {
		throw new Error(`@Action decorator can only be applied to class methods, not getters/setters`);
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
						console.warn("@Action: no initializer");
						return;
					}

					const method = initializer.call(this);
					const result = method.apply(this, args);

					if (result && typeof result.finally === "function") {
						return (result as Promise<any>).finally(() =>
							(this as any)._oocontext.dispatchStateInternal(this)
						);
					}

					(this as any)._oocontext.dispatchStateInternal(this);

					return result;
				};
			},
		} as any;
	} else {
		/*let value: any = target[key];
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
				patchedFunc = undefined;
				func = method;
			},
			get() {
				if (!patchedFunc) {
					patchedFunc = (...args: any[]) => {
						if (!func) {
							console.warn("@Action: no initializer");
							return;
						}

						const result = func.call(this, ...args);

						if (result && typeof result.finally === "function") {
							return (result as Promise<any>).finally(() =>
								(this as any)._oocontext.dispatchStateInternal(this)
							);
						}

						(this as any)._oocontext.dispatchStateInternal(this);

						return result;
					};
				}
				return patchedFunc;
			},
		};*/

		if (prototype.constructor.actions === undefined) {
			prototype.constructor.actions = [];
		}
		if (!prototype.constructor.actions.includes(key)) {
			prototype.constructor.actions.push(key);
		}
	}
}

export { Action };
