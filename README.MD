# react-concise-state
[![npm](https://img.shields.io/npm/v/react-concise-state.svg?style=flat-square)](http://npm.im/react-concise-state)
[![Travis](https://img.shields.io/travis/minajevs/react-concise-state.svg?style=flat-square)](https://travis-ci.org/minajevs/react-concise-state)
[![Codecov](https://img.shields.io/codecov/c/github/minajevs/react-concise-state.svg?style=flat-square)](https://codecov.io/github/minajevs/react-concise-state)

> Yet another React state manager

Simple, low-impact state manager for smaller React application. 

```tsx
import createStoreContext from 'react-concise-state';

// 1️⃣ create a store context providing initial state and an actions
const [context, Provider] = createStoreContext({
    counter: 0
}, {
    // 👇 actions modify state using provided `setState`
    incrementBy: ({state, setState}, increment: number) => { 
        const newValue = state.counter + increment
        setState({ counter: newValue })
    },
    reset: ({setState}) => setState({ counter: 0 })
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
  const increment = store.incrementBy(1)
  const decrement = store.incrementBy(-1)
  return <div>
    <h2>Counter: {store.counter}</h2>
    <hr />
    <button onClick={increment}>Increment</button>
    <button onClick={decrement}>Decrement</button>

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
`react-concise-state` born in frustration and fatigue caused by "modern" React state management. Writing hundreds of boilerplate redux code just to support basic feature gets boring quickly. Newer React features such as context and hooks are there to make state simpler, and this package uses it to make state managing in React extremely easy, concise and fun. Reducing boilerplate code to zero is the core concept.

## Installation
Yarn:
`yarn add react-concise-state`

NPM:
`npm install react-concise-state`
 
Make sure you are using recent React version (>=16.8.0) because it works best with it. 
> support of React >= 16.3.0 is possible. Should it be implemented?

If you are using TypeScript, some of the types might default to `any` on version <3.2 because of a bug with tuple types.

## Examples
> TODO

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

Actions of one store may call other actions from other stores. It is possible because **all** React hooks work inside actions. 


```tsx
const [todoContext, Provider] = createStoreContext({todos: []}, {
    addTodo: ({state, setState}, todo) => {
        setState({todos: [...state.todos, todo]})
    },
})

const [mainContext, Provider] = createStoreContext({message: ''}, {
    someAction: ({setState}, name) => {
        const todoStore = React.useContext(todoContext)
        const newMessage = `Hello, ${name}, you have ${todoStore.todos.length} todos!`
        setState({message: newMessage})
    },
})

...

// Usage
const todoStore = React.useContext(todoContext)
const mainStore = React.useContext(mainContext)

todoStore.addTodo('buy milk')
todoStore.addTodo('learn typescript')

mainStore.someAction('Dmitrijs')
// mainStore.message is "Hello, Dmitrijs, you have 2 todos!" 
```
</p></details>

### TODO:
* Documentation sections about what benefits does TypeScript gives
* Full example projects
* Online demo examples (stackblitz / codepen / ...)
* OSS stuff (license, how to contribute, ....)
* API docs (arguments, types, etc...)