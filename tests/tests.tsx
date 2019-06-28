import * as React from 'react'

import createStoreContext from '../src/index'
import { mount } from 'enzyme'
import { Middleware } from '../src/types';
import { createMiddleware } from '../src/middleware';

describe('Test function types', () => {
    const verify = jest.fn()

    beforeEach(() => {
        verify.mockClear()
        const context = null
    })

    it('return is tuple of React.Context and React.FC (provider)', () => {
        const result = createStoreContext('empty state')
        expect(result.length).toBe(2)
    })

    it('can create store with no actions', () => {
        const state = { foo: '123' }
        const [context, provider] = createStoreContext(state, undefined)

        const Consumer: React.FC = props => {
            const store = React.useContext(context)

            expect(store).toEqual(state)
            verify()

            return <div />
        }

        mount(<Consumer />)

        expect(verify.mock.calls.length).toBe(1)
    })

    it('can create action with no arguments', () => {
        const [context, provider] = createStoreContext({ foo: '123' }, () => ({
            action: () => { }
        }))

        const Consumer: React.FC = props => {
            const store = React.useContext(context)

            expect(store).toHaveProperty('action')
            verify()

            return <div />
        }

        mount(<Consumer />)

        expect(verify.mock.calls.length).toBe(1)
    })

    it('can create action with no return value', () => {
        const [context, Provider] = createStoreContext('empty state', () => ({
            action: () => { }
        }))

        const Consumer: React.FC = props => {
            const store = React.useContext(context)

            expect(store.action()).toBe(undefined)
            verify()

            return <div />
        }

        mount(<Provider><Consumer /></Provider>)

        expect(verify.mock.calls.length).toBe(1)
    })

    it('setState inside action throws an error if no provider is initialized', () => {
        const [context, Provider] = createStoreContext({ foo: 'string' }, ({ setState }) => ({
            action: () => { setState({ foo: 'new' }) }
        }))

        const Consumer: React.FC = props => {
            const store = React.useContext(context)

            expect(store.action).toThrow()
            verify()

            return <div />
        }

        mount(<Consumer />)
        expect(verify.mock.calls.length).toBe(1)
    })

    it('can create action with context reference', () => {
        const [context, Provider] = createStoreContext('empty state', (reference) => ({
            action: () => {
                expect(reference).toHaveProperty('setState')
                expect(reference).toHaveProperty('state')
                verify()
            }
        }))

        const Consumer: React.FC = props => {
            const store = React.useContext(context)
            const result = store.action()

            expect(store).toHaveProperty('action')
            verify()

            return <div />
        }

        mount(<Provider><Consumer /></Provider>)
        expect(verify.mock.calls.length).toBe(2)
    })

    it('can deconstruct reference in action creator', () => {
        const [context, Provider] = createStoreContext({ foo: '1234' }, ({ setState, state }) => ({
            action1: () => {
                expect(setState).toBeInstanceOf(Function)
                verify()
            },
            action2: () => {
                expect(state).toBeInstanceOf(Object)
                verify()
            },
        }))

        const Consumer: React.FC = props => {
            const store = React.useContext(context)
            store.action1()
            store.action2()
            return <div />
        }

        mount(<Provider><Consumer /></Provider>)
        expect(verify.mock.calls.length).toBe(2)
    })

    it('can provide arguments to action', () => {
        const [context, Provider] = createStoreContext({ foo: '' }, () => ({
            action1: (numberArg: number) => {
                expect(typeof numberArg).toBe('number')
                verify()
            },
            action2: (stringArg: string, numberArg: number, booleanArg: boolean) => {
                expect(typeof stringArg).toBe('string')
                expect(typeof numberArg).toBe('number')
                expect(typeof booleanArg).toBe('boolean')
                verify()
            },
        }))

        const Consumer: React.FC = props => {
            const store = React.useContext(context)
            store.action1(123)
            store.action2('123', 456, true)
            return <div />
        }

        mount(<Provider><Consumer /></Provider>)
        expect(verify.mock.calls.length).toBe(2)
    })

    it('can return value from action', () => {
        const [context, Provider] = createStoreContext({ foo: '' }, () => ({
            actionNumber: () => {
                return 123
            },
            actionString: () => {
                return '123'
            }
        }))

        const Consumer: React.FC = props => {
            const store = React.useContext(context)
            expect(typeof store.actionNumber()).toBe('number')
            expect(typeof store.actionString()).toBe('string')

            verify()
            return <div />
        }

        mount(<Provider><Consumer /></Provider>)
        expect(verify.mock.calls.length).toBe(1)
    })

    it('can provide just state type', () => {
        type State = {
            foo: string
        }

        const [context, Provider] = createStoreContext<State>({ foo: '' })
    })

    it('can provide store meta info', () => {
        const [context, Provider] = createStoreContext('empty state', ({ meta }) => ({
            action: () => meta.testValue
        }), {
                meta: {
                    testValue: 42
                }
            })

        const Consumer: React.FC = props => {
            const store = React.useContext(context)

            expect(store.action()).toBe(42)
            verify()

            return <div />
        }

        mount(<Provider><Consumer /></Provider>)

        expect(verify.mock.calls.length).toBe(1)
    })
})

