import { Metadata } from '../singletons'
import { InvalidOptionsException } from '../Exceptions/InvalidOptionsException'

export function Repository(entity): ClassDecorator {
    return (target: any): void => {
        if (!entity) {
            throw InvalidOptionsException.withMessage('Entity must be specified at @Repository decorator')
        }

        Metadata.entity(entity).setRepository(target)
    }
}

