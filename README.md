# extensible-duck

extensible-duck is an implementation of the [Ducks proposal](https://github.com/erikras/ducks-modular-redux). With this library you can create reusable and extensible ducks.

[![Travis build status](http://img.shields.io/travis/investtools/extensible-duck.svg?style=flat)](https://travis-ci.org/investtools/extensible-duck)
[![Code Climate](https://codeclimate.com/github/investtools/extensible-duck/badges/gpa.svg)](https://codeclimate.com/github/investtools/extensible-duck)
[![Test Coverage](https://codeclimate.com/github/investtools/extensible-duck/badges/coverage.svg)](https://codeclimate.com/github/investtools/extensible-duck)
[![Dependency Status](https://david-dm.org/investtools/extensible-duck.svg)](https://david-dm.org/investtools/extensible-duck)
[![devDependency Status](https://david-dm.org/investtools/extensible-duck/dev-status.svg)](https://david-dm.org/investtools/extensible-duck#info=devDependencies)

## Basic Usage

```js
// widgetsDuck.js

import Duck from 'extensible-duck'

return new Duck({
  namespace: 'my-app', store: 'widgets',
  types: ['LOAD', 'CREATE', 'UPDATE', 'REMOVE'],
  initialState: {},
  reducer: (state, action, duck) => {
    switch(action.type) {
      // do reducer stuff
      default: return state
    }
  },
  creators: (duck) => ({
    loadWidgets:      () => ({ type: duck.types.LOAD }),
    createWidget: widget => ({ type: duck.types.CREATE, widget })
    updateWidget: widget => ({ type: duck.types.UPDATE, widget })
    removeWidget: widget => ({ type: duck.types.REMOVE, widget })
  })
})
```

```js
// reducers.js

import { combineReducers } from 'redux'
import widgetDuck from './widgetDuck'

export default combineReducers({ widgets: widgetDuck.reducer })
```

### Constructor Arguments

const { namespace, store, types, consts, initialState, creators } = options

| Name         | Description                                             | Type                           | Example                                     |
|--------------|---------------------------------------------------------|--------------------------------|---------------------------------------------|
| namespace    | Used as a prefix for the types                          | String                         | `'my-app'`                                  |
| store        | Used as a prefix for the types                          | String                         | `'widgets'`                                 |
| types        | List of action types                                    | Array                          | `[ 'CREATE', 'UPDATE' ]`                    |
| consts       | Constants you may need to declare                       | Object of Arrays               | `{ statuses: [ 'LOADING', 'LOADED' ] }`     |
| initialState | State passed to the reducer when the state is undefined | Anything                       | `{}`                                        |
| reducer      | Action reducer                                          | function(state, action, duck)  | `(state, action, duck) => { return state }` |
| creators     | Action creators                                         | function(duck)                 | `duck => ({ type: types.CREATE })`          |


### Duck Accessors

 * duck.reducer
 * duck.creators
 * duck.types
 * for each const, duck.\<const\>

## Creating Reusable Ducks

This example uses [redux-promise-middleware](https://github.com/pburtchaell/redux-promise-middleware)
and [axios](https://github.com/mzabriskie/axios).

```js
// remoteObjDuck.js

import Duck from 'extensible-duck'
import axios from 'axios'

export default function createDuck({ namespace, store, path, initialState={} }) {
  return new Duck({
    namespace, store,

    consts: { statuses: [ 'NEW', 'LOADING', 'READY', 'SAVING', 'SAVED' ] },

    types: [
      'UPDATE',
      'FETCH', 'FETCH_PENDING',  'FETCH_FULFILLED',
      'POST',  'POST_PENDING',   'POST_FULFILLED',
    ],

    reducer: (state, action, { types, statuses, initialState }) => {
      switch(action.type) {
        case types.UPDATE:
          return { ...state, obj: { ...state.obj, ...action.payload } }
        case types.FETCH_PENDING:
          return { ...state, status: statuses.LOADING }
        case types.FETCH_FULFILLED:
          return { ...state, obj: action.payload.data, status: statuses.READY }
        case types.POST_PENDING:
        case types.PATCH_PENDING:
          return { ...state, status: statuses.SAVING }
        case types.POST_FULFILLED:
        case types.PATCH_FULFILLED:
          return { ...state, status: statuses.SAVED }
        default:
          return state
      }
    },

    creators: ({ types }) => ({
      update: (fields) => ({ type: types.UPDATE, payload: fields }),
      get:        (id) => ({ type: types.FETCH, payload: axios.get(`${path}/${id}`),
      post:         () => ({ type: types.POST, payload: axios.post(path, obj) }),
      patch:        () => ({ type: types.PATCH, payload: axios.patch(`${path}/${id}`, obj) })
    }),

    initialState: ({ statuses }) => ({ obj: initialState || {}, status: statuses.NEW, entities: [] })
  })
}
```

```js
// usersDuck.js

import createDuck from './remoteObjDuck'

export default createDuck({ namespace: 'my-app', store: 'user', path: '/users' })
```

```js
// reducers.js

import { combineReducers } from 'redux'
import userDuck from './userDuck'

export default combineReducers({ user: userDuck.reducer })
```

## Extending Ducks

This example is based on the previous one.

```js
// usersDuck.js

import createDuck from './remoteObjDuck.js'

export default createDuck({ namespace: 'my-app',store: 'user', path: '/users' }).extend({
  types: [ 'RESET' ],
  reducer: (state, action, { types, statuses, initialState }) => {
    switch(action.type) {
      case types.RESET:
        return { ...initialState, obj: { ...initialState.obj, ...action.payload } }
      default:
        return state
  },
  creators: ({ types }) => ({
    reset: (fields) => ({ type: types.RESET, payload: fields }),
  })
})
```

## Creating Reusable Duck Extensions

This example is a refactor of the previous one.

```js
// resetDuckExtension.js

export default {
  types: [ 'RESET' ],
  reducer: (state, action, { types, statuses, initialState }) => {
    switch(action.type) {
      case types.RESET:
        return { ...initialState, obj: { ...initialState.obj, ...action.payload } }
      default:
        return state
  },
  creators: ({ types }) => ({
    reset: (fields) => ({ type: types.RESET, payload: fields }),
  })
}
```

```js
// userDuck.js

import createDuck from './remoteObjDuck'
import reset from './resetDuckExtension'

export default createDuck({ namespace: 'my-app',store: 'user', path: '/users' }).extend(reset)
```
