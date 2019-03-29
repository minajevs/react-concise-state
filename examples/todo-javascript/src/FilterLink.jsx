import * as React from 'react'

import { context } from './visibilityStore'

const FilterLink = ({ filter, children }) => {
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
