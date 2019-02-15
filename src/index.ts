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
};

const isObject = (test: any) => test === Object(test);

const copyState = <S>(state: S) => {
  const stateIsObject = isObject(state);
  // is primitive
  if (!stateIsObject) {
    return state;
  }
  if (Array.isArray(state)) {
    return [...state] as any;
  }
  const cloned = { ...state };
  const originalState = state as any;
  const clonedState = cloned as any;

  Object.keys(state).forEach(key => {
    const setter = originalState.__lookupSetter__(key);
    const getter = originalState.__lookupGetter__(key);
    if (setter) {
      delete clonedState[key];
      clonedState.__defineSetter__(key, setter);
    }
    if (getter) {
      delete clonedState[key];
      clonedState.__defineGetter__(key, getter);
    }
  });

  console.log("cloned state", clonedState);

  return clonedState;
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
      const state = object.state;
      const setters: Set<Dispatch<SetStateAction<S>>> = new Set();
      const global = {
        state,
        actions: Object.entries(object.reducers).reduce(
          (acc, [key, reducer]) => {
            acc[key] = async payload => {
              const newState = copyState(await reducer(global.state, payload));
              setters.forEach(s => {
                s(newState);
              });
            };
            return acc;
          },
          {} as StoreActions<any>
        )
      };

      map.set(object, {
        global,
        setters
      });
    }

    return map.get(object);
  };
})();

// const useStore: <S, R extends StoreReducers<S>>(
//   store: Store<S, R>
// ) => ActionStore<S, keyof R> = store => {
//   const [state, setState] = useState(store.state);

//   return state as any;
// };

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
// export { useStore };
