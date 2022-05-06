declare type BabelPropertyDescriptor<T> = TypedPropertyDescriptor<T> & {
    initializer?: Function;
};
declare function Action<T>(target: any, key: string, descriptor?: BabelPropertyDescriptor<T>): any;
export { Action };
