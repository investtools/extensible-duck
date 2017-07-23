function typeValue(namespace, store, type) {
  return `${namespace}/${store}/${type}`
}

function zipObject (keys, values) {
  if (arguments.length == 1) {
    values = keys[1];
    keys = keys[0];
  }
    
  var result = {};
  var i = 0;
  
  for (i; i < keys.length; i += 1) {
    result[keys[i]] = values[i];
  }
  
  return result;
};

function buildTypes(namespace, store, types) {
  return zipObject(
    types,
    types.map(type => typeValue(namespace, store, type))
  )
}

function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

function isFunction(func){
   return func !== null && typeof func === 'function';
}

function isUndefined(value){
   return typeof value === 'undefined' || value === undefined;
}

function isPlainObject(obj) {
    return isObject(obj) && (
        obj.constructor === Object  // obj = {}
        || obj.constructor === undefined // obj = Object.create(null)
    );
}

function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if(Array.isArray(target)) {
        if(Array.isArray(source)) {
            target.push(...source);
        } else {
            target.push(source);
        }
    } else if(isPlainObject(target)) {
        if(isPlainObject(source)) {
            for(let key of Object.keys(source)) {
                if(!target[key]) {
                    target[key] = source[key];
                } else {
                    mergeDeep(target[key], source[key]);
                }
            }
        } else {
            throw new Error(`Cannot merge object with non-object`);
        }
    } else {
        target = source;
    }

    return mergeDeep(target, ...sources);
};

function assignDefaults(options) {
  return {
    ...options,
    consts: options.consts || {},
    creators: options.creators || (() => ({})),
    selectors: options.selectors || {},
    types: options.types || [],
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
  const composedSelectors = {}
  Object.keys(selectors).forEach(key => {
    if (isFunction(selectors[key])) {
      if (isFunction(selectors[key](Duck.initialState || {}))) {
        // check if its deriving function, if yes then invoke with previous selectors
        composedSelectors[key] = selectors[key].call(null, composedSelectors)
      } else {
        // casual selector i.e. doesn't use other selectors to derive.
        composedSelectors[key] = selectors[key]
      }
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
      types,
      consts,
      initialState,
      creators,
      selectors,
    } = options
    this.options = options
    Object.keys(consts).forEach(name => {
      this[name] = zipObject(consts[name], consts[name])
    })

    this.types = buildTypes(namespace, store, types)
    this.initialState = isFunction(initialState)
      ? initialState(this)
      : initialState
    this.reducer = this.reducer.bind(this)
    this.creators = creators(this)
    this.selectors = deriveSelectors(selectors, this)
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
      creators: duck => {
        const parentCreators = parent.creators(duck)
        return { ...parentCreators, ...options.creators(duck, parentCreators) }
      },
      selectors: (() => {
        const parentSelectors = parent.selectors
        return {
          ...parentSelectors,
          ...options.selectors,
        }
      })(),
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
