import * as React from 'react'

/*
    Custom Helper types
*/

// Custom Params helper type because existing counterpart "Parameters" uses any instead of never, which is faulsy
export type Params<T extends (...args: never[]) => unknown> = T extends (...args: infer P) => any ? P : never;

// Custom RetType helper type because existing counterpart "ReturnType" uses any instead of never, which is faulsy
export type RetType<T extends (...args: never[]) => unknown> = T extends (...args: never[]) => infer R ? R : any;

// For [First, ...Rest] tuple gets [Rest] tuple
export type DropFirst<T extends any[]> =
    ((...args: T) => any) extends (arg: any, ...rest: infer U) => any[] ? U : T;

export type Tail<T> = T extends Array<any>
    ? ((...args: T) => never) extends ((a: any, ...args: infer R) => never)
    ? R
    : never
    : never

/*
    API Types
*/

type ContextReference<TState, TContexts extends Contexts> = {
    state: TState
    setState: React.Dispatch<React.SetStateAction<TState>>
    stores: InferStores<TContexts>
}

type Action<TState, TContexts extends Contexts, TArgs extends never[]= never[], TReturn = any> =
    (contextReference: ContextReference<TState, TContexts>, ...args: TArgs) => TReturn

type Actions<TState, TContexts extends Contexts> = { [key: string]: Action<TState, TContexts> }

type MappedActions<TState, TContexts extends Contexts, TActions extends Actions<TState, TContexts>> = {
    [P in keyof TActions]: (...args: DropFirst<Params<TActions[P]>>) => RetType<TActions[P]>
}

type Store<TState, TContexts extends Contexts, TActions extends Actions<TState, TContexts>> =
    TActions extends undefined ? TState : TState & MappedActions<TState, TContexts, TActions>

type Context<T = any> = React.Context<T>
type Contexts = { [key: string]: Context }

export type Params1<T extends (...args: never[]) => unknown> = T extends (...args: infer P) => any ? P : never;

type InferStore<TContext extends React.Context<any>> =
    TContext extends React.Context<infer TStore> ? TStore : never

type InferStores<TContexts extends Contexts> = {
    [P in keyof TContexts]: InferStore<TContexts[P]>
}
/*
    Logic
*/

export default function createStoreContext<
    TState,
    TActions extends Actions<TState, TContexts> = {},
    TContexts extends Contexts = {}
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

function mapActionsToDispatch<TState, TContexts extends Contexts, TActions extends Actions<TState, TContexts>>(
    contextReference: ContextReference<TState, TContexts>,
    actions?: TActions,
): MappedActions<TState, TContexts, TActions> {
    if (actions === undefined) return {} as MappedActions<TState, TContexts, TActions>
    return Object.keys(actions).reduce(
        (obj, key) => {
            return {
                ...obj,
                [key]: (...args: never[]) => actions[key](contextReference, ...args)
            }
        },
        {} as MappedActions<TState, TContexts, TActions>)
}

function mapActionsToDefault<TState,
    TActions extends Actions<TState, TContexts>,
    TContexts extends Contexts
>(
    initialState: TState,
    actions?: TActions,
): MappedActions<TState, TContexts, TActions> {
    if (actions === undefined) return {} as MappedActions<TState, TContexts, TActions>

    return Object.keys(actions).reduce(
        (obj, key) => {
            const contextReference: ContextReference<TState, TContexts> = {
                state: initialState,
                stores: {} as InferStores<TContexts>,
                // tslint:disable-next-line: max-line-length
                setState: (value) => { throw new Error(`[${key}]: Can't invoke 'setState' with ${value} because provider does not exist`) }
            }
            return {
                ...obj,
                [key]: (...args: never[]) => actions[key](contextReference, ...args)
            }
        },
        {} as MappedActions<TState, TContexts, TActions>)
}