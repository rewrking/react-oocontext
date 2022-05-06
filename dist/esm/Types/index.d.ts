/**
 * A class type interface used for instantiating classes
 * by generics
 */
export interface ClassType<T = any> {
    new (...args: any[]): T;
}
/**
 * A simple optional type
 */
export declare type Optional<T> = T | null;
/**
 * A no-frills dictionary type
 */
export declare type Dictionary<T> = {
    [key: string]: T;
};
