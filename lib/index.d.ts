import { SetStateAction, Dispatch } from "react";
export declare type SetStateFunction<S = any> = Dispatch<SetStateAction<S>>;
declare type AsyncState<T> = {
    loading: boolean;
    error?: object | string;
    data: T;
};
declare type AsyncAction<S> = <T extends keyof S, B>(key: T, promise: Promise<B>, throwError?: boolean) => S[T] extends AsyncState<B> ? Promise<S> : void;
declare type ReducerUtils<S> = {
    setState: SetStateFunction<S>;
    asyncAction: AsyncAction<S>;
};
export declare type ReducerFunction<S> = (state: S, payload: any, utils: ReducerUtils<S>) => Promise<S> | S;
declare type StoreReducers<S> = {
    [key: string]: ReducerFunction<S>;
};
declare type StoreActions<S, P extends string | number | symbol> = {
    [T in P]: (payload?: any) => Promise<S>;
};
export declare type ActionStore<S, P extends string | number | symbol> = {
    state: S;
    actions: StoreActions<S, P>;
    setState: SetStateFunction<S>;
};
declare const asyncState: <T>(data: T) => AsyncState<T>;
export declare const createStore: <S, R extends StoreReducers<S>>(initialState: S, reducers: R) => ActionStore<S, keyof R>;
declare const useStore: <S, R extends string>(store: ActionStore<S, R>) => ActionStore<S, R>;
declare const useLocalStore: <S, R extends string>(store: ActionStore<S, R>) => ActionStore<S, R>;
export default useStore;
export { useLocalStore, asyncState };
