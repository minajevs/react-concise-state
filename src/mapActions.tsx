import { Contexts, Actions, InferStores, ContextReference, MappedActions, Middleware } from './types'
import { runWithMiddleware } from './middleware'

/**
 * @hidden internal function to map action creators to store actions
 */
export function mapActionsToDispatch<
    TState,
    TContexts extends Contexts,
    TActions extends Actions<TState, TContexts>
>(
    contextReference: ContextReference<TState, TContexts>,
    actions?: TActions,
    middleware: Middleware[] = []
): MappedActions<TState, TContexts, TActions> {
    if (actions === undefined || typeof actions !== 'function')
        return {} as MappedActions<TState, TContexts, TActions>
    const initActions = actions(contextReference)
    return Object.keys(initActions).reduce((obj, key) => {
        return {
            ...obj,
            [key]: (...args: []) => runWithMiddleware(middleware, initActions[key], key, ...args)
        }
    }, {} as MappedActions<TState, TContexts, TActions>)
}
/**
 * @hidden internal function to map action creators to store actions when there are no Providers available
 */
export function mapActionsToDefault<
    TState,
    TActions extends Actions<TState, TContexts>,
    TContexts extends Contexts
>(
    initialState: TState,
    actions?: TActions
): MappedActions<TState, TContexts, TActions> {
    if (actions === undefined || typeof actions !== 'function')
        return {} as MappedActions<TState, TContexts, TActions>
    const contextReference: ContextReference<TState, TContexts> = {
        state: initialState,
        stores: {} as InferStores<TContexts>,
        // tslint:disable-next-line: max-line-length
        setState: (value) => { throw new Error(`Can't invoke 'setState' with ${value} because provider does not exist`) }
    }
    const initActions = actions(contextReference)
    return Object.keys(initActions).reduce((obj, key) => {
        return {
            ...obj,
            [key]: (...args: never[]) => initActions[key](...args)
        }
    }, {} as MappedActions<TState, TContexts, TActions>)
}
