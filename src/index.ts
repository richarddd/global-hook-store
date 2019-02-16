import { useState, useEffect, SetStateAction, Dispatch } from "react";

export const createStore: <S, R extends StoreReducers<S>>(
  initialState: S,
  reducers: R
) => Store<S, R> = (initialState, reducers) => ({
  state: initialState,
  reducers: { ...reducers }
});

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

const copySettersGetters = (originalState: any, newState: any) => {
  Object.keys(originalState).forEach(key => {
    const setter = originalState.__lookupSetter__(key);
    const getter = originalState.__lookupGetter__(key);
    if (setter) {
      newState.__defineSetter__(key, setter);
    }
    if (getter) {
      newState.__defineGetter__(key, getter);
    }
  });
};

const convertToActionStore: <S, R extends StoreReducers<S>>(
  store: Store<S, R>,
  setState: Dispatch<SetStateAction<S>>
) => ActionStore<S, keyof R> = (store, setState) => {
  const actionStore = {
    setState,
    state: store.state,
    actions: Object.entries(store.reducers).reduce(
      (acc, [key, reducer]) => {
        acc[key] = async payload => {
          const newState = await reducer(actionStore.state, payload);
          if (isObject(newState)) {
            copySettersGetters(actionStore.state, newState);
          }
          setState(newState);
        };
        return acc;
      },
      {} as StoreActions<any>
    )
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
  const actionStore = convertToActionStore(store, newState =>
    setState(newState)
  );
  actionStore.state = state;
  return actionStore;
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
