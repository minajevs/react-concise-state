import * as React from 'react'

import { Contexts, Store, Middleware, InitActions, MiddlewareCreator, Meta } from './types'
import { mapActionsToDefault, mapActionsToDispatch } from './mapActions'
import { resolveStores, resolveMiddleware } from './resolvers'

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
 * @param options is special configuration object with 2 candidate properties: `contexts` and `middleware`
 * * `contexts` is a dictionary (key-value object) of injected store contexts. Those stores will be resolved and passed to actions in `stores` property of [[ContextReference]]
 * * `middleware` is an array of used middleware. Middleware is special function which is executed after store action is called and before it is actually exectude. 
 *      Examples of middleware could be LogginMiddleware, which logs every action request to console, or ErrorHandlerMiddleware, which wraps every request in `try...catch` block   
 * 
 * Example:
 * ```typescript
 * createStoreContext({foo: '123'}, (reference) => ({
 *  action: () => {
 *      reference.stores.bar.someBarAction()
 *      return reference.stores.bar.someBarProperty
 *  }
 * }), { 
 *      contexts: {  bar: barContext },
 *      middleware: [ loggingMiddleware, errorHandlerMiddleware ]
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
    TMiddlewareContexts extends Contexts = Contexts,
    TContexts extends Contexts = Contexts,
    TMeta extends Meta = Meta,
    TInitActions extends InitActions<TState, TContexts, TMeta> = InitActions<TState, TContexts, TMeta>,
    >(
        initialState: TState,
        actions: TInitActions = {} as TInitActions,
        options: {
            contexts?: TContexts,
            middleware?: (Middleware | MiddlewareCreator<TMiddlewareContexts>)[],
            meta?: TMeta
        } = {}
    ): [React.Context<Store<TState, TContexts, TMeta, TInitActions>>, React.FC] {
    const _meta = options.meta || {} as TMeta

    const store = { ...initialState, ...mapActionsToDefault(initialState, _meta, actions) } as Store<TState, TContexts, TMeta, TInitActions>
    const context = React.createContext(store)

    const provider: React.FC = props => {
        let [_state, setState] = React.useState(initialState)

        const { contexts, middleware } = options

        const _stores = resolveStores(contexts)
        const _middleware = resolveMiddleware(middleware)

        const _actions = mapActionsToDispatch({
            state: _state,
            setState,
            stores: _stores,
            meta: _meta
        }, actions, _middleware)

        const _store = { ..._state, ..._actions } as Store<TState, TContexts, TMeta, TInitActions>
        return (<context.Provider value={_store}>
            {props.children}
        </context.Provider>)
    }

    return [context, provider]
}