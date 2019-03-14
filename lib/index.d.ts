import { SetStateAction, Dispatch } from "react";
export declare type SetStateFunction<S = any> = Dispatch<SetStateAction<S>>;
export declare type AsyncState<T> = {
    loading: boolean;
    error?: object | string;
    data: T;
};
declare type AsyncAction<S> = <T extends keyof S, B>(key: T, promise: Promise<B>, throwError?: boolean) => S[T] extends AsyncState<B> | AsyncState<B | null> | AsyncState<B | undefined> ? Promise<S> : void;
declare type ReducerUtils<S> = {
    setState: SetStateFunction<S>;
    asyncAction: AsyncAction<S>;
};
export declare type Store<S, A> = {
    state: S;
    actions: A;
    setState: SetStateFunction<S>;
};
declare function asyncState<T>(): AsyncState<T | undefined>;
declare function asyncState<T>(data: T): AsyncState<T>;
export declare type ReducerFunction<S, P> = {
    [key: string]: (state: S, payload: P, utils: ReducerUtils<S>) => Promise<S> | S;
};
declare type ExtractPayload<S, T> = T extends (state: S, payload: infer P) => S ? P : never;
declare function createStore<S, R>(initialState: S, reducers: R & ReducerFunction<S, any>): Store<S, {
    [T in keyof R]: ExtractPayload<S, R[T]> extends undefined | null ? () => S : (payload: ExtractPayload<S, R[T]>) => S;
}>;
declare const useStore: <S, A>(store: Store<S, A>) => Store<S, A>;
declare const useLocalStore: <S, A>(store: Store<S, A>) => Store<S, A>;
export default useStore;
export { useLocalStore, asyncState, createStore };
