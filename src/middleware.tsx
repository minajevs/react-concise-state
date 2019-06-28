import { Action, Middleware, Contexts, InitActions, RetType, MiddlewareCreator, InitMiddleware } from './types'

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
    actions: RetType<InitActions<TState, TContexts>>,
    actionKey: string,
    args: TArgs
): TReturn | Promise<TReturn> {
    const [first, ...rest] = middleware

    const action = actions[actionKey]

    if (first === undefined)
        return actionCaller(action, actions)(args)

    return first((nextArgs) => runWithMiddleware(rest, actions, actionKey, nextArgs), actionKey, args)
}

const actionCaller = <
    TState,
    TContexts extends Contexts,
    TArgs extends [],
    TAction extends Action<TArgs> = Action<TArgs>
>(action: TAction, actions: RetType<InitActions<TState, TContexts>>) => (args: TArgs) => action.call(actions, ...args)