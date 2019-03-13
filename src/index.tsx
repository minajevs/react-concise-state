import * as React from 'react'

type OptionalSpread<T = undefined> =
    T extends undefined
    ? []
    : [T]

type Action<TState, TPayload extends never = never> =
    (setState: React.Dispatch<React.SetStateAction<TState>>, payload: TPayload) => void

type Actions<TState> = { [key: string]: Action<TState> }

// Custom Params helper type because existing counterpart "Parameters" uses any instead of never, which is faulsy
type Params<T extends (...args: never[]) => unknown> = T extends (...args: infer P) => any ? P : never;

type MappedActions<TState, TActions extends Actions<TState>> = {
    [P in keyof TActions]: (...payload: OptionalSpread<Params<TActions[P]>[1]>) => void
}

type Store<TState, TActions extends Actions<TState>> =
    TActions extends undefined ? TState : TState & MappedActions<TState, TActions>

export default function createStateContext<TState, TActions extends Actions<TState> = {}>(
    initialState: TState,
    actions?: TActions
): [React.Context<Store<TState, TActions>>, React.FC] {
    const store = { ...initialState, ...mapActionsToDefault(actions) } as Store<TState, TActions>
    const context = React.createContext(store)

    const provider: React.FC = props => {
        let [_state, setState] = React.useState(initialState)

        const _actions = mapActionsToDispatch(setState, actions)

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
    dispatch: React.Dispatch<React.SetStateAction<TState>>,
    actions?: TActions,
): MappedActions<TState, TActions> {
    if (actions === undefined) return {} as MappedActions<TState, TActions>
    return Object.keys(actions).reduce(
        (obj, key) => {
            return {
                ...obj,
                [key]: (...payload: never[]) => actions[key](dispatch, payload[0])
            }
        },
        {} as MappedActions<TState, TActions>)
}

function mapActionsToDefault<TState, TActions extends Actions<TState>>(
    actions?: TActions,
): MappedActions<TState, TActions> {
    if (actions === undefined) return {} as MappedActions<TState, TActions>
    return Object.keys(actions).reduce(
        (obj, key) => {
            return {
                ...obj,
                [key]: (...payload: never[]) =>
                    () => { throw new Error(`Can't invoke ${key} because provider does not exist`) }
            }
        },
        {} as MappedActions<TState, TActions>)
}