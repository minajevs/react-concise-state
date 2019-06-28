import createStoreContext from 'react-concise-state'

export const [context, Provider] = createStoreContext(
  {
    todos: []
  },
  ({ state, setState }) => ({
    addTodo: text => {
      const todo = {
        id: state.todos.length,
        completed: false,
        text
      }
      setState({ ...state, todos: [...state.todos, todo] })
    },
    toggleTodo: id => {
      const newTodos = state.todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )

      setState({ ...state, todos: [...newTodos] })
    }
  })
)
