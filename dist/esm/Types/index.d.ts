export interface ClassType<T = any> {
    new (...args: any[]): T;
}
export declare type Optional<T> = T | null;
export declare type Dictionary<T> = {
    [key: string]: T;
};