describe('Logic', () => {
    const verify = jest.fn()

    beforeEach(() => {
        verify.mockClear()
        const context = null
    })

    it('can provide arguments to action', () => {
        const [context, Provider] = createStoreContext({ foo: '' }, () => ({
            action: (stringArg: string, numberArg: number, booleanArg: boolean) => {
                expect(stringArg).toBe('123')
                expect(numberArg).toBe(456)
                expect(booleanArg).toBe(true)
                verify()
            },
        }))

        const Consumer: React.FC = props => {
            const store = React.useContext(context)
            store.action('123', 456, true)
            return <div />
        }

        mount(<Provider><Consumer /></Provider>)
        expect(verify.mock.calls.length).toBe(1)
    })

    it('can modify state from action', () => {
        const [context, Provider] = createStoreContext({ foo: 'before' }, ({ setState }) => ({
            action: () => setState(prev => {
                if (prev.foo === 'before')
                    return { foo: 'after' }

                return prev
            }),
        }))

        const Consumer: React.FC = props => {
            const store = React.useContext(context)
            store.action()

            verify(store.foo)

            return <div />
        }

        mount(<Provider><Consumer /></Provider>)
        expect(verify.mock.calls.length).toBe(2)
        expect(verify.mock.calls[0][0]).toBe('before')
        expect(verify.mock.calls[1][0]).toBe('after')
    })

    it('can call other context from action', () => {
        const [context1, Provider1] = createStoreContext({ state1: 'before' }, () => ({
            action1: () => {
                return 'value-from-action1'
            },
        }))

        const [context2, Provider2] = createStoreContext({ state2: 'before' }, ({ stores }) => ({
            action2() {
                return stores.context1.action1()
            },
        }), { contexts: { context1 } })

        const Consumer: React.FC = props => {
            const store1 = React.useContext(context1)
            const store2 = React.useContext(context2)

            const result = store2.action2()

            //expect(store1.state1).toBe('after')
            expect(result).toBe('value-from-action1')

            verify()

            return <div />
        }

        mount(<Provider1>
            <Provider2>
                <Consumer />
            </Provider2>
        </Provider1>)
        expect(verify.mock.calls.length).toBe(1)
    })

    it('can call self actions from action', () => {
        const [context, Provider] = createStoreContext({ state1: 'before' }, () => ({
            action1() {
                return 'value-from-action1'
            },
            action2() {
                return this.action1()
            }
        }))

        const Consumer: React.FC = props => {
            const store = React.useContext(context)

            const result = store.action2()
            expect(result).toBe('value-from-action1')

            verify()

            return <div />
        }

        mount(<Provider>
            <Consumer />
        </Provider>)
        expect(verify.mock.calls.length).toBe(1)
    })

    it('self actions called from aother actions can modify state', () => {
        const [context, Provider] = createStoreContext({ state1: 'before' }, ({ setState }) => ({
            action1() {
                setState(prev => {
                    if (prev.state1 === 'before')
                        return { state1: 'after' }

                    return prev
                })
            },
            action2() {
                return this.action1()
            }
        }))

        const Consumer: React.FC = props => {
            const store = React.useContext(context)

            store.action2()

            verify(store.state1)

            return <div />
        }

        mount(<Provider>
            <Consumer />
        </Provider>)
        expect(verify.mock.calls.length).toBe(2)
        expect(verify.mock.calls[0][0]).toBe('before')
        expect(verify.mock.calls[1][0]).toBe('after')
    })
})

