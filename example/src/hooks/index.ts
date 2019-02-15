import { useState, useEffect, SetStateAction, Dispatch } from "react";

export const createStore: <S, R extends StoreReducers<S>>(
  initialState: S,
  reducers: R
) => Store<S, R> = (initialState, reducers) => ({
  state: initialState,
  reducers: { ...reducers }
});

export type ReducerFunction<S> = (
  state: S,
  payload?: any
) => Promise<Partial<S> | S> | Partial<S> | S;

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

const copySettersGetters = (target: any, s1: any, s2: any) => {
  Object.keys(target).forEach(key => {
    const setter = s2.__lookupSetter__(key) || s1.__lookupSetter__(key);
    const getter = s2.__lookupGetter__(key) || s1.__lookupGetter__(key);
    if (setter) {
      target.__defineSetter__(key, setter);
    }
    if (getter) {
      target.__defineGetter__(key, getter);
    }
  });
};

const copyState = <S>(oldState: S, newState: S) => {
  const stateIsObject = isObject(newState);

  // is primitive
  if (!stateIsObject) {
    return newState;
  }
  // is array
  if (Array.isArray(newState)) {
    return [
      ...new Set(([] as any[]).concat([...(oldState as any), ...newState]))
    ] as any;
  }

  const merged = Object.assign({}, oldState, newState) as any;
  copySettersGetters(merged, oldState, newState);
  return merged;
};

const convertToActionStore: <S, R extends StoreReducers<S>>(
  store: Store<S, R>,
  setState: Dispatch<SetStateAction<S>>
) => ActionStore<S, keyof R> = (store, setState) => {
  const actionStore = {
    state: store.state,
    actions: Object.entries(store.reducers).reduce(
      (acc, [key, reducer]) => {
        acc[key] = async payload => {
          const newState = copyState(
            actionStore.state,
            await reducer(actionStore.state, payload)
          );
          setState(newState);
        };
        return acc;
      },
      {} as StoreActions<any>
    ),
    setState
  };
  return actionStore;
};

const globalStore: <S, R extends StoreReducers<S>>(
  store: Store<S, R>
) => {
  global: ActionStore<S, keyof R>;
  setters: Set<Dispatch<SetStateAction<S>>>;
} = (() => {
  const map = new WeakMap();

  return <S, R extends StoreReducers<S>>(object: Store<S, R>) => {
    if (!map.has(object)) {
      const setters: Set<Dispatch<SetStateAction<S>>> = new Set();
      const global = convertToActionStore(object, newState => {
        setters.forEach(s => {
          s(newState);
        });
      });
      map.set(object, {
        global,
        setters
      });
    }

    return map.get(object);
  };
})();

const useStore: <S, R extends StoreReducers<S>>(
  store: Store<S, R>
) => ActionStore<S, keyof R> = store => {
  const [state, setState] = useState(store.state);
  return convertToActionStore(store, newState => setState(newState));
};

const useGlobalStore: <S, R extends StoreReducers<S>>(
  store: Store<S, R>
) => ActionStore<S, keyof R> = store => {
  const [state, setState] = useState(store.state);

  const { global, setters } = globalStore(store);

  global.state = state;

  useEffect(() => {
    setters.add(setState);
  });

  useEffect(() => {
    return () => {
      setters.delete(setState);
    };
  }, []);

  return global;
};

export default useGlobalStore;
export { useStore };
