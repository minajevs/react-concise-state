import * as React from 'react'

import { context, VisibilityFilter } from './visibilityStore'

type Props = {
  filter: VisibilityFilter
}

const FilterLink: React.FC<Props> = ({ filter, children }) => {
  const store = React.useContext(context)

  return (
    <button
      onClick={() => store.setFilter(filter)}
      disabled={store.filter === filter}
      style={{
        marginLeft: '4px'
      }}
    >
      {children}
    </button>
  )
}

export default FilterLink
