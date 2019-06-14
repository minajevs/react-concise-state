import { Middleware } from './types'

const loggingMiddleware: Middleware = async (action, args, actionKey) => {
    console.log(`Calling action [${actionKey}] with arguments: "${args}"`)
    const result = await action(args)
    console.log(`Result: ${result}`)
}