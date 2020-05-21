/**
 * Represents some Type of the Object.
 */
export type EntityType<T> = { new(): T } | Function;
