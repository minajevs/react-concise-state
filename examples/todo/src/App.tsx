import * as React from 'react'

import { Provider as TabProvider } from './tabStore'
import { Provider as VisibilityProvider } from './visibilityStore'

import AddTodo from './AddTodo'
import TodoList from './TodoList'
import Footer from './Footer'

const App: React.FC = props => (
  <VisibilityProvider>
    <TabProvider>
      <AddTodo />
      <TodoList />
      <Footer />
    </TabProvider>
  </VisibilityProvider>
)

export default App
