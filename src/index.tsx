import createStoreContext from './createStoreContext'
import { Middleware } from './types'
import { createMiddleware } from './middleware'

export default createStoreContext

export {
    createMiddleware,
    Middleware
}