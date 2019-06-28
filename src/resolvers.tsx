import * as React from 'react'

import { Contexts, InferStores, Middleware, MiddlewareCreator } from './types'

/**
 * @hidden Internal method which resolves all given contexts to corresponding stores
 */
export const resolveStores = <TContexts extends Contexts>(contexts: TContexts = {} as TContexts) =>
    Object.keys(contexts).reduce((obj, key) => {
        return {
            ...obj,
            [key]: React.useContext(contexts[key])
        }
    }, {} as InferStores<TContexts>)

/**
* @hidden Internal method which resolves all given middlewares, provides injected stores
*/
export const resolveMiddleware = <TMiddlewareContexts extends Contexts>(middlewareList?: (Middleware | MiddlewareCreator<TMiddlewareContexts>)[]) =>
    middlewareList !== undefined
        ? middlewareList.map(middleware => {
            if (isMiddlewareCreator(middleware)) {
                const _stores = resolveStores(middleware.contexts)
                const _middleware: Middleware = (next, actionKey, args) => middleware.initMiddleware({ stores: _stores }, next, actionKey, args)
                return _middleware
            } else {
                return middleware
            }
        })
        : []

/**
* @hidden Internal method which checks if provided middleware is middleware or middleware creator
*/
const isMiddlewareCreator = <TMiddlewareContexts extends Contexts>(
    middleware: Middleware | MiddlewareCreator<TMiddlewareContexts>
): middleware is MiddlewareCreator<TMiddlewareContexts> =>
    typeof middleware !== 'function'