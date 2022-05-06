# react-oocontext

React state with classes and decorators. This is a MobX style state abstraction using React's built-in context and hooks, allowing you to maintain state in classes and dispatch state changes on-demand (with the `@Action` decorator).


**State/BaseState** - An abstract base class for creating easy to read MobX-style states that utilize React Hooks/Context under the hood (i.e. no cruft between you and your data, especially during debugging)

**State/Action** - A decorator for declaring state actions. Also works with promises

```ts
import { BaseState, Action } from "@rewrking/react-kitchen";

class CounterState extends BaseState {
    count: number = 0;

    constructor(public min: number = 0, public max: number = 10, public defaultValue: number = 5) {
        super();

        this.count = this.defaultValue;
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

Note about decorators: they are still experimental and your mileage with BaseState will vary depending on how your React project is setup. Typically, you'll want to use something like:

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

I was not able to get this working with the Parcel 2 beta (due to their bizarre typescript/Babel setup), but it should work with any create-react-app or NextJS project.

---

**State/createStore** - A function that creates a store out of a state class

**State/makeRootStoreProvider** - A function that takes in a number of store providers and returns a nested provider (less ugly than nesting them manually)

```tsx
import { createStore, makeRootStoreProvider } from "@rewrking/react-kitchen";

import { CounterState } from "./CounterState";
import { JokeState } from "./JokeState";

// Return type is [Provider, hook, store instance]
// With the store instance, you can directly call a state action from another state
const [CounterProvider, useCounterStore, getCounterStore] = createStore(CounterState);
const [JokeStoreProvider, useJokeStore, getJokeStore] = createStore(JokeState);

// Providers would be wrapped around anything that needs these states, or if globally, your root component
const Providers = makeRootStoreProvider([CounterProvider, JokeStoreProvider]);

export { Providers, useCounterStore, getCounterStore, useJokeStore, getJokeStore };
```

Finally, you'd use it similarly to other hooks:

```tsx
import { useCounterStore, getCounterStore } from "Stores";

// inside some component
const { increase } = useCounterStore();

// or, direct access somewhere
getCounterStore().increase();
```
