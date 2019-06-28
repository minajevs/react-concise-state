import * as React from 'react'

import { loggingContext } from './loggingStore'

const LogViewer: React.FC = props => {
  const { logs } = React.useContext(loggingContext)

  return (
    logs.length > 0 && (
      <div style={{ border: '1px solid black' }}>
        {logs.map(log => (
          <p>{log}</p>
        ))}
      </div>
    )
  )
}

export default LogViewer