describe('Middleware', () => {
    const verify = jest.fn()

    const testMiddleware1: Middleware = (next, args, meta) => {
        verify(meta.actionName, args)
        next(args)
    }

    const testMiddleware2: Middleware = (next, args) => {
        verify('middleware2')
        next(args)
    }

    const [middlewareContext, MiddlewareContextProvider] = createStoreContext({ lastCalledAction: '' }, ({ setState }) => ({
        setCalled: (action: string) => setState(prev => {
            if (prev.lastCalledAction !== action)
                return { lastCalledAction: action }

            return prev
        })
    }))

    const middlewareCreator = createMiddleware((next, args, { stores, actionName }) => {
        stores.middlewareStore.setCalled(actionName)
        console.log('creat')
        next(args)
    }, { middlewareStore: middlewareContext })

    beforeEach(() => {
        verify.mockClear()
    })

    it('can provide middleware to creator', () => {
        const [context, Provider] = createStoreContext({ foo: '' }, () => ({
            actionName: (number: number, boolean: boolean) => {
                console.log('fun')
                verify('fun called', number, boolean)
            },
        }), {
                middleware: [testMiddleware1]
            })

        const Consumer: React.FC = props => {
            const store = React.useContext(context)
            store.actionName(42, true)
            return <div />
        }

        mount(<Provider><Consumer /></Provider>)
        expect(verify.mock.calls.length).toBe(2)
        // middleware
        expect(verify.mock.calls[0][0]).toBe('actionName')
        expect(verify.mock.calls[0][1]).toEqual([42, true])
        // action
        expect(verify.mock.calls[1][0]).toBe('fun called')
        expect(verify.mock.calls[1][1]).toBe(42)
        expect(verify.mock.calls[1][2]).toBe(true)
    })

    it('can provide middleware creator', () => {
        const [context, Provider] = createStoreContext({ foo: '' }, () => ({
            actionName: (number: number, boolean: boolean) => {
                // verify('fun called', number, boolean)
            },
        }), {
                middleware: [middlewareCreator]
            })

        const Consumer: React.FC = props => {
            const store = React.useContext(context)
            store.actionName(42, true)
            return <div />
        }

        const MiddlewareStoreVerifyer: React.FC = props => {
            const store = React.useContext(middlewareContext)
            verify(store.lastCalledAction)
            return <div />
        }

        mount(<MiddlewareContextProvider>
            <Provider><Consumer /></Provider>
            <MiddlewareStoreVerifyer />
        </MiddlewareContextProvider>)
        expect(verify.mock.calls.length).toBe(2)
        expect(verify.mock.calls[0][0]).toBe('')
        expect(verify.mock.calls[1][0]).toBe('actionName')
    })

    it('can provide multiple middlewares to creator', () => {
        const [context, Provider] = createStoreContext({ foo: '' }, () => ({
            actionName: (number: number, boolean: boolean) => {
                verify('fun called', number, boolean)
            },
        }), {
                middleware: [testMiddleware1, testMiddleware2]
            })

        const Consumer: React.FC = props => {
            const store = React.useContext(context)
            store.actionName(42, true)
            return <div />
        }

        mount(<Provider><Consumer /></Provider>)
        expect(verify.mock.calls.length).toBe(3)
        // middleware
        expect(verify.mock.calls[0][0]).toBe('actionName')
        expect(verify.mock.calls[0][1]).toEqual([42, true])
        expect(verify.mock.calls[1][0]).toBe('middleware2')
        // action
        expect(verify.mock.calls[2][0]).toBe('fun called')
        expect(verify.mock.calls[2][1]).toBe(42)
        expect(verify.mock.calls[2][2]).toBe(true)
    })

    it('can provide store meta to middleware', () => {
        const testMiddleware: Middleware = (next, args, meta) => {
            verify(meta.comingFromStore)
            next(args)
        }

        const [context, Provider] = createStoreContext({ foo: '' }, () => ({
            action: () => {

            },
        }), {
                middleware: [testMiddleware],
                meta: { comingFromStore: true }
            })

        const Consumer: React.FC = props => {
            const store = React.useContext(context)
            store.action()
            return <div />
        }

        mount(<Provider><Consumer /></Provider>)
        expect(verify.mock.calls.length).toBe(1)
        expect(verify.mock.calls[0][0]).toBe(true)

    })
})