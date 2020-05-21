export class InvalidOptionsException extends Error {
    constructor(message: string) {super(message)}

    static withMessage(message: string) {
        return new InvalidOptionsException(message)
    }
}
