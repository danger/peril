import { createStore } from "redux"
import { devToolsEnhancer } from "redux-devtools-extension"
import { get } from "lodash"

export interface StoreState {
  isSidebarVisible: boolean
}

// Actions
export const TOGGLE_SIDEBAR = "TOGGLE_SIDEBAR"
export type TOGGLE_SIDEBAR = typeof TOGGLE_SIDEBAR
export interface ToggleSidebar {
  type: TOGGLE_SIDEBAR
}
export const toggleSidebar = () => ({ type: TOGGLE_SIDEBAR })

// Reducer
export const reducer = (state: StoreState, action: ToggleSidebar): StoreState => {
  switch (action.type) {
    case TOGGLE_SIDEBAR:
      return Object.assign({}, state, { isSidebarVisible: !state.isSidebarVisible })
    default:
      return state
  }
}

// Store
export const initialState: StoreState = { isSidebarVisible: false }
export const store = createStore<StoreState>(reducer, initialState, devToolsEnhancer({}))
