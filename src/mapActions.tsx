import { Contexts, InferStores, ContextReference, MappedActions, Middleware, InitActions, Meta } from './types'
import { runWithMiddleware } from './middleware'

/**
 * @hidden Internal function to map action creators to store actions
 */
export function mapActionsToDispatch<
    TState,
    TContexts extends Contexts,
    TMeta extends Meta,
    TInitActions extends InitActions<TState, TContexts, TMeta>
>(
    contextReference: ContextReference<TState, TContexts, TMeta>,
    actions?: TInitActions,
    middleware: Middleware[] = [],
): MappedActions<TState, TContexts, TMeta, TInitActions> {
    if (actions === undefined || typeof actions !== 'function')
        return {} as MappedActions<TState, TContexts, TMeta, TInitActions>
    const initActions = actions(contextReference)
    return Object.keys(initActions).reduce((obj, key) => {
        return {
            ...obj,
            [key]: (...args: []) => runWithMiddleware(middleware, initActions, args, { actionName: key, ...contextReference.meta })
        }
    }, {} as MappedActions<TState, TContexts, TMeta, TInitActions>)
}
/**
 * @hidden Internal function to map action creators to store actions when there are no Providers available
 */
export function mapActionsToDefault<
    TState,
    TContexts extends Contexts,
    TMeta extends Meta,
    TInitActions extends InitActions<TState, TContexts, TMeta>
>(
    initialState: TState,
    meta: TMeta,
    actions?: TInitActions,
): MappedActions<TState, TContexts, TMeta, TInitActions> {
    if (actions === undefined || typeof actions !== 'function')
        return {} as MappedActions<TState, TContexts, TMeta, TInitActions>
    const contextReference: ContextReference<TState, TContexts, TMeta> = {
        state: initialState,
        stores: {} as InferStores<TContexts>,
        setState: (value) => { throw new Error(`Can't invoke 'setState' with ${value} because provider does not exist`) },
        meta
    }
    const initActions = actions(contextReference)
    return Object.keys(initActions).reduce((obj, key) => {
        return {
            ...obj,
            [key]: (...args: never[]) => initActions[key](...args)
        }
    }, {} as MappedActions<TState, TContexts, TMeta, TInitActions>)
}
