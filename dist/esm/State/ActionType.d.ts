export declare enum ActionType {
    Bound = 0,
    Reset = 1
}
export declare type ActionEvent<Payload = any, T = ActionType> = {
    type: T;
    payload?: Payload;
};
