import createStoreContext from 'react-concise-state'

export type Todo = {
  id: number
  text: string
  completed: boolean
}

type State = {
  todos: Todo[]
}

export const [context, Provider] = createStoreContext(
  {
    todos: []
  } as State,
  {
    addTodo: ({ state, setState }, text: string) => {
      const todo: Todo = {
        id: state.todos.length,
        completed: false,
        text
      }
      setState({ ...state, todos: [...state.todos, todo] })
    },
    toggleTodo: ({ state, setState }, id: number) => {
      const newTodos = state.todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )

      setState({ ...state, todos: [...newTodos] })
    }
  }
)
