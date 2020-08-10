import { SetStateAction, Dispatch } from "react";
import usePromise from "./usePromise";
export declare type SetStateFunction<S = any> = Dispatch<SetStateAction<S>>;
export declare type AsyncState<T> = {
    loading: boolean;
    error?: Record<string, unknown> | string;
    data: T;
};
export declare type AsyncAction<S> = <T extends keyof S, B>(key: T, promise: Promise<B>, throwError?: boolean) => S[T] extends AsyncState<B> | AsyncState<B | null> | AsyncState<B | undefined> ? Promise<S> : never;
declare type ReducerUtils<S> = {
    setState: SetStateFunction<S>;
    asyncAction: AsyncAction<S>;
    reset: (...keys: (keyof S)[]) => S | Promise<S>;
    receiveState: () => S;
};
export declare type Store<S, A> = {
    state: S;
    actions: A;
    setState: SetStateFunction<S>;
};
declare function asyncState<T>(): AsyncState<T | null>;
declare function asyncState<T>(data: T): AsyncState<T>;
export declare type ReducerFunctions<S> = {
    [key: string]: (state: S, payload: any, utils: ReducerUtils<S>) => Promise<S> | S;
};
export declare type EmptyReducerFunction<S> = () => Promise<S> | S;
export declare type StateReducerFunction<S> = (state: S) => Promise<S> | S;
declare type ExtractPayload<S, T> = T extends (state: S, payload: infer P) => S | Promise<S> ? P : T extends (state: S, payload: infer P, utils: ReducerUtils<S>) => S | Promise<S> ? P : never;
declare function createStore<S, R>(initialState: S, reducers: R & ReducerFunctions<S>): Store<S, {
    [T in keyof R]: ExtractPayload<S, R[T]> extends undefined | null ? () => Promise<S> : R[T] extends StateReducerFunction<S> ? () => Promise<S> : R[T] extends EmptyReducerFunction<S> ? () => Promise<S> : (payload: ExtractPayload<S, R[T]>) => Promise<S>;
}>;
declare const useStore: <S, A>(store: Store<S, A>) => Store<S, A>;
declare const useLocalStore: <S, A>(store: Store<S, A>) => Store<S, A>;
declare function useStoreReset<S, A>(store: Store<S, A>, ...keys: Array<keyof S>): void;
export default useStore;
export { useLocalStore, asyncState, createStore, useStoreReset, usePromise };
