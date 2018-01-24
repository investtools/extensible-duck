# extensible-duck

extensible-duck is an implementation of the [Ducks proposal](https://github.com/erikras/ducks-modular-redux). With this library you can create reusable and extensible ducks.

[![Travis build status](http://img.shields.io/travis/investtools/extensible-duck.svg?style=flat)](https://travis-ci.org/investtools/extensible-duck)
[![Code Climate](https://codeclimate.com/github/investtools/extensible-duck/badges/gpa.svg)](https://codeclimate.com/github/investtools/extensible-duck)
[![Test Coverage](https://codeclimate.com/github/investtools/extensible-duck/badges/coverage.svg)](https://codeclimate.com/github/investtools/extensible-duck)
[![Dependency Status](https://david-dm.org/investtools/extensible-duck.svg)](https://david-dm.org/investtools/extensible-duck)
[![devDependency Status](https://david-dm.org/investtools/extensible-duck/dev-status.svg)](https://david-dm.org/investtools/extensible-duck#info=devDependencies)
![](http://img.badgesize.io/investtools/extensible-duck/master/dist/extensible-duck.min.js?compression=gzip)

<!-- MarkdownTOC autolink="true" bracket="round" autoanchor="false" markdown_preview="github" -->

- [Basic Usage](#basic-usage)
  - [Constructor Arguments](#constructor-arguments)
  - [Duck Accessors](#duck-accessors)
  - [Defining the Reducer](#defining-the-reducer)
  - [Defining the Creators](#defining-the-creators)
  - [Defining the Initial State](#defining-the-initial-state)
  - [Defining the Selectors](#defining-the-selectors)
  - [Defining the Types](#defining-the-types)
  - [Defining the Constants](#defining-the-constants)
- [Creating Reusable Ducks](#creating-reusable-ducks)
- [Extending Ducks](#extending-ducks)
- [Creating Reusable Duck Extensions](#creating-reusable-duck-extensions)
- [Creating Ducks with selectors](#creating-ducks-with-selectors)

<!-- /MarkdownTOC -->

## Basic Usage

```js
// widgetsDuck.js

import Duck from 'extensible-duck'

export default new Duck({
  namespace: 'my-app', store: 'widgets',
  types: ['LOAD', 'CREATE', 'UPDATE', 'REMOVE'],
  initialState: {},
  reducer: (state, action, duck) => {
    switch(action.type) {
      // do reducer stuff
      default: return state
    }
  },
  selectors: {
    root: state => state
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

export default combineReducers({ [widgetDuck.store]: widgetDuck.reducer })
```

### Constructor Arguments

const { namespace, store, types, consts, initialState, creators } = options

| Name         | Description                                             | Type                           | Example                                     |
|--------------|---------------------------------------------------------|--------------------------------|---------------------------------------------|
| namespace    | Used as a prefix for the types                          | String                         | `'my-app'`                                  |
| store        | Used as a prefix for the types and as a redux state key | String                         | `'widgets'`                                 |
| types        | List of action types                                    | Array                          | `[ 'CREATE', 'UPDATE' ]`                    |
| consts       | Constants you may need to declare                       | Object of Arrays               | `{ statuses: [ 'LOADING', 'LOADED' ] }`     |
| initialState | State passed to the reducer when the state is undefined | Anything                       | `{}`                                        |
| reducer      | Action reducer                                          | function(state, action, duck)  | `(state, action, duck) => { return state }` |
| creators     | Action creators                                         | function(duck)                 | `duck => ({ type: types.CREATE })`          |
| selectors    | state selectors                                         | Object of functions<br>or<br>function(duck) | `{ root: state => state}`<br>or<br>`duck => ({ root: state => state })` |

### Duck Accessors

 * duck.store
 * duck.reducer
 * duck.creators
 * duck.selectors
 * duck.types
 * for each const, duck.\<const\>

### Helper functions

 * **constructLocalized(selectors)**: maps selectors syntax from `(globalStore) => selectorBody` into `(localStore, globalStore) => selectorBody`. `localStore` is derived from `globalStore` on every selector execution using `duck.storage` key. Use to simplify selectors syntax when used in tandem with reduxes' `combineReducers` to bind the duck to a dedicated state part ([example](#creating-ducks-with-selectors)).

### Defining the Reducer

While a plain vanilla reducer would be defined by something like this:

```js
function reducer(state={}, action) {
  switch (action.type) {
    // ...
    default:
      return state
  }
}
```

Here the reducer has two slight differences:

 * It receives the duck itself as the third argument
 * It doesn't define the initial state (see [Defining the Initial State](#defining-the-initial-state))

```js
new Duck({
  // ...
  reducer: (state, action, duck) => {
    switch (action.type) {
      // ...
      default:
        return state
    }
  }
})
```

With the `duck` argument you can access the types, the constants, etc (see [Duck Accessors](#duck-accessors)).

### Defining the Creators

While plain vanilla creators would be defined by something like this:

```js
export function createWidget(widget) {
  return { type: CREATE, widget }
}

// Using thunk
export function updateWidget(widget) {
  return dispatch => {
    dispatch({ type: UPDATE, widget })
  }
}
```

With extensible-duck you define it as an Object of functions:

```js
export default new Duck({
  // ...
  creators: {
    createWidget: widget => ({ type: 'CREATE', widget })

    // Using thunk
    updateWidget: widget => dispatch => {
      dispatch({ type: 'UPDATE', widget })
    }
  }
})
```

If you need to access any duck attribute, you can define a function that returns the Object of functions:

```js
export default new Duck({
  // ...
  types: [ 'CREATE' ],
  creators: (duck) => ({
    createWidget: widget => ({ type: duck.types.CREATE, widget })
  })
})
```


### Defining the Initial State

Usually the initial state is declared within the the reducer declaration, just like bellow:

```js
function myReducer(state = {someDefaultValue}, action) {
  // ...
}
```

With extensible-duck you define it separately:

```js
export default new Duck({
  // ...
  initialState: {someDefaultValue}
})
```

If you need to access the [types](#defining-the-types) or [constants](#defining-the-constants), you can define this way:

```js
export default new Duck({
  // ...
  consts: { statuses: ['NEW'] },
  initialState: ({ statuses }) => ({ status: statuses.NEW })
})
```

### Defining the Selectors

Simple selectors:

```js
export default new Duck({
  // ...
  selectors: {
    shopItems:  state => state.shop.items
  }
})

```

Composed selectors:

```js
export default new Duck({
  // ...
  selectors: {
    shopItems:  state => state.shop.items,
    subtotal: new Duck.Selector(selectors => state =>
      selectors.shopItems(state).reduce((acc, item) => acc + item.value, 0)
    )
  }
})
```

Using with [Reselect](https://github.com/reactjs/reselect):

```js
export default new Duck({
  // ...
  selectors: {
    shopItems:  state => state.shop.items,
    subtotal: new Duck.Selector(selectors =>
      createSelector(
        selectors.shopItems,
        items => items.reduce((acc, item) => acc + item.value, 0)
      )
    )
  }
})
```

Selectors with duck reference:

```js
export default new Duck({
  // ...
  selectors: (duck) => ({
    shopItems:  state => state.shop.items,
    addedItems: new Duck.Selector(selectors =>
      createSelector(
        selectors.shopItems,
        items => {
          const out = [];
          items.forEach(item => {
            if (-1 === duck.initialState.shop.items.indexOf(item)) {
              out.push(item);
            }
          });
          return out;
        }
      )
    )
  })
})
```

### Defining the Types

```js
export default new Duck({
  namespace: 'my-app', store: 'widgets',
  // ...
  types: [
    'CREATE',   // myDuck.types.CREATE   = "my-app/widgets/CREATE"
    'RETREIVE', // myDuck.types.RETREIVE = "my-app/widgets/RETREIVE"
    'UPDATE',   // myDuck.types.UPDATE   = "my-app/widgets/UPDATE"
    'DELETE',   // myDuck.types.DELETE   = "my-app/widgets/DELETE"
  ]
}
```

### Defining the Constants

```js
export default new Duck({
  // ...
  consts: {
    statuses: ['NEW'], // myDuck.statuses = { NEW: "NEW" }
    fooBar: [
      'FOO',           // myDuck.fooBar.FOO = "FOO"
      'BAR'            // myDuck.fooBar.BAR = "BAR"
    ]
  }
}
```

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

export default combineReducers({ [userDuck.store]: userDuck.reducer })
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


## Creating Ducks with selectors

Selectors help in providing performance optimisations when used with libraries such as React-Redux, Preact-Redux etc.

```js
// Duck.js

import Duck, { constructLocalized } from 'extensible-duck'

export default new Duck({
  store: 'fruits',
  initialState: {
    items: [
      { name: 'apple', value: 1.2 },
      { name: 'orange', value: 0.95 }
    ]
  },
  reducer: (state, action, duck) => {
    switch(action.type) {
      // do reducer stuff
      default: return state
    }
  },
  selectors: constructLocalized({
    items: state => state.items, // gets the items from state
    subTotal: new Duck.Selector(selectors => state =>
      // Get another derived state reusing previous selector. In this case items selector
      // Can compose multiple such selectors if using library like reselect. Recommended!
      // Note: The order of the selectors definitions matters
      selectors
        .items(state)
        .reduce((computedTotal, item) => computedTotal + item.value, 0)
    )
  })
})
```

```js
// reducers.js

import { combineReducers } from 'redux'
import Duck from './Duck'

export default combineReducers({ [Duck.store]: Duck.reducer })
```

```js
// HomeView.js
import React from 'react'
import Duck from './Duck'

@connect(state => ({
  items: Duck.selectors.items(state),
  subTotal: Duck.selectors.subTotal(state)
}))
export default class HomeView extends React.Component {
  render(){
    // make use of sliced state here in props
    ...
  }
}
```