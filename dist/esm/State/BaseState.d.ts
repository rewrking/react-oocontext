import "reflect-metadata";
export declare abstract class BaseState {
    private dispatch;
    private deferred;
    private deferCount;
    private isDeferring;
    reset: () => void;
    private dispatchDeferredState;
    private dispatchStateInternal;
    protected dispatchStoreState: () => void;
}
declare type BabelPropertyDescriptor<T> = TypedPropertyDescriptor<T> & {
    initializer?: Function;
};
export declare function Action<T>(target: any, key: string, descriptor?: BabelPropertyDescriptor<T>): any;
export {};
