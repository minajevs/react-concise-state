import * as React from 'react'

import FilterLink from './FilterLink'
import { VisibilityFilter } from './visibilityStore'

const Footer = () => (
  <div>
    <span>Show: </span>
    <FilterLink filter={VisibilityFilter.SHOW_ALL}>All</FilterLink>
    <FilterLink filter={VisibilityFilter.SHOW_ACTIVE}>Active</FilterLink>
    <FilterLink filter={VisibilityFilter.SHOW_COMPLETED}>Completed</FilterLink>
  </div>
)

export default Footer
