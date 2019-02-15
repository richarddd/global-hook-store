export declare const createStore: <S, R extends StoreReducers<S>>(initialState: S, reducers: R) => Store<S, R>;
export declare type ReducerFunction<S> = (state: S, payload?: any) => Promise<Partial<S> | S> | Partial<S> | S;
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
};
declare const useGlobalStore: <S, R extends StoreReducers<S>>(store: Store<S, R>) => ActionStore<S, keyof R>;
export default useGlobalStore;
