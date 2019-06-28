import createStoreContext from 'react-concise-state'

export enum VisibilityFilter {
  SHOW_ALL,
  SHOW_COMPLETED,
  SHOW_ACTIVE
}

export const [context, Provider] = createStoreContext(
  {
    filter: VisibilityFilter.SHOW_ALL
  },
  ({ setState }) => ({
    setFilter: (filter: VisibilityFilter) => setState({ filter })
  })
)
