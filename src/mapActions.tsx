import { Contexts, InferStores, ContextReference, MappedActions, Middleware, InitActions } from './types'
import { runWithMiddleware } from './middleware'

/**
 * @hidden Internal function to map action creators to store actions
 */
export function mapActionsToDispatch<
    TState,
    TContexts extends Contexts,
    TInitActions extends InitActions<TState, TContexts>
>(
    contextReference: ContextReference<TState, TContexts>,
    actions?: TInitActions,
    middleware: Middleware[] = []
): MappedActions<TState, TContexts, TInitActions> {
    if (actions === undefined || typeof actions !== 'function')
        return {} as MappedActions<TState, TContexts, TInitActions>
    const initActions = actions(contextReference)
    return Object.keys(initActions).reduce((obj, key) => {
        return {
            ...obj,
            [key]: (...args: []) => runWithMiddleware(middleware, initActions, key, args)
        }
    }, {} as MappedActions<TState, TContexts, TInitActions>)
}
/**
 * @hidden Internal function to map action creators to store actions when there are no Providers available
 */
export function mapActionsToDefault<
    TState,
    TInitActions extends InitActions<TState, TContexts>,
    TContexts extends Contexts
>(
    initialState: TState,
    actions?: TInitActions
): MappedActions<TState, TContexts, TInitActions> {
    if (actions === undefined || typeof actions !== 'function')
        return {} as MappedActions<TState, TContexts, TInitActions>
    const contextReference: ContextReference<TState, TContexts> = {
        state: initialState,
        stores: {} as InferStores<TContexts>,
        setState: (value) => { throw new Error(`Can't invoke 'setState' with ${value} because provider does not exist`) }
    }
    const initActions = actions(contextReference)
    return Object.keys(initActions).reduce((obj, key) => {
        return {
            ...obj,
            [key]: (...args: never[]) => initActions[key](...args)
        }
    }, {} as MappedActions<TState, TContexts, TInitActions>)
}
