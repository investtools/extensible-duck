import _ from 'lodash'

function typeValue(namespace, store, type) {
  return `${namespace}/${store}/${type}`
}

function buildTypes(namespace, store, types) {
  return _.zipObject(
    types,
    _.map(types, type => typeValue(namespace, store, type))
  )
}

function assignDefaults(options) {
  return {
    ...options,
    creators: options.creators || (() => ({})),
    selectors: options.selectors || {},
    types: options.types || []
  }
}

/**
 * Helper utility to assist in composing the selectors.
 * Previously defined selectors can be used to derive future selectors.
 * 
 * @param {object} selectors 
 * @param {class} Duck 
 * @returns 
 */
function deriveSelectors(selectors, Duck) {
  const interceptedSelectors = {}
  Object.keys(selectors).forEach(key => {
    if (typeof selectors[key] === 'function') {
      if (typeof selectors[key](Duck.initialState || {}) === 'function') {
        // check if its deriving function, if yes then invoke with previous selectors
        interceptedSelectors[key] = selectors[key].call(null, selectors)
      } else {
        // casual selector i.e. doesn't use other selectors to derive.
        interceptedSelectors[key] = selectors[key]
      }
    }
  })
  return interceptedSelectors
}

export default class Duck {
  constructor(options) {
    options = assignDefaults(options)
    const {
      namespace,
      store,
      types,
      consts,
      initialState,
      creators,
      selectors
    } = options
    this.options = options
    _.each(consts, (values, name) => {
      this[name] = _.zipObject(values, values)
    })
    this.types = buildTypes(namespace, store, types)
    this.initialState = _.isFunction(initialState)
      ? initialState(this)
      : initialState
    this.reducer = this.reducer.bind(this)
    this.creators = creators(this)
    this.selectors = deriveSelectors(selectors, this)
  }
  reducer(state, action) {
    if (_.isUndefined(state)) {
      state = this.initialState
    }
    return this.options.reducer(state, action, this)
  }
  extend(options) {
    if (_.isFunction(options)) {
      options = options(this)
    }
    options = assignDefaults(options)
    const parent = this.options
    let initialState
    if (_.isFunction(options.initialState)) {
      initialState = duck => options.initialState(duck, this.initialState)
    } else if (_.isUndefined(options.initialState)) {
      initialState = parent.initialState
    } else {
      initialState = options.initialState
    }
    return new Duck({
      ...parent,
      ...options,
      initialState,
      consts: _.mergeWith({}, parent.consts, options.consts, (a, b) => [
        ...(a || []),
        ...(b || [])
      ]),
      creators: duck => {
        const parentCreators = parent.creators(duck)
        return { ...parentCreators, ...options.creators(duck, parentCreators) }
      },
      selectors: (() => {
        const parentSelectors = parent.selectors
        return {
          ...parentSelectors,
          ...options.selectors
        }
      })(),
      types: [...parent.types, ...options.types],
      reducer: (state, action, duck) => {
        state = parent.reducer(state, action, duck)
        if (_.isUndefined(options.reducer)) {
          return state
        } else {
          return options.reducer(state, action, duck)
        }
      }
    })
  }
}
