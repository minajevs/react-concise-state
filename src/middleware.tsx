import { Action, Middleware, Contexts, InitActions, RetType, MiddlewareCreator, InitMiddleware, MiddlewareMeta, Meta } from './types'

/**
 * Helper method to create custom middleware. It makes possible to create middleware using user stores, so that it could call other actions.
 */
export function createMiddleware<TContexts extends Contexts>(
    initMiddleware: InitMiddleware<TContexts>,
    contexts: TContexts = {} as TContexts
): MiddlewareCreator<TContexts> {
    return {
        initMiddleware,
        contexts
    }
}

/**
 * @hidden Internal method which runs an action with all the provided middleware
 */
export function runWithMiddleware<
    TState,
    TContexts extends Contexts,
    TArgs extends [],
    TReturn,
    TMiddleware extends Middleware<TArgs, TReturn>
>(
    middleware: TMiddleware[],
    actions: RetType<InitActions<TState, TContexts, Meta>>,
    args: TArgs,
    meta: MiddlewareMeta
): TReturn | Promise<TReturn> {
    const [first, ...rest] = middleware

    const action = actions[meta.actionName]

    if (first === undefined)
        return actionCaller(action, actions)(args)

    return first((nextArgs) => runWithMiddleware(rest, actions, nextArgs, meta), args, meta)
}

const actionCaller = <
    TState,
    TContexts extends Contexts,
    TArgs extends [],
    TAction extends Action<TArgs> = Action<TArgs>
>(action: TAction, actions: RetType<InitActions<TState, TContexts, Meta>>) => (args: TArgs) => action.call(actions, ...args)