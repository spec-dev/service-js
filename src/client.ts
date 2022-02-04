import { SPEC_SERVICE_URL, DEFAULT_HEADERS } from './lib/constants'
import { Fetch, post } from './lib/fetch'
import { stripTrailingSlash } from './lib/helpers'
import type { ApiError } from './lib/types'

const DEFAULT_OPTIONS = {
    url: SPEC_SERVICE_URL,
    headers: DEFAULT_HEADERS,
}

export default class SpecServiceClient {
    id: string
    protected url: string
    protected headers: {
        [key: string]: string
    }
    protected fetch?: Fetch

    constructor(
        id: string,
        options: {
            url?: string
            headers?: { [key: string]: string }
            fetch?: Fetch
        }
    ) {
        const settings = { ...DEFAULT_OPTIONS, ...options }
        this.id = id
        this.url = `${stripTrailingSlash(settings.url)}/${id}`
        this.headers = settings.headers
        this.fetch = settings.fetch
    }

    async perform(...args: any[]): Promise<{ data: any | null; error: ApiError | null }> {
        try {
            const headers = { ...this.headers }
            const resp = await post(this.fetch, this.url, { args: args || [] }, { headers })
            const data = resp?.data
            const message = resp?.message

            if (!data && message) {
                const status = message.includes('violates row-level security') ? 403 : 500
                throw { message, status }
            }

            return { data, error: null }
        } catch (e) {
            return { data: null, error: e as ApiError }
        }
    }
}
