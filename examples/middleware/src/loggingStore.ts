import createStoreContext, { createMiddleware } from 'react-concise-state'

export const [loggingContext, Provider] = createStoreContext(
  {
    logs: [] as string[]
  },
  ({ setState }) => ({
    write: (log: string) => setState(prev => ({ logs: [...prev.logs, log] }))
  })
)

export const loggingMiddleware = createMiddleware(
  (next, args, { stores, actionName }) => {
    stores.logs.write(
      `Calling '${actionName}' ${args !== undefined &&
      ' with ' + JSON.stringify(args)}`
    )
    next(args)
  },
  { logs: loggingContext }
)
