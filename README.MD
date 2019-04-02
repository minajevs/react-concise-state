# react-concise-state
[![npm](https://img.shields.io/npm/v/react-concise-state.svg?style=flat-square)](http://npm.im/react-concise-state)
[![Travis](https://img.shields.io/travis/minajevs/react-concise-state.svg?style=flat-square)](https://travis-ci.org/minajevs/react-concise-state)
[![Codecov](https://img.shields.io/codecov/c/github/minajevs/react-concise-state.svg?style=flat-square)](https://codecov.io/github/minajevs/react-concise-state)

> Yet another React state manager

Simple, low-impact state manager for smaller React applications. 

```tsx
import createStoreContext from "react-concise-state";

// 1️⃣ create a store context providing initial state and an actions
const [context, Provider] = createStoreContext({
    counter: 0
}, {
    // 👇 actions modify state using provided `setState`
    incrementBy: ({ state, setState }, increment: number) => {
      const newValue = state.counter + increment
      setState({ counter: newValue })
    },
    reset: ({ setState }) => setState({ counter: 0 })
})

// 2️⃣ wrap component in created provider
const App = props => {
  return <Provider>
      <CounterComponent />
    </Provider>
}

// 3️⃣ hook context in consumer to use generated store
const CounterComponent: React.FC = props => {
  const store = React.useContext(context)
  // 👇 generated store contains both the state and actions to call
  const onIncrement = () => store.incrementBy(1)
  const onDecrement = () => store.incrementBy(-1)
  return <div>
      <h2>Counter: {store.counter}</h2>
      <hr />
      <button onClick={onIncrement}>Increment</button>
      <button onClick={onDecrement}>Decrement</button>

      <button onClick={store.reset}>Reset</button>
    </div>
}
```

## Features
* Quick and extremely easy to use 
* Integrates into general React workflow. Uses contexts, state and hooks 
* Low impact. [<1kB gziped](https://bundlephobia.com/result?p=react-concise-state@0.3.0)
* Written in TypeScript
* 100% covered with tests, both for logic and typings

## Intro
`react-concise-state` born in frustration and fatigue caused by "modern" React state management. Writing hundreds of boilerplate redux code just to support basic feature gets boring quickly. Newer React features such as context and hooks are there to make state simpler, and this package uses it to make state managing extremely easy, concise and fun. Reducing boilerplate code to zero is the core concept.

## Installation
Yarn:
`yarn add react-concise-state`

NPM:
`npm install react-concise-state`
 
Make sure you are using recent React version (>=16.8.0) because it works best with it. 
> support of React >= 16.3.0 is possible. Should it be implemented?

If you are using TypeScript, some of the types might default to `any` on version <3.2 because of a bug with tuple types.

## Examples
[⭐️Click here to see usage examples⭐️](/examples)

---

## Core Concepts
Below you can find an introduction to the core core concepts of `react-concise-state`. You will find basic step-by-step walkthrough how to use this package.

### `createStoreContext` - creating store context
Application or application part state can be represented as a plain JavaScript object. For example Counter component state can be defined with such object.

```tsx
const state = {
    counter: 0
}
```
Now you create a store context. 

```tsx
import createStoreContext from 'react-concise-state'

const [context, Provider] = createStoreContext(state)
```
`context` and `Provider` are created which you can use in your application to access created store. 

#### `context` - consuming created context
`context` is `React.Context`, so you can use its `Consumer` property [as you would normally use React Consumer](https://reactjs.org/docs/context.html#contextconsumer), or instead [you can use hooks API.](https://reactjs.org/docs/hooks-reference.html#usecontext)

<details><summary>Examples (click to expand)</summary><p>

Component API
```tsx
const Counter = props => <context.Consumer> {store => 
    <h1>Current counter: {store.counter}</h1>
} </context.Consumer>
```

Hooks API
```tsx
const Counter = props => {
    const store = React.useContext(context)
    return <h1>Current counter: {store.counter}</h1>
}
```
</p></details>

`Provider` is a context provider which you should wrap your store consuming components into. 

<details><summary>Examples (click to expand)</summary><p>

```tsx
const App = props => {
    return <Provider>
        <Counter />
    </Provider>
}
```

Note that there should only be one provider for 1 instance of state and consumers might not be the first or only descenders of provider.

```tsx
const App = props => {
    return <Provider>
        <div>
            <Counter /> 
        </div>
        <div>
            <div>
                <OtherCounterWithSameState />
            </div>
        </div>
    </Provider>
}
```
</p></details>

#### `actions` - modifying state
Usually having plain state does not make any sense. There should be some way to modify it. React provides powerfull `setState` to do that, however using `setState` for common state on many child components is dangerous and is generally a bad idea. Flux architecture (redux) solves it by defining actions - a contracts telling how it is possible to mutate state, and then defining reducers, sagas, thunks, middleware etc. to actually mutate it. In `react-concise-state` all those concepts are combined into one in a terse and fluent way. 

`actions` in `react-concise-state` are plain JavaScript methods which you can call from consumer components to modify current state. Those actions
* Define state mutation contract between store and consumers
* Use native for React `setState`
* May or may not have a payload
* May or may not return a value
* May be async
* May call other stores
* May be written in functional & immutable approach or in imperative approach

To create store action in `react-concise-state` provide a second argument to `createStoreContext` - an object where object keys are action names and values are actions themselves.

Basic examples:
```tsx
// Imperative
const actions = {
    someAction: ({state, setState}, payload) => {
        const newState = ... // do something
        setState(newState)
    }
}

// Functional
const actions = {
    someAction: ({setState}, payload) => setState(prev => { ..prev, /* do something */})
}

// Create store
createStoreContext(state, actions)
```
Those actions will be transformed to store actions which you can call from consumers. In consumers only `payload` is required argument. Calling this store action will execute the action. `{state, setState}` wil have real values from provider.

Basic usage examples:
```tsx
const store = React.useContext(context)

store.someAction('this is a payload string')
```
<details><summary>Advanced (click to expand)</summary><p>

Payload for actions is optional. There could be any amount of payload arguments. 

```tsx
const [context, Provider] = createStoreContext({counter: 0}, {
    // No payload
    increment: ({state, setState}) = setState({counter: ++state.counter}),
    // If you are using functional style you can also get current state inside `setState` using callback function
    decrement: ({setState}) => setState(state => ({counter: --state.counter})),

    // With payload
    setValue: ({setState}, value) => setState({counter: value}),
    setValueIfMoreThan: ({state, setState}, value, limit) => {
        if(state.counter > limit)
            setState({counter: value})
    }
})

...

// Usage
const store = React.useContext(context)

store.increment()
// > store.counter is 1

store.decrement()
// > store.counter is 0

store.setValue(10)
// > store.counter is 10

store.setValueIfMoreThan(9, 1)
// > store.counter is 1
```

You can get return value from actions. It also enabled awaiting async actions.

```tsx
const [context, Provider] = createStoreContext({todos: []}, {
    // Returning a value
    addTodo: ({setState}, todo) => {
        const result = Api.addTodo(todo)
        return result
    },
    // Getting todos asynchronously
    getTodos: async ({setState}) => {
        const todos = await Api.getTodos()
        setState({todos})
    }
})

...

// Usage
const store = React.useContext(context)

const result = store.addTodo('buy milk')

await store.getTodos()
```

</p></details>

#### Calling other stores
Sometimes you would like to call other store action from an action. You can't use `React.useContext` because of specific hook rules in React. Hook amount should never change during runtime and only way to supply that is to initialize all dependency contexts before bootstraping actions.

You can call actions in other stores by providing dependency contexts as a 3rd parameter to `createStoreContext`. Those contexts will be mapped to corresponding stores internally and will be available in `stores` object in `{setState, action, stores}`  argument of action creator.

Example:
```tsx
const [todoContext, Provider] = createStoreContext({todos: []}, {
    addTodo: ({state, setState}, todo) => {
        setState({todos: [...state.todos, todo]})
    },
})
const [mainContext, Provider] = createStoreContext({message: ''}, {
    someAction: ({setState, stores}, name) => {
        const { todos } = stores.todoContext // stores.todoContext is a "todo store" ({todos: [], addTodo: (todo) => void})
        const newMessage = `Hello, ${name}, you have ${todos.length} todos!`
        setState({message: newMessage})
    },
}, {todoContext})
...
// Usage
const todoStore = React.useContext(todoContext)
const mainStore = React.useContext(mainContext)
todoStore.addTodo('buy milk')
todoStore.addTodo('learn typescript')
mainStore.someAction('Dmitrijs')
// mainStore.message is "Hello, Dmitrijs, you have 2 todos!" 
```

## TypeScript
This library is written in TypeScript and leverages its type system to the fullest. One of the main goals of this library is to provide type-safe state management with minimum (almost zero) boilerplate code.   

<details><summary>Why most libraries fail on this</summary><p>
TypeScript is really powerful. It's type system is so flexible yet so smart ([turing-complete smart](https://github.com/Microsoft/TypeScript/issues/14833)) that it is a shame very few developers and libraries use it to the fullest.

TypeScript is able to infer and calculate most of the types itself, yet libraries still require developers to write interfaces, implement contracts, provide types for every single bit of functionality. TypeScript should guide towards correct implementation, not hinder from incorrect one.

You can use this library without writing any type and you will still have perfect type-safety and type-correctness. Types will be automatically resolved and given to you so you are safe about your implementation.  
</p></details>

### How types in this library work

#### 1. `initialState` 
When creating a new store context initial state could be anything. Resulting state will be infered from provided `initialState`

![Initial state infered demo](/assets/initial-state-infered.gif)

You can also provide `TState` type to constrain initial state or narrow state types.

![Initial state constrained demo](/assets/initial-state-constrained.gif)

#### 2. `actions`
When creating store actions you will be provided with correct types for current `state`, `setState` method and `stores` object. 

![Action types provided demo](/assets/action-types-provided.gif)

#### 3. Mapped actions
After describing your store with `createStoreContext` you will be possible to resolve store using `React.useContext` hook. Resulting store will be an intersection of `state`and mapped actions.
You can set additional action arguments and return any value. Mapped action will infer all of that and provide it to you.

![Action types provided demo](/assets/mapped-action-types.gif)

## Docs
[📖 Read full api reference and docs by clicking here 📖](https://minajevs.github.io/react-concise-state/)

---

MIT License
Copyright (C) Dmitrijs Minajevs [dmitrijs.minajevs@outlook.com](mailto:dmitrijs.minajevs@outlook.com).