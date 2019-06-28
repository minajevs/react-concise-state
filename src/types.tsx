/*
    Custom Helper types
*/

/**
 * Custom Params helper type because existing counterpart "Parameters" uses any instead of never, which is faulsy
 * @typeparam T any function in the form (...args: P[]) => any
 * @returns typeof params (P)
 */

export type Params<T extends (...args: never[]) => unknown> = T extends (...args: infer P) => any ? P : never

/**
 * Custom RetType helper type because existing counterpart "ReturnType" uses any instead of never, which is faulsy
 * @typeparam T any function in the form (...args: any[]) => R
 * @returns typeof return value (R)
 */
export type RetType<T extends (...args: never[]) => unknown> = T extends (...args: never[]) => infer R ? R : any

/**
 * For [First, ...Rest] tuple gets [Rest] tuple
 * @typeparam T any tuple of any length  (might as well be an array) in the form [First, ...Rest]
 * @returns everything in the tuple except for the first member (Rest)
 */
export type DropFirst<T extends any[]> = ((...args: T) => any) extends (arg: any, ...rest: infer U) => any[] ? U : T

/*
    API Types
*/

/**
 * Special context reference object which will be provided to the actions
 */
export type ContextReference<TState, TContexts extends Contexts, TMeta extends Meta> = {
    state: TState
    setState: React.Dispatch<React.SetStateAction<TState>>
    stores: InferStores<TContexts>
    meta: TMeta
}

/**
 * Action creator which resolves correct argument types
 */
export type Action<TArgs extends any[] = any[], TReturn = any> =
    (...args: TArgs) => TReturn

/**
 * Resolves correct contextReference with all the types correctly mapped
 * [[ContextReference]] is passed to a dictionary of action creators [[Action]] in the form (contextReference) => ({ key: actionCreator })
 *
 * Every entry will be mapped to a store action [[MappedActions]]
 */
export type InitActions<TState, TContexts extends Contexts, TMeta extends Meta> = (contextReference: ContextReference<TState, TContexts, TMeta>) => {
    [key: string]: Action
}

/**
 * Dictionary of store actions in the form { key: action }
 */
export type MappedActions<TState, TContexts extends Contexts, TMeta extends Meta, TInitActions extends InitActions<TState, TContexts, TMeta>> = {
    [P in keyof RetType<TInitActions>]: (...args: Params<RetType<TInitActions>[P]>) => RetType<RetType<TInitActions>[P]>
}

/**
 * Object which contains user-defined meta information for the store
 */
export type Meta = {
    readonly [key: string]: any
}

/**
 * Store as an intersection of TState and [[MappedActions]]
 */
export type Store<TState, TContexts extends Contexts, TMeta extends Meta, TInitActions extends InitActions<TState, TContexts, TMeta>> =
    TInitActions extends undefined ? TState : TState & MappedActions<TState, TContexts, TMeta, TInitActions>

/**
 * React.Context wrapper to predefault context type to any.
 *
 * Is necessary to use this type as generic constraint in generic types
 */
type Context<T = any> = React.Context<T>

/**
 * [[Context]] dictionary
 */
export type Contexts = {
    [key: string]: Context
}

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
export type InferStores<TContexts extends Contexts> = {
    [P in keyof TContexts]: InferStore<TContexts[P]>
}

/*
    Middleware
*/

/**
 * Middleware action is the next executable action in the chain of middlewares and actions. Used internally by middleware runner
 * @typeparam TArgs Type of the arguments of the action
 * @typeparam TReturn Return type of the action
 * @returns Callable next action
 */
export type MiddlewareAction<TArgs extends [] = [], TReturn = any> =
    (args: TArgs) => TReturn | void

/**
 * Meta information about current store and action which is being executed
 */
export type MiddlewareMeta = {
    /**
    * Name of the action which is currently being executed
    */
    readonly actionName: string
} & Meta

/**
 * Middleware function, which will be executed after store action is called and before it executes
 * @typeparam TArgs Type of the arguments of the action
 * @typeparam TMiddlewareAction Next action in the chain. Could be either [[Action]] or [[MiddlewareAction]]
 * @param next Callable next action. Middleware must call it with `args` argument to continue the chain of calls. If `next` is not called, store action won't be executed
 * @param args Array of action arguments, which action was originally called with
 * @param meta [[MiddlewareMeta]] Object which contains useful meta information about current store and action which is being executed
 */
export type Middleware<TArgs extends [] = [], TReturn extends any = any, TMiddlewareAction extends MiddlewareAction<TArgs> = MiddlewareAction<TArgs>> =
    (next: TMiddlewareAction, args: TArgs, meta: MiddlewareMeta) => Promise<TReturn> | TReturn

/**
 * Special middleware context reference object which will be provided to the middleware
 */
export type MiddlewareContextReference<TContexts extends Contexts> = {
    stores: InferStores<TContexts>
}

/**
 * Resolves correct middlewareContextReference with all the types correctly mapped
 * [[MiddlewareMeta]] and [[MiddlewareContextReference]] is passed to a middleware function [[Middleware]] in the form (meta && reference) => middleware
 */
export type InitMiddleware<
    TContexts extends Contexts = Contexts,
    TArgs extends [] = [],
    TMiddlewareAction extends MiddlewareAction<TArgs> = MiddlewareAction<TArgs>
    > = (
        next: TMiddlewareAction,
        args: TArgs,
        meta: MiddlewareContextReference<TContexts> & MiddlewareMeta,
    ) => Promise<void> | void

/**
 * Internal type which is used for Middleware [[Middleware]] resolving from initMiddleware [[InitMiddleware]] 
 */
export type MiddlewareCreator<TContexts extends Contexts> = {
    contexts: TContexts,
    initMiddleware: InitMiddleware<TContexts>
}