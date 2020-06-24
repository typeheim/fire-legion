export class EntityNotSavedException extends Error {
    constructor(message: string) {super(message)}

    static withMessage(message: string) {
        return new EntityNotSavedException(message)
    }
}
