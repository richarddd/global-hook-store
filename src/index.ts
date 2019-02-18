import { useState, useEffect, SetStateAction, Dispatch } from "react";

type ActionStoreInternal = {
  setStateSet: Set<Dispatch<SetStateAction<any>>>;
  setters: {
    [key: string]: any;
  };
  getters: {
    [key: string]: any;
  };
  reducers: StoreReducers<any>;
};

export const createStore: <S, R extends StoreReducers<S>>(
  initialState: S,
  reducers: R
) => ActionStore<S, keyof R> = (initialState, reducers) => {
  const internals: ActionStoreInternal = {
    reducers,
    setStateSet: new Set(),
    setters: {},
    getters: {}
  };
  const setState = (state: any) => {
    internals.setStateSet.forEach(setStateFunction => {
      setStateFunction(state);
    });
  };
  const actionStore = {
    setState,
    state: initialState,
    actions: Object.entries(reducers).reduce(
      (acc, [key, reducer]) => {
        acc[key] = async payload => {
          const newState = await reducer(actionStore.state, payload);
          Object.entries(internals.setters).forEach(([k, setter]) => {
            (newState as any).__defineSetter__(k, setter);
          });
          Object.entries(internals.getters).forEach(([k, getter]) => {
            (newState as any).__defineGetter__(k, getter);
          });
          setState(newState);
        };
        return acc;
      },
      {} as StoreActions<any>
    )
  };

  if (isObject(initialState)) {
    Object.keys(initialState).forEach(key => {
      const setter = (initialState as any).__lookupSetter__(key);
      const getter = (initialState as any).__lookupGetter__(key);
      if (setter) {
        internals.setters[key] = setter;
      }
      if (getter) {
        internals.getters[key] = getter;
      }
    });
  }

  (actionStore as any)["__internal"] = internals;
  return actionStore;
};

export type ReducerFunction<S> = (state: S, payload?: any) => Promise<S> | S;

export type StoreReducers<S> = {
  [key: string]: ReducerFunction<S>;
};

export type Store<S, R extends StoreReducers<S>> = {
  state: S;
  reducers: R;
};

export type StoreActions<P extends string | number | symbol> = {
  [T in P]: (payload?: any) => void
};

export type ActionStore<S, P extends string | number | symbol> = {
  state: S;
  actions: StoreActions<P>;
  setState: Dispatch<SetStateAction<S>>;
};

const isObject = (test: any) => test === Object(test);

const useStore: <S, R extends string>(
  store: ActionStore<S, R>
) => ActionStore<S, R> = store => {
  const [state, setState] = useState(store.state);
  store.state = state;

  const internals = (store as any)["__internal"] as ActionStoreInternal;
  const setters = internals.setStateSet;

  useEffect(() => {
    setters.add(setState);
  });

  useEffect(() => {
    return () => {
      setters.delete(setState);
    };
  }, []);

  return store;
};

const useLocalStore: <S, R extends string>(
  store: ActionStore<S, R>
) => ActionStore<S, R> = store => {
  const [state, internalSetState] = useState(store.state);
  const internals = (store as any)["__internal"] as ActionStoreInternal;

  const setState = (newState: any) => {
    internalSetState(newState);
  };

  return {
    state,
    setState,
    actions: Object.entries(internals.reducers).reduce(
      (acc, [key, reducer]) => {
        acc[key] = async payload => {
          const newState = await reducer(state, payload);
          Object.entries(internals.setters).forEach(([k, setter]) => {
            (newState as any).__defineSetter__(k, setter);
          });
          Object.entries(internals.getters).forEach(([k, getter]) => {
            (newState as any).__defineGetter__(k, getter);
          });
          setState(newState);
        };
        return acc;
      },
      {} as StoreActions<any>
    )
  };
};

export default useStore;
export { useLocalStore };
