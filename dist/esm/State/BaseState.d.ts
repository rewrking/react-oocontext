import "reflect-metadata";
export declare type BaseStateOptions = {
    maxDeferCount?: number;
    deferTimeout?: number;
};
export declare abstract class BaseState {
    private _oocontext;
    constructor(options?: BaseStateOptions);
    reset: () => void;
    protected dispatchStoreState: () => void;
}
