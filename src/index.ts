type Func = (...args: any) => any

interface Options {
    retries?: number
    delay?: number
}

type Retry = <T extends Func>(
    fn: T,
    opts: Options
) => Promise<Awaited<ReturnType<T>>>

const retry: Retry = async (fn, opts) => {
    const { retries = 3, delay = 0 } = opts
    try {
        return await fn()
    } catch (error) {
        if (retries <= 1) {
            throw error
        }
        if (delay) {
            await new Promise((resolve) => setTimeout(resolve, delay))
        }
        return await retry(fn, { ...opts, retries: retries - 1 })
    }
}
export default retry
