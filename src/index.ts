type Func = (...args: any) => any

interface Options {
    retries?: number
    delay?: number
}

type Retry = <T extends Func>(
    fn: T,
    opts?: Options
) => Promise<Awaited<ReturnType<T>>>

const retry: Retry = async (fn, opts = {}) => {
    const retries = opts?.retries ?? 1
    const delay = opts?.delay ?? 0
    try {
        return await fn(retries + 1)
    } catch (error) {
        if (retries < 1) {
            throw error
        }
        if (delay) {
            await new Promise((resolve) => setTimeout(resolve, delay))
        }
        return await retry(fn, { ...opts, retries: retries - 1 })
    }
}
export default retry
