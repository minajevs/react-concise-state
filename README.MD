# react-concise-state
[![npm](https://img.shields.io/npm/v/react-concise-state.svg?style=flat-square)](http://npm.im/react-concise-state)
[![Travis](https://img.shields.io/travis/minajevs/react-concise-state.svg?style=flat-square)](https://travis-ci.org/minajevs/react-concise-state)
[![Codecov](https://img.shields.io/codecov/c/github/minajevs/react-concise-state.svg?style=flat-square)](https://codecov.io/github/minajevs/react-concise-state)

> Yet another React state manager

Simple, low-impact state manager for smaller React applications. 

`npm install react-concise-state`

```tsx
import createStoreContext from "react-concise-state"

// 1️⃣ create a store context providing initial state and an actions
const [context, Provider] = createStoreContext({
    counter: 0
}, ({ state, setState }) => ({
    // 👇 actions modify state using provided `setState`
    incrementBy: (increment: number) => {
      const newValue = state.counter + increment
      setState({ counter: newValue })
    },
    reset: () => setState({ counter: 0 })
}))

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
* Store cross-calls
* Middleware
* Multi-paradigm
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
* May call own store actions
* May be chained, injected, cached, curried etc.
* May call other stores
* May be written in functional & immutable approach or in imperative approach

To create store action in `react-concise-state` provide a second argument to `createStoreContext` - an object where object keys are action names and values are actions themselves.

Basic examples:
```tsx
// Imperative
const actions = ({state, setState}) => ({
    someAction: (payload) => {
        const newState = ... // do something
        setState(newState)
    }
})

// Functional
const actions = ({setState}) => ({
    someAction: (payload) => setState(prev => { ..prev, /* do something */})
})

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
const [context, Provider] = createStoreContext({counter: 0}, ({state, setState}) => ({
    // No payload
    increment: () => setState({counter: ++state.counter}),
    // If you are using functional style you can also get current state inside `setState` using callback function
    decrement: () => setState(state => ({counter: --state.counter})),

    // With payload
    setValue: (value) => setState({counter: value}),
    setValueIfMoreThan: (value, limit) => {
        if(state.counter > limit)
            setState({counter: value})
    }
}))

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
const [context, Provider] = createStoreContext({todos: []}, ({setState}) => ({
    // Returning a value
    addTodo: (todo) => {
        const result = Api.addTodo(todo)
        return result
    },
    // Getting todos asynchronously
    getTodos: async () => {
        const todos = await Api.getTodos()
        setState({todos})
    }
}))

...

// Usage
const store = React.useContext(context)

const result = store.addTodo('buy milk')

await store.getTodos()
```

You can call actions from other actions.

```tsx
const [context, Provider] = createStoreContext({todos: []}, ({setState}) => ({
    addTodo(todo) {
        const result = Api.addTodo(todo)
        this.getTodos()
    },
    getTodos: async () => {
        const todos = await Api.getTodos()
        setState({todos})
    }
}))

...

// Usage
const store = React.useContext(context)

const result = store.addTodo('buy milk')

// await store.getTodos() - don't need to call it. `.addTodo` will call it
```

</p></details>

#### `contexts` - calling other stores
Sometimes you would like to call other store action from an action. You can't use `React.useContext` because of specific hook rules in React. Hook amount should never change during runtime and only way to supply that is to initialize all dependency contexts before bootstraping actions.

You can call actions in other stores by providing dependency contexts in a 3rd parameter to `createStoreContext`. Those contexts will be mapped to corresponding stores internally and will be available in `stores` object in `{setState, action, stores}`  argument of action creator.

Example:
```tsx
const [todoContext, Provider] = createStoreContext({todos: []}, ({state, setState}) => ({
    addTodo: (todo) => {
        setState({todos: [...state.todos, todo]})
    },
}))
const [mainContext, Provider] = createStoreContext({message: ''}, ({setState, stores}) => ({
    someAction: (name) => {
        const { todos } = stores.todoContext // stores.todoContext is a "todo store" ({todos: [], addTodo: (todo) => void})
        const newMessage = `Hello, ${name}, you have ${todos.length} todos!`
        setState({message: newMessage})
    },
}), { contexts: { todoContext })
...
// Usage
const todoStore = React.useContext(todoContext)
const mainStore = React.useContext(mainContext)
todoStore.addTodo('buy milk')
todoStore.addTodo('learn typescript')
mainStore.someAction('Dmitrijs')
// mainStore.message is "Hello, Dmitrijs, you have 2 todos!" 
```

#### Wrapping store actions in a middleware
Actions are just a functions which modify state and/or return some values. Actions may be just plain state reducers, or they can contain some complex logic with API calls 
and data manipulation. In any case you will usually run into such situation, that all actions of the store need to do something the same way. E.g. log input values, handle errors the same way, etc... Middleware is there for that exact reason. 

You can provide any middleware to store creation in a 3rd parameter to `createStoreContext`. That middleware will be executed every time you call any store action, just after you call it and just before it actually executes. 

Example: 
```tsx
// Without middleware
const [todoContext, Provider] = createStoreContext({todos: []}, ({state, setState}) => ({
    addTodo: (todo) => {
        // Logging
        console.log('Calling addTodo with argument ' + todo)
        // Error handling
        try {  
            Api.addTodo(todo)
        } catch (ex) {
            console.log(ex)
        }
    },
    getAll: () => {
        // Logging
        console.log('Calling getAll')
        // Error handling
        // Notice how at this point we are writing same stuff over and over again
        try {  
            const todos = Api.getAll()
            setState({todos})
        } catch (ex) {
            console.log(ex)
        }
    }
}))

// With middleware
import { Middleware } from 'react-concise-state'

// Error handling middleware
const errorHandling: Middleware = (next, args, meta) => {
    try {
        // try calling next executable function in the flow (either next middleware or aciton itself)
        // Don't forget to pass arguments
        next(args)
    } catch (ex) {
        // If it fails (action or other middleware) log an error
        console.log(ex)
    }      
}

// Logging middleware
const logging: Middleware = (next, args, meta) => {
    // Log to console action key (name) and it's arguments
    console.log(`Calling ${meta.actionName} with arguments ${args}`)
    // Don't forget to call `next(args)`! 
    next(args)
}

const [todoContext, Provider] = createStoreContext({todos: []}, ({state, setState}) => ({
    addTodo: (todo) => Api.addTodo(todo),
    getAll: () => {  
        const todos = Api.getAll()
        setState({todos})
    }
}), { middleware: [errorHandling, logging]}) // Provide middleware to the store
```

#### `createMiddleware` - creating custom store-bind middleware
Middleware is a useful pattern, which you can use to streamline store actions, make stores more generic and have almost perfect reusability across contexts.
Default and the easiest way to create a middleware for your store is to make a new function of type `Middleware`.
However, what if you want to save every exception into some store and then display those errors in some other components nicely? You may inject stores into middleware by using 
`createMiddleware` helper. After injecting stores you may access store state and actions inside middleware. Error handling middleware example:
```tsx
import { createMiddleware, createStoreContext } from 'react-concise-state'

// Creating errors store
const [context, Provider] = createStateContext({
    latestError: null as Error | null,
    errorLog: [] as Error[]
}, ({setState}) => {
    // Set latestError and push it to error log
    handleError: (error: Error) => {
        setState(prev => ({...prev, latestError: error, errorLog: [...prev.errorLog, error]}))
    }
})

// Creating error handling middleware with injected errors store
const errorHandling = createMiddleware((next, args, meta) => {
    try {
        await next(args)
    } catch (ex) {
        // Call error store to save error in it
        meta.stores.errors.handleError(ex)
    }
}, { errors: context })
```

#### `meta` - store metadata
Any settings or additional store information which might be needed can be stored in special `meta` option of the store creator. This meta information is unchanged through store lifetime, is available for every action and middleware. `Meta` type is a dictionary of user-defined values. The most common usage for metadata is providing API url/token, dev/prod flags or anything else which is static through application lifetime. Example:

```tsx
// This file will export correct baseUrl and headers for authentication base on the environment (DEV/TEST/PROD)
import { baseUrl, authHeaders } from './config'

const [context, Provider] = createStateContext({
    todos: []
}, ({setState, meta}) => {
    getAll: async () => {
        // Use provided meta data. It is alternative way of using those values from global scope
        const res = await fetch(meta.baseUrl, { headers: meta.headers })
        const todos = await res.json()
        setState({todos})
    }
}. {
    // Provide values through meta option
    meta: {
        baseUrl: baseUrl,
        headers: authHeaders,
        // Flag to tell logging middleware that this store must not be logged 
        shouldNotLog: true
    },
    middleware: [logging]
})

// Logging middleware
const logging: Middleware = (next, args, meta) => {
    // Check meta data to see if this store should not be logged
    if (meta.shouldNotLog) return next(args)

    console.log(`Calling ${meta.actionName} with arguments ${args}`)
    next(args)
}

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
When creating store actions you will be provided with correct types for current `state`, `setState` method and `stores` and `meta` objects. 

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