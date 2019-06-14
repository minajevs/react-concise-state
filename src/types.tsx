/*
    Custom Helper types
*/

/**
 * Custom Params helper type because existing counterpart "Parameters" uses any instead of never, which is faulsy
 * @typeparam T any function in the form (...args: P[]) => any
 * @returns typeof params (P)
 */

type Params<T extends (...args: never[]) => unknown> = T extends (...args: infer P) => any ? P : never

/**
 * Custom RetType helper type because existing counterpart "ReturnType" uses any instead of never, which is faulsy
 * @typeparam T any function in the form (...args: any[]) => R
 * @returns typeof return value (R)
 */
type RetType<T extends (...args: never[]) => unknown> = T extends (...args: never[]) => infer R ? R : any

/**
 * For [First, ...Rest] tuple gets [Rest] tuple
 * @typeparam T any tuple of any length  (might as well be an array) in the form [First, ...Rest]
 * @returns everything in the tuple except for the first member (Rest)
 */
type DropFirst<T extends any[]> = ((...args: T) => any) extends (arg: any, ...rest: infer U) => any[] ? U : T

/**
 * For [First, ...Rest] tuple gets [Rest] tuple
 * @typeparam T any tuple of any length  (might as well be an array) in the form [First, ...Rest]
 * @returns everything in the tuple except for the first member (Rest)
 */
type MiddlewareKeys<T> = ({ [P in keyof T]: T[P] extends Middleware ? P : never })[keyof T]
type DropMiddleware<T> = Omit<T, MiddlewareKeys<T>>

/*
    API Types
*/

/**
 * Special context reference object which will be provided to the actions
 */
export type ContextReference<TState, TContexts extends Contexts> = {
    state: TState
    setState: React.Dispatch<React.SetStateAction<TState>>
    stores: InferStores<TContexts>
}

/**
 * Action creator which resolves correct argument types
 */
export type Action<TArgs extends never[] = never[], TReturn = any> =
    (...args: TArgs) => TReturn

/**
 * Resolves correct contextReference will all the types correctly mapped
 * [[ContextReference]] is passed to a dictionary of action creators [[Action]] in the form (contextReference) => ({ key: actionCreator })
 *
 * Every entry will be mapped to a store action [[MappedActions]]
 */
export type Actions<TState, TContexts extends Contexts> = (contextReference: ContextReference<TState, TContexts>) => {
    [key: string]: Action,
}

/**
 * Dictionary of store actions in the form { key: action }
 */
export type MappedActions<TState, TContexts extends Contexts, TActions extends Actions<TState, TContexts>> = {
    [P in keyof RetType<TActions>]: (...args: Params<RetType<TActions>[P]>) => RetType<RetType<TActions>[P]>
}

/**
 * Store as an intersection of TState and [[MappedActions]]
 */
export type Store<TState, TContexts extends Contexts, TActions extends Actions<TState, TContexts>> =
    TActions extends undefined ? TState : TState & MappedActions<TState, TContexts, TActions>

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

export type MiddlewareAction<TArgs extends any[] = any[], TReturn = any> =
    (...args: TArgs) => TReturn

export type MiddlewareActions = {
    [key: string]: MiddlewareAction
}

export type Middleware<TArgs extends any[] = any[], TMiddlewareAction extends MiddlewareAction<TArgs> = MiddlewareAction<TArgs>> =
    (action: TMiddlewareAction, actionKey: keyof MiddlewareActions, ...args: TArgs) => Promise<void>