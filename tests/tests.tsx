import * as React from 'react'

import createStoreContext from '../src/index'
import { mount } from 'enzyme';

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
        }), { context1 })

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
})