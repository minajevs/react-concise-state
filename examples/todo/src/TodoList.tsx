import * as React from 'react'

import { context as tabContext, Todo as TodoModel } from './tabStore'
import {
  context as visibilityContext,
  VisibilityFilter
} from './visibilityStore'
import Todo from './Todo'

const getVisibleTodos = (todos: TodoModel[], filter: VisibilityFilter) => {
  switch (filter) {
    case VisibilityFilter.SHOW_ALL:
      return todos
    case VisibilityFilter.SHOW_COMPLETED:
      return todos.filter(t => t.completed)
    case VisibilityFilter.SHOW_ACTIVE:
      return todos.filter(t => !t.completed)
    default:
      throw new Error('Unknown filter: ' + filter)
  }
}

const TodoList: React.FC = props => {
  const { todos, toggleTodo } = React.useContext(tabContext)
  const { filter } = React.useContext(visibilityContext)

  const visibleTodos = getVisibleTodos(todos, filter)

  return (
    <ul>
      {visibleTodos.map(todo => (
        <Todo key={todo.id} {...todo} onClick={() => toggleTodo(todo.id)} />
      ))}
    </ul>
  )
}

export default TodoList
