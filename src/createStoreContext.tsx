import * as React from 'react'

import { Contexts, Actions, Store, InferStores, Middleware } from './types'
import { mapActionsToDefault, mapActionsToDispatch } from './mapActions'

/**
 * Creates react context with state store. Store consists of state properties and actions which modify it.
 * @param initialState initial state
 *
 * @param actions is a function which creates dictionary (key-value object) of action creators for a given store. Actions might have arguments, can modify state and return values.
 * Actions creator provide special [[ContextReference]] object for all action-creators, which has:
 * * `setState` method to modify state
 * * `state` object to access current state of type
 * * `stores` object to access injected store contexts
 *
 * Any argument in action creator will be converted to action parameter, which user must provide when calling action.
 *
 * Example:
 * * Action creator:
 * ```typescript
 * (reference) => {
 *      actionName: (payload: string) => {
 *           reference.setState({whatever: payload})
 *      }
 * }
 * ```
 * * Action:
 * ```typescript
 * store.actionName("Hello world")
 * ```
 *
 * @param contexts a dictionary (key-value object) of injected store contexts. Those stores will be resolved and passed to actions in `stores` property of [[ContextReference]]
 *
 * Example:
 * ```typescript
 * createStoreContext({foo: '123'}, (reference) => ({
 *  action: () => {
 *      reference.stores.bar.someBarAction()
 *      return reference.stores.bar.someBarProperty
 *  }
 * }), {
 *  bar: barContext
 * })
 * ```
 *
 * @typeparam TState any JS object representing application or application part state
 * @typeparam TActions creator function of a dictionary (key-value object) of action creators
 * @typeparam TContexts a dictionary (key-value object) of injected store contexts
 *
 * @returns [context, Provider] tuple, where context is [[React.Context]] and should be consumed to access store,
 * and Provider is [[React.FC]] (functional component) without props, which enables store actions for any nested components
 */
export default function createStoreContext<
    TState,
    TContexts extends Contexts = Contexts,
    TActions extends Actions<TState, TContexts> = Actions<TState, TContexts>,
    >(
        initialState: TState,
        actions: TActions = {} as TActions,
        options: {
            contexts?: TContexts,
            middleware?: Middleware[]
        } = {}
    ): [React.Context<Store<TState, TContexts, TActions>>, React.FC] {
    const store = { ...initialState, ...mapActionsToDefault(initialState, actions) } as Store<TState, TContexts, TActions>
    const context = React.createContext(store)

    const provider: React.FC = props => {
        let [_state, setState] = React.useState(initialState)

        const { contexts, middleware } = options

        const _stores = resolveStores(contexts)

        const _actions = mapActionsToDispatch({
            state: _state,
            setState,
            stores: _stores
        }, actions, middleware)

        const _store = { ..._state, ..._actions } as Store<TState, TContexts, TActions>
        return (<context.Provider value={_store}>
            {props.children}
        </context.Provider>)
    }

    return [context, provider]
}

const resolveStores = <TContexts extends Contexts>(contexts: TContexts = {} as TContexts) =>
    Object.keys(contexts).reduce((obj, key) => {
        return {
            ...obj,
            [key]: React.useContext(contexts[key])
        }
    }, {} as InferStores<TContexts>)

const resolveMiddleware = (middleware: Middleware[] = []) => middleware