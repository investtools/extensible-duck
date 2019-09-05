function typeValue(namespace, store, type) {
  return `${namespace}/${store}/${type}`
}

function zipObject(keys, values) {
  if (arguments.length == 1) {
    values = keys[1]
    keys = keys[0]
  }

  var result = {}
  var i = 0

  for (i; i < keys.length; i += 1) {
    result[keys[i]] = values[i]
  }

  return result
}

function buildTypes(namespace, store, types) {
  return zipObject(types, types.map(type => typeValue(namespace, store, type)))
}

function isObject(obj) {
  return obj !== null && typeof obj === 'object'
}

function isFunction(func) {
  return func !== null && typeof func === 'function'
}

function isUndefined(value) {
  return typeof value === 'undefined' || value === undefined
}

function isPlainObject(obj) {
  return (
    isObject(obj) &&
    (obj.constructor === Object || // obj = {}
      obj.constructor === undefined) // obj = Object.create(null)
  )
}

function mergeDeep(target, ...sources) {
  if (!sources.length) return target
  const source = sources.shift()

  if (Array.isArray(target)) {
    if (Array.isArray(source)) {
      target.push(...source)
    } else {
      target.push(source)
    }
  } else if (isPlainObject(target)) {
    if (isPlainObject(source)) {
      for (let key of Object.keys(source)) {
        if (!target[key]) {
          target[key] = source[key]
        } else {
          mergeDeep(target[key], source[key])
        }
      }
    } else {
      throw new Error(`Cannot merge object with non-object`)
    }
  } else {
    target = source
  }

  return mergeDeep(target, ...sources)
}

function assignDefaults(options) {
  return {
    ...options,
    consts: options.consts || {},
    sagas: options.sagas || (() => ({})),
    takes: options.takes || (() => []),
    creators: options.creators || (() => ({})),
    selectors: options.selectors || {},
    types: options.types || [],
  }
}

function injectDuck(input, duck) {
  if (input instanceof Function) {
    return input(duck)
  } else {
    return input
  }
}

function getLocalizedState(globalState, duck) {
  let localizedState

  if (duck.storePath) {
    const segments = [].concat(duck.storePath.split('.'), duck.store)
    localizedState = segments.reduce(function getSegment(acc, segment) {
      if (!acc[segment]) {
        throw Error(
          `state does not contain reducer at storePath ${segments.join('.')}`
        )
      }
      return acc[segment]
    }, globalState)
  } else {
    localizedState = globalState[duck.store]
  }

  return localizedState
}

export function constructLocalized(selectors) {
  const derivedSelectors = deriveSelectors(selectors)
  return duck => {
    const localizedSelectors = {}
    Object.keys(derivedSelectors).forEach(key => {
      const selector = derivedSelectors[key]
      localizedSelectors[key] = globalState =>
        selector(getLocalizedState(globalState, duck), globalState)
    })
    return localizedSelectors
  }
}

// An alias for those who do not use the above spelling.
export { constructLocalized as constructLocalised }

/**
 * Helper utility to assist in composing the selectors.
 * Previously defined selectors can be used to derive future selectors.
 *
 * @param {object} selectors
 * @returns
 */
function deriveSelectors(selectors) {
  const composedSelectors = {}
  Object.keys(selectors).forEach(key => {
    const selector = selectors[key]
    if (selector instanceof Selector) {
      composedSelectors[key] = (...args) =>
        (composedSelectors[key] = selector.extractFunction(composedSelectors))(
          ...args
        )
    } else {
      composedSelectors[key] = selector
    }
  })
  return composedSelectors
}

export default class Duck {
  constructor(options) {
    options = assignDefaults(options)
    const {
      namespace,
      store,
      storePath,
      types,
      consts,
      initialState,
      creators,
      selectors,
      sagas,
      takes,
    } = options
    this.options = options
    Object.keys(consts).forEach(name => {
      this[name] = zipObject(consts[name], consts[name])
    })

    this.store = store
    this.storePath = storePath
    this.types = buildTypes(namespace, store, types)
    this.initialState = isFunction(initialState)
      ? initialState(this)
      : initialState
    this.reducer = this.reducer.bind(this)
    this.selectors = deriveSelectors(injectDuck(selectors, this))
    this.creators = creators(this)
    this.sagas = sagas(this)
    this.takes = takes(this)
  }
  reducer(state, action) {
    if (isUndefined(state)) {
      state = this.initialState
    }
    return this.options.reducer(state, action, this)
  }
  extend(options) {
    if (isFunction(options)) {
      options = options(this)
    }
    options = assignDefaults(options)
    const parent = this.options
    let initialState
    if (isFunction(options.initialState)) {
      initialState = duck => options.initialState(duck, this.initialState)
    } else if (isUndefined(options.initialState)) {
      initialState = parent.initialState
    } else {
      initialState = options.initialState
    }
    return new Duck({
      ...parent,
      ...options,
      initialState,
      consts: mergeDeep({}, parent.consts, options.consts),
      sagas: duck => {
        const parentSagas = parent.sagas(duck)
        return { ...parentSagas, ...options.sagas(duck, parentSagas) }
      },
      takes: duck => {
        const parentTakes = parent.takes(duck)
        return [...parentTakes, ...options.takes(duck, parentTakes)]
      },
      creators: duck => {
        const parentCreators = parent.creators(duck)
        return { ...parentCreators, ...options.creators(duck, parentCreators) }
      },
      selectors: duck => ({
        ...injectDuck(parent.selectors, duck),
        ...injectDuck(options.selectors, duck),
      }),
      types: [...parent.types, ...options.types],
      reducer: (state, action, duck) => {
        state = parent.reducer(state, action, duck)
        if (isUndefined(options.reducer)) {
          return state
        } else {
          return options.reducer(state, action, duck)
        }
      },
    })
  }
}

export class Selector {
  constructor(func) {
    this.func = func
  }

  extractFunction(selectors) {
    return this.func(selectors)
  }
}

Duck.Selector = Selector
