import { SetStateAction, Dispatch } from "react";
export declare const createStore: <S, R extends StoreReducers<S>>(initialState: S, reducers: R) => ActionStore<S, keyof R>;
export declare type ReducerFunction<S> = (state: S, payload?: any) => Promise<S> | S;
export declare type StoreReducers<S> = {
    [key: string]: ReducerFunction<S>;
};
export declare type Store<S, R extends StoreReducers<S>> = {
    state: S;
    reducers: R;
};
export declare type StoreActions<P extends string | number | symbol> = {
    [T in P]: (payload?: any) => void;
};
export declare type ActionStore<S, P extends string | number | symbol> = {
    state: S;
    actions: StoreActions<P>;
    setState: Dispatch<SetStateAction<S>>;
};
declare const useGlobalStore: <S, R extends string>(store: ActionStore<S, R>) => ActionStore<S, R>;
declare const useStore: <S, R extends string>(store: ActionStore<S, R>) => ActionStore<S, R>;
export default useGlobalStore;
export { useStore };
