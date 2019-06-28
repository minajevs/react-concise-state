import * as React from 'react'

import { Provider as TabProvider } from './tabStore'
import { Provider as VisibilityProvider } from './visibilityStore'
import { Provider as LoggingProvider } from './loggingStore'

import AddTodo from './AddTodo'
import TodoList from './TodoList'
import Footer from './Footer'
import LogViewer from './LogViewer'

const App: React.FC = props => (
  <LoggingProvider>
    <VisibilityProvider>
      <TabProvider>
        <AddTodo />
        <TodoList />
        <Footer />
        <LogViewer />
      </TabProvider>
    </VisibilityProvider>
  </LoggingProvider>
)

export default App
