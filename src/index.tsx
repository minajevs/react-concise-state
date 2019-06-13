import * as React from 'react'

/*
    Custom Helper types
*/

/** 
 * Custom Params helper type because existing counterpart "Parameters" uses any instead of never, which is faulsy
 * @typeparam T any function in the form (...args: P[]) => any
 * @returns typeof params (P)
 */
type Params<T extends (...args: never[]) => unknown> = T extends (...args: infer P) => any ? P : never;

/**
 * Custom RetType helper type because existing counterpart "ReturnType" uses any instead of never, which is faulsy
 * @typeparam T any function in the form (...args: any[]) => R
 * @returns typeof return value (R)
 */
type RetType<T extends (...args: never[]) => unknown> = T extends (...args: never[]) => infer R ? R : any;

/**
 * For [First, ...Rest] tuple gets [Rest] tuple
 * @typeparam T any tuple of any length  (might as well be an array) in the form [First, ...Rest]
 * @returns everything in the tuple except for the first member (Rest)
 */
type DropFirst<T extends any[]> =
    ((...args: T) => any) extends (arg: any, ...rest: infer U) => any[] ? U : T;

/*
    API Types
*/

/**
 * Special context reference object which will be provided to the actions
 */
type ContextReference<TState, TContexts extends Contexts> = {
    state: TState
    setState: React.Dispatch<React.SetStateAction<TState>>
    stores: InferStores<TContexts>
}

/**
 * Action creator which resolves correct argument types
 */
type Action<TArgs extends never[] = never[], TReturn = any> =
    (...args: TArgs) => TReturn

/**
 * Resolves correct contextReference will all the types correctly mapped
 * [[ContextReference]] is passed to a dictionary of action creators [[Action]] in the form (contextReference) => ({ key: actionCreator })
 * 
 * Every entry will be mapped to a store action [[MappedActions]]
 */
type Actions<TState, TContexts extends Contexts> = (contextReference: ContextReference<TState, TContexts>) => { [key: string]: Action }

/**
 * Dictionary of store actions in the form { key: action }
 */
type MappedActions<
    TState,
    TContexts extends Contexts,
    TActions extends Actions<TState, TContexts>
    > = {
        [P in keyof RetType<TActions>]: (...args: Params<RetType<TActions>[P]>) => RetType<RetType<TActions>[P]>
    }

/**
 * Store as an intersection of TState and [[MappedActions]] 
 */
type Store<TState, TContexts extends Contexts, TActions extends Actions<TState, TContexts>> =
    TActions extends undefined ? TState : TState & MappedActions<TState, TContexts, TActions>

/**
 * React.Context wrapper to predefault context type to any.
 * 
 * Is necessary to use this type as generic constraint in generic types
 */
type Context<T = any> = React.Context<T>

/**
 * [[Context]] dictionary 
 */
type Contexts = { [key: string]: Context }

/**
 * Infering React.Context type
 * @typeparam TContext React.Context<S>
 * @returns S
 */
type InferStore<TContext extends React.Context<any>> =
    TContext extends React.Context<infer TStore> ? TStore : never

/**
 * Infering React.Context type for dictionary of contexts [[Contexts]]
 * @typeparam TContexts { key: React.Context<keyS> }
 * @returns dictionary { key: keyS } 
 */
type InferStores<TContexts extends Contexts> = {
    [P in keyof TContexts]: InferStore<TContexts[P]>
}
/*
    Logic
*/

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
        contexts: TContexts = {} as TContexts
    ): [React.Context<Store<TState, TContexts, TActions>>, React.FC] {
    // tslint:disable-next-line: max-line-length
    const store = { ...initialState, ...mapActionsToDefault(initialState, actions) } as Store<TState, TContexts, TActions>
    const context = React.createContext(store)

    const provider: React.FC = props => {
        let [_state, setState] = React.useState(initialState)

        const stores = Object.keys(contexts).reduce(
            (obj, key) => {
                return {
                    ...obj,
                    [key]: React.useContext(contexts[key])
                }
            },
            {} as InferStores<TContexts>)

        const _actions = mapActionsToDispatch({
            state: _state,
            setState,
            stores
        }, actions)

        const _store = { ..._state, ..._actions } as Store<TState, TContexts, TActions>

        return (
            <context.Provider value={_store}>
                {props.children}
            </context.Provider>
        )
    }

    return [context, provider]
}

/**
 * @hidden internal function to map action creators to store actions
 */
function mapActionsToDispatch<TState, TContexts extends Contexts, TActions extends Actions<TState, TContexts>>(
    contextReference: ContextReference<TState, TContexts>,
    actions?: TActions,
): MappedActions<TState, TContexts, TActions> {
    if (actions === undefined || typeof actions !== 'function') return {} as MappedActions<TState, TContexts, TActions>
    const initActions = actions(contextReference)
    return Object.keys(initActions).reduce(
        (obj, key) => {
            return {
                ...obj,
                [key]: (...args: never[]) => initActions[key](...args)
            }
        },
        {} as MappedActions<TState, TContexts, TActions>)
}

/**
 * @hidden internal function to map action creators to store actions when there are no Providers available
 */
function mapActionsToDefault<TState,
    TActions extends Actions<TState, TContexts>,
    TContexts extends Contexts
>(
    initialState: TState,
    actions?: TActions,
): MappedActions<TState, TContexts, TActions> {
    if (actions === undefined || typeof actions !== 'function') return {} as MappedActions<TState, TContexts, TActions>
    const contextReference: ContextReference<TState, TContexts> = {
        state: initialState,
        stores: {} as InferStores<TContexts>,
        // tslint:disable-next-line: max-line-length
        setState: (value) => { throw new Error(`Can't invoke 'setState' with ${value} because provider does not exist`) }
    }
    const initActions = actions(contextReference)
    return Object.keys(initActions).reduce(
        (obj, key) => {
            return {
                ...obj,
                [key]: (...args: never[]) => initActions[key](...args)
            }
        },
        {} as MappedActions<TState, TContexts, TActions>)
}