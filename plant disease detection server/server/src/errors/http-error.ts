/**
 * An error that carries the HTTP status to return and a message that is safe
 * to show to API clients. `message` is for logs only.
 */
export class HttpError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly publicMessage: string = message
    ) {
        super(message);
        this.name = "HttpError";
    }
}
