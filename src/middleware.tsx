import { Action, Middleware } from './types'

export function runWithMiddleware<
    TArgs extends [],
    TReturn,
    TAction extends Action<TArgs, TReturn>
>(
    middleware: Middleware[],
    action: TAction,
    actionKey: string,
    ...args: TArgs
) {
    const [first, ...rest] = middleware

    if (rest.length > 0)
        runWithMiddleware(rest, action, actionKey, ...args)

    first(action, actionKey, ...args)
}