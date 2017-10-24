import Duck from '../../src/extensible-duck'
import _ from 'lodash'

describe('Duck', () => {
  describe('constructor', () => {
    it('transforms types in object with prefix', () => {
      expect(
        new Duck({
          namespace: 'app',
          store: 'users',
          types: ['FETCH'],
        }).types
      ).to.eql({ FETCH: 'app/users/FETCH' })
    })
    it('lets the creators reference the duck instance', () => {
      const duck = new Duck({
        types: ['FETCH'],
        creators: ({ types }) => ({
          get: id => ({ type: types.FETCH, id }),
        }),
      })
      expect(duck.creators.get(15)).to.eql({
        type: duck.types.FETCH,
        id: 15,
      })
    })
    it('lets the selectors compose themselves and reference the duck instance', () => {
      const duck = new Duck({
        initialState: {
          items: [
            { name: 'apple', value: 1.2 },
            { name: 'orange', value: 0.95 },
          ],
        },
        selectors: {
          items: state => state.items, // gets the items from complete state
          subTotal: new Duck.Selector(selectors => state =>
            // Get another derived state reusing previous items selector.
            // Can be composed multiple such states if using library like reselect.
            selectors
              .items(state)
              .reduce((computedTotal, item) => computedTotal + item.value, 0)
        )},
      })
      expect(duck.selectors.items(duck.initialState)).to.eql([
        { name: 'apple', value: 1.2 },
        { name: 'orange', value: 0.95 },
      ])
      expect(duck.selectors.subTotal(duck.initialState)).to.eql(2.15)
    })
    it('generates the selector function once per selector', () => {
      let passes = 0
      const duck = new Duck({
        selectors: {
          myFunc: new Duck.Selector(selectors => {
            passes++
            return () => {}
          })},
      })
      duck.selectors.myFunc()
      duck.selectors.myFunc()
      expect(passes).to.eql(1)
    })
    it('lets the initialState reference the duck instance', () => {
      const duck = new Duck({
        consts: { statuses: ['NEW'] },
        initialState: ({ statuses }) => ({ status: statuses.NEW }),
      })
      expect(duck.initialState).to.eql({ status: 'NEW' })
    })
    it('accepts the initialState as an object', () => {
      const duck = new Duck({
        initialState: { obj: {} },
      })
      expect(duck.initialState).to.eql({ obj: {} })
    })
    it('creates the constant objects', () => {
      const duck = new Duck({
        consts: { statuses: ['READY', 'ERROR'] },
      })
      expect(duck.statuses).to.eql({ READY: 'READY', ERROR: 'ERROR' })
    })
    it('lets the creators access the selectors', () => {
      const duck = new Duck({
        selectors: {
          sum: numbers => numbers.reduce((sum, n) => sum + n, 0)
        },
        creators: ({ selectors }) => ({
          calculate: () => dispatch => {
            dispatch({ type: 'CALCULATE', payload: selectors.sum([ 1, 2, 3 ]) })
          }
        })
      })
      const dispatch = sinon.spy()
      duck.creators.calculate()(dispatch)
      expect(dispatch).to.have.been.calledWith({ type: 'CALCULATE', payload: 6 })
    })
  })
  describe('reducer', () => {
    it('lets the original reducer reference the duck instance', () => {
      const duck = new Duck({
        types: ['FETCH'],
        reducer: (state, action, { types }) => {
          switch (action.type) {
            case types.FETCH:
              return { worked: true }
            default:
              return state
          }
        },
      })
      expect(duck.reducer({}, { type: duck.types.FETCH })).to.eql({
        worked: true,
      })
    })
    it('passes the initialState to the original reducer when state is undefined', () => {
      const duck = new Duck({
        initialState: { obj: {} },
        reducer: (state, action) => {
          return state
        },
      })
      expect(duck.reducer(undefined, { type: duck.types.FETCH })).to.eql({
        obj: {},
      })
    })
  })
  describe('extend', () => {
    it('creates a new Duck', () => {
      expect(new Duck({}).extend({}).constructor.name).to.eql('Duck')
    })
    it('copies the attributes to the new Duck', () => {
      const duck = new Duck({ initialState: { obj: null } })
      expect(duck.extend({}).initialState).to.eql({ obj: null })
    })
    it('copies the original consts', () => {
      const duck = new Duck({ consts: { statuses: ['NEW'] } })
      expect(duck.extend({}).statuses).to.eql({ NEW: 'NEW' })
    })
    it('overrides the types', () => {
      const duck = new Duck({
        namespace: 'ns',
        store: 'x',
        types: ['FETCH'],
      })
      expect(duck.extend({ namespace: 'ns2', store: 'y' }).types).to.eql({
        FETCH: 'ns2/y/FETCH',
      })
    })
    it('merges the consts', () => {
      const duck = new Duck({ consts: { statuses: ['READY'] } })
      expect(
        duck.extend({ consts: { statuses: ['FAILED'] } }).statuses
      ).to.eql({
        READY: 'READY',
        FAILED: 'FAILED',
      })
    })
    it('appends new types', () => {
      expect(
        new Duck({}).extend({
          namespace: 'ns2',
          store: 'y',
          types: ['RESET'],
        }).types
      ).to.eql({ RESET: 'ns2/y/RESET' })
    })
    it('appends the new reducers', () => {
      const duck = new Duck({
        creators: () => ({
          get: () => ({ type: 'GET' }),
        }),
      })
      const childDuck = duck.extend({
        creators: () => ({
          delete: () => ({ type: 'DELETE' }),
        }),
      })
      expect(_.keys(childDuck.creators)).to.eql(['get', 'delete'])
    })
    it('lets the reducers access the parents', () => {
      const d1 = new Duck({
        creators: () => ({
          get: () => ({ d1: true }),
        }),
      })
      const d2 = d1.extend({
        creators: (duck, parent) => ({
          get: () => ({ ...parent.get(duck), d2: true }),
        }),
      })
      const d3 = d2.extend({
        creators: (duck, parent) => ({
          get: () => ({ ...parent.get(duck), d3: true }),
        }),
      })
      expect(d3.creators.get()).to.eql({ d1: true, d2: true, d3: true })
    })
    context('when a function is passed', () => {
      it('passes the duck instance as argument', () => {
        const duck = new Duck({ foo: 2 })
        const childDuck = duck.extend(parent => ({
          bar: parent.options.foo * 2,
        }))
        expect(childDuck.options.bar).to.eql(4)
      })
    })
    it('updates the old creators with the new properties', () => {
      const duck = new Duck({
        namespace: 'a',
        store: 'x',
        types: ['GET'],
        creators: ({ types }) => ({
          get: () => ({ type: types.GET }),
        }),
      })
      const childDuck = duck.extend({ namespace: 'b', store: 'y' })
      expect(childDuck.creators.get()).to.eql({ type: 'b/y/GET' })
    })
    it('updates the old selectors with the new properties', () => {
      const duck = new Duck({
        namespace: 'a',
        store: 'x',
        initialState: {
          items: [
            { name: 'apple', value: 1.2 },
            { name: 'orange', value: 0.95 },
          ],
        },
        selectors: {
          items: state => state.items, // gets the items from complete state
        },
      })
      const childDuck = duck.extend({
        namespace: 'b',
        store: 'y',
        selectors: {
          subTotal: new Duck.Selector(selectors => state =>
            // Get another derived state reusing previous items selector.
            // Can be composed multiple such states if using library like reselect.
            selectors
              .items(state)
              .reduce((computedTotal, item) => computedTotal + item.value, 0)
          ),
        },
      })
      expect(childDuck.selectors.items(duck.initialState)).to.eql([
        { name: 'apple', value: 1.2 },
        { name: 'orange', value: 0.95 },
      ])
      expect(childDuck.selectors.subTotal(duck.initialState)).to.eql(2.15)
    })
    it('adds the new reducer keeping the old ones', () => {
      const parentDuck = new Duck({
        reducer: (state, action) => {
          switch (action.type) {
            case 'FETCH':
              return { ...state, parentDuck: true }
            default:
              return state
          }
        },
      })
      const duck = parentDuck.extend({
        reducer: (state, action) => {
          switch (action.type) {
            case 'FETCH':
              return { ...state, duck: true }
            default:
              return state
          }
        },
      })
      expect(duck.reducer({}, { type: 'FETCH' })).to.eql({
        parentDuck: true,
        duck: true,
      })
    })
    it('does not affect the original duck', () => {
      const parentDuck = new Duck({
        reducer: (state, action) => {
          switch (action.type) {
            case 'FETCH':
              return { ...state, parentDuck: true }
            default:
              return state
          }
        },
      })
      const duck = parentDuck.extend({
        reducer: (state, action) => {
          switch (action.type) {
            case 'FETCH':
              return { ...state, duck: true }
            default:
              return state
          }
        },
      })
      expect(parentDuck.reducer({}, { type: 'FETCH' })).to.eql({
        parentDuck: true,
      })
    })
    it('passes the parent initialState to the child', () => {
      const parentDuck = new Duck({ initialState: { parent: true } })
      const duck = parentDuck.extend({
        initialState: (duck, parentState) => {
          return { ...parentState, child: true }
        },
      })
      expect(duck.initialState).to.eql({ parent: true, child: true })
    })
  })
})
