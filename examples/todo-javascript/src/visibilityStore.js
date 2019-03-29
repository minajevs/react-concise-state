import createStoreContext from 'react-concise-state'

export const VisibilityFilter = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE'
}

export const [context, Provider] = createStoreContext(
  {
    filter: VisibilityFilter.SHOW_ALL
  },
  {
    setFilter: ({ setState }, filter) => setState({ filter })
  }
)
