(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Duck"] = factory();
	else
		root["Duck"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["constructLocalized"] = constructLocalized;
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "constructLocalised", function() { return constructLocalized; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Selector", function() { return Selector; });
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function typeValue(namespace, store, type) {
  return namespace + '/' + store + '/' + type;
}

function zipObject(keys, values) {
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
  return zipObject(types, types.map(function (type) {
    return typeValue(namespace, store, type);
  }));
}

function isObject(obj) {
  return obj !== null && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object';
}

function isFunction(func) {
  return func !== null && typeof func === 'function';
}

function isUndefined(value) {
  return typeof value === 'undefined' || value === undefined;
}

function isPlainObject(obj) {
  return isObject(obj) && (obj.constructor === Object // obj = {}
  || obj.constructor === undefined // obj = Object.create(null)
  );
}

function mergeDeep(target) {
  for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }

  if (!sources.length) return target;
  var source = sources.shift();

  if (Array.isArray(target)) {
    if (Array.isArray(source)) {
      var _target;

      (_target = target).push.apply(_target, _toConsumableArray(source));
    } else {
      target.push(source);
    }
  } else if (isPlainObject(target)) {
    if (isPlainObject(source)) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.keys(source)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;

          if (!target[key]) {
            target[key] = source[key];
          } else {
            mergeDeep(target[key], source[key]);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    } else {
      throw new Error('Cannot merge object with non-object');
    }
  } else {
    target = source;
  }

  return mergeDeep.apply(undefined, [target].concat(sources));
};

function assignDefaults(options) {
  return _extends({}, options, {
    consts: options.consts || {},
    creators: options.creators || function () {
      return {};
    },
    selectors: options.selectors || {},
    types: options.types || []
  });
}

function injectDuck(input, duck) {
  if (input instanceof Function) {
    return input(duck);
  } else {
    return input;
  }
}

function getLocalizedState(globalState, duck) {
  var localizedState = void 0;

  if (duck.storePath) {
    var segments = [].concat(duck.storePath.split('.'), duck.store);
    localizedState = segments.reduce(function getSegment(acc, segment) {
      if (!acc[segment]) {
        throw Error('state does not contain reducer at storePath ' + segments.join('.'));
      }
      return acc[segment];
    }, globalState);
  } else {
    localizedState = globalState[duck.store];
  }

  return localizedState;
}

function constructLocalized(selectors) {
  var derivedSelectors = deriveSelectors(selectors);
  return function (duck) {
    var localizedSelectors = {};
    Object.keys(derivedSelectors).forEach(function (key) {
      var selector = derivedSelectors[key];
      localizedSelectors[key] = function (globalState) {
        return selector(getLocalizedState(globalState, duck), globalState);
      };
    });
    return localizedSelectors;
  };
}

// An alias for those who do not use the above spelling.


/**
 * Helper utility to assist in composing the selectors.
 * Previously defined selectors can be used to derive future selectors.
 *
 * @param {object} selectors
 * @returns
 */
function deriveSelectors(selectors) {
  var composedSelectors = {};
  Object.keys(selectors).forEach(function (key) {
    var selector = selectors[key];
    if (selector instanceof Selector) {
      composedSelectors[key] = function () {
        return (composedSelectors[key] = selector.extractFunction(composedSelectors)).apply(undefined, arguments);
      };
    } else {
      composedSelectors[key] = selector;
    }
  });
  return composedSelectors;
}

var Duck = function () {
  function Duck(options) {
    var _this = this;

    _classCallCheck(this, Duck);

    options = assignDefaults(options);
    var _options = options,
        namespace = _options.namespace,
        store = _options.store,
        storePath = _options.storePath,
        types = _options.types,
        consts = _options.consts,
        initialState = _options.initialState,
        creators = _options.creators,
        selectors = _options.selectors;

    this.options = options;
    Object.keys(consts).forEach(function (name) {
      _this[name] = zipObject(consts[name], consts[name]);
    });

    this.store = store;
    this.storePath = storePath;
    this.types = buildTypes(namespace, store, types);
    this.initialState = isFunction(initialState) ? initialState(this) : initialState;
    this.reducer = this.reducer.bind(this);
    this.selectors = deriveSelectors(injectDuck(selectors, this));
    this.creators = creators(this);
  }

  _createClass(Duck, [{
    key: 'reducer',
    value: function reducer(state, action) {
      if (isUndefined(state)) {
        state = this.initialState;
      }
      return this.options.reducer(state, action, this);
    }
  }, {
    key: 'extend',
    value: function extend(options) {
      var _this2 = this;

      if (isFunction(options)) {
        options = options(this);
      }
      options = assignDefaults(options);
      var parent = this.options;
      var initialState = void 0;
      if (isFunction(options.initialState)) {
        initialState = function initialState(duck) {
          return options.initialState(duck, _this2.initialState);
        };
      } else if (isUndefined(options.initialState)) {
        initialState = parent.initialState;
      } else {
        initialState = options.initialState;
      }
      return new Duck(_extends({}, parent, options, {
        initialState: initialState,
        consts: mergeDeep({}, parent.consts, options.consts),
        creators: function creators(duck) {
          var parentCreators = parent.creators(duck);
          return _extends({}, parentCreators, options.creators(duck, parentCreators));
        },
        selectors: function selectors(duck) {
          return _extends({}, injectDuck(parent.selectors, duck), injectDuck(options.selectors, duck));
        },
        types: [].concat(_toConsumableArray(parent.types), _toConsumableArray(options.types)),
        reducer: function reducer(state, action, duck) {
          state = parent.reducer(state, action, duck);
          if (isUndefined(options.reducer)) {
            return state;
          } else {
            return options.reducer(state, action, duck);
          }
        }
      }));
    }
  }]);

  return Duck;
}();

/* harmony default export */ __webpack_exports__["default"] = (Duck);


var Selector = function () {
  function Selector(func) {
    _classCallCheck(this, Selector);

    this.func = func;
  }

  _createClass(Selector, [{
    key: 'extractFunction',
    value: function extractFunction(selectors) {
      return this.func(selectors);
    }
  }]);

  return Selector;
}();

Duck.Selector = Selector;

/***/ })
/******/ ]);
});
//# sourceMappingURL=extensible-duck.js.map