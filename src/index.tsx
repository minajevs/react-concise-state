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

type ContextReference<TState> = {
    state: TState
    setState: React.Dispatch<React.SetStateAction<TState>>
}

type Action<TState, TArgs extends never[]= never[], TReturn = any> =
    (contextReference: ContextReference<TState>, ...args: TArgs) => TReturn

type Actions<TState> = { [key: string]: Action<TState> }

type MappedActions<TState, TActions extends Actions<TState>> = {
    [P in keyof TActions]: (...args: DropFirst<Params<TActions[P]>>) => RetType<TActions[P]>
}

type Store<TState, TActions extends Actions<TState>> =
    TActions extends undefined ? TState : TState & MappedActions<TState, TActions>

/*
    Logic
*/

export default function createStoreContext<TState, TActions extends Actions<TState> = {}>(
    initialState: TState,
    actions?: TActions
): [React.Context<Store<TState, TActions>>, React.FC] {
    const store = { ...initialState, ...mapActionsToDefault(initialState, actions) } as Store<TState, TActions>
    const context = React.createContext(store)

    const provider: React.FC = props => {
        let [_state, setState] = React.useState(initialState)
        const _actions = mapActionsToDispatch({
            state: _state,
            setState
        }, actions)

        const _store = { ..._state, ..._actions } as Store<TState, TActions>

        return (
            <context.Provider value={_store}>
                {props.children}
            </context.Provider>
        )
    }

    return [context, provider]
}

function mapActionsToDispatch<TState, TActions extends Actions<TState>>(
    contextReference: ContextReference<TState>,
    actions?: TActions,
): MappedActions<TState, TActions> {
    if (actions === undefined) return {} as MappedActions<TState, TActions>
    return Object.keys(actions).reduce(
        (obj, key) => {
            return {
                ...obj,
                [key]: (...args: never[]) => actions[key](contextReference, ...args)
            }
        },
        {} as MappedActions<TState, TActions>)
}

function mapActionsToDefault<TState, TActions extends Actions<TState>>(
    initialState: TState,
    actions?: TActions,
): MappedActions<TState, TActions> {
    if (actions === undefined) return {} as MappedActions<TState, TActions>

    return Object.keys(actions).reduce(
        (obj, key) => {
            const contextReference: ContextReference<TState> = {
                state: initialState,
                setState: (value) => { throw new Error(`[${key}]: Can't invoke 'setState' with ${value} because provider does not exist`) }
            }
            return {
                ...obj,
                [key]: (...args: never[]) => actions[key](contextReference, ...args)
            }
        },
        {} as MappedActions<TState, TActions>)
}