export enum ActionType {
	Bound,
	Reset,
}

export type ActionEvent<Payload = any, T = ActionType> = {
	type: T;
	payload?: Payload;
};
