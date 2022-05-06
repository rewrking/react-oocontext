# react-oocontext

React state with classes and decorators. This is a MobX style state abstraction using React's built-in context and hooks, allowing you to maintain state in classes and dispatch state changes on-demand (with the `@Action` decorator). It's designed to be easy to use with minimal boilereplate.

Under the hood, this uses React's `useReducer` hook, along with the React context api.


| Import | Description |
| --------- | ----------- |
| `BaseState` | An abstract base class for creating easy to read MobX-style states that utilize React Hooks/Context under the hood (i.e. no proxy objects that get in the way of you and your data, especially during debugging) |
| `Action` | A decorator for declaring state actions. Also works with promises |
| `createStore` | A method that creates a store out of a state class |
| `makeRootStoreProvider` | (optional) A method that takes in a number of store providers and returns a nested provider (less tedious than nesting them manually) |

Example 1: Defining a state class

```ts
import { BaseState, Action } from "react-oocontext";

class CounterState extends BaseState {
    count: number = 0;

    constructor(public min: number = 0, public max: number = 10) {
        super();
    }

    @Action
    increase = (amount: number) => {
        if (this.count + amount <= this.max) this.count += amount;
    };

    @Action
    decrease = (amount: number) => {
        if (this.count - amount >= this.min) this.count -= amount;
    };
}

export { CounterState };
```

Example 2: creating a store:

```tsx
import { createStore, makeRootStoreProvider } from "react-oocontext";

import { CounterState } from "./CounterState";
import { JokeState } from "./JokeState";

// The return type of createStore is [Provider, hook, getter]
// With the store getter, you can directly call a state action from another state, 
//   or wherever an action needs to be called. It is recommended to keep it within 
//   the context of the provider. Use the hook in components that require state changes
const [JokeStoreProvider, useJokeStore, getJokeStore] = createStore(JokeState);

 // Constructure arguments can be passed into createStore:
const [CounterProvider, useCounterStore, getCounterStore] = createStore(CounterState, 1, 10);

// Providers would be wrapped around anything that needs these states, 
//   or if globally, your root component
const Providers = makeRootStoreProvider([JokeStoreProvider, CounterProvider]);

export { Providers, useJokeStore, getJokeStore, useCounterStore, getCounterStore };
```

Example 3: Importing the providers into your app

```tsx
import { Providers } from "Stores";
import { Application } from "Layouts";

const App = () => {
	return (
		<Providers>
			<Application />
		</Providers>
	);
};

export default Main;


```

Example 4: Implementing state

```tsx
import { useCounterStore, getCounterStore } from "Stores";

const MyComponent = () => {
    const { count, increase } = useCounterStore();
	return (
        <div onClick={increase}>{count}</div>
    );
}

export { MyComponent };

// or, dispatch a state update from logic somewhere, like from another store.
getCounterStore().increase();
```

Note about decorators: they're still experimental and the api for them will likely change in the future, so mileage may vary depending on how your React project is setup. Typically, you'll want to use the following typescript settings:

```json
{
    "module": "esnext",
    "jsx": "react-jsx",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
    ...
}
```

Tested so far with NextJS & Create React App.
