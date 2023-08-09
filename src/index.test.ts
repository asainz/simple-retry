import retry from '.'

describe('retry', () => {
    test('it calls the passed function', async () => {
        const fn = jest.fn(() => ({ value: 3 }))
        const response = await retry(fn)
        expect(response).toEqual({ value: 3 })
    })

    test('it throws an error if the function throws an error', async () => {
        const fn = jest.fn(() => {
            throw new Error('fake error')
        })

        try {
            await retry(fn)
        } catch (e) {
            expect(e).toEqual(new Error('fake error'))
        }
    })

    test('it retries the function if it throws an error a fixed number of times if the function keeps failing', async () => {
        const fn = jest.fn(() => {
            throw new Error('fake error')
        })

        try {
            await retry(fn, { retries: 1 })
        } catch (e) {
            expect(fn).toHaveBeenCalledTimes(2)
        }

        fn.mockClear()

        try {
            await retry(fn, { retries: 0 })
        } catch (e) {
            expect(fn).toHaveBeenCalledTimes(1)
        }
    })

    test('it retries the function if it throws an error until the function succeeds', async () => {
        const fn = jest.fn((currentAttempt) => {
            if (currentAttempt > 4) {
                throw new Error('fake error')
            }
            return { status: 'ok' }
        })

        const response = await retry(fn, { retries: 6 })
        expect(response).toEqual({ status: 'ok' })
        expect(fn).toHaveBeenCalledTimes(4)
    })

    test('it waits a fixed amount of time between retries', async () => {
        const fn = jest.fn(() => {
            throw new Error('fake error')
        })
        let start = 0
        let end = 0

        start = new Date().getTime()

        try {
            await retry(fn, { retries: 1, delay: 500 })
        } catch (e) {
            end = new Date().getTime()
            expect(end - start).toBeGreaterThanOrEqual(500)
            expect(fn).toHaveBeenCalledTimes(2)
        }

        fn.mockClear()

        start = new Date().getTime()
        try {
            await retry(fn, { retries: 1, delay: 0 })
        } catch (e) {
            end = new Date().getTime()
            expect(end - start).toBeLessThanOrEqual(10)
            expect(fn).toHaveBeenCalledTimes(2)
        }
    })
})
