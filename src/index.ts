import { useState, useEffect, useMemo, SetStateAction, Dispatch } from "react";

type SetStateFunction<S = any> = Dispatch<SetStateAction<S>>;

type ActionStoreInternal = {
  setStateSet: Set<SetStateFunction>;
  setters: {
    [key: string]: any;
  };
  getters: {
    [key: string]: any;
  };
  reducers: StoreReducers<any>;
  actions: StoreActions<any>;
};

const copyState: <S>(state: S) => any = state => {
  // is primitive
  if (!isObject(state)) {
    return state;
  }
  // is array
  if (Array.isArray(state)) {
    return [...state];
  }

  // is object
  return {
    ...state
  };
};

const mapActions: <S, R extends StoreReducers<S>>(
  reducers: R,
  stateReceiver: {
    receiver: () => S;
    setState: SetStateFunction<S>;
  },
  internals: ActionStoreInternal
) => StoreActions<keyof R> = (reducers, stateReceiver, internals) =>
  Object.entries(reducers).reduce(
    (acc, [key, reducer]) => {
      acc[key] = async payload => {
        const newState = await reducer(
          copyState(stateReceiver.receiver()),
          payload
        );
        Object.entries(internals.setters).forEach(([k, setter]) => {
          (newState as any).__defineSetter__(k, setter);
        });
        Object.entries(internals.getters).forEach(([k, getter]) => {
          (newState as any).__defineGetter__(k, getter);
        });
        stateReceiver.setState(newState);
      };
      return acc;
    },
    {} as StoreActions<any>
  );

export const createStore: <S, R extends StoreReducers<S>>(
  initialState: S,
  reducers: R
) => ActionStore<S, keyof R> = (initialState, reducers) => {
  const internals: ActionStoreInternal = {
    reducers,
    setStateSet: new Set(),
    setters: {},
    getters: {},
    actions: {}
  };
  const setState = (state: any) => {
    internals.setStateSet.forEach(setStateFunction => {
      setStateFunction(state);
    });
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

  const actionStore = emptyActionStore(
    initialState,
    setState,
    internals,
    reducers
  );

  const actions = mapActions(
    reducers,
    { setState, receiver: () => actionStore.state },
    internals
  );

  actionStore.actions = actions;
  internals.actions = actions;

  return actionStore;
};

const emptyActionStore: <S, R extends StoreReducers<S>>(
  initialState: S,
  setState: SetStateFunction<S>,
  internals: ActionStoreInternal,
  reducers: R
) => ActionStore<S, keyof R> = (state, setState, internals, reducers) => ({
  setState,
  state,
  actions: {} as StoreActions<any>,
  ["__internal"]: internals
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
  setState: SetStateFunction<S>;
};

const isObject = (obj: any) => obj === Object(obj);

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
  const [sa, internalSetState] = useState(() => {
    const internals = (store as any)["__internal"] as ActionStoreInternal;
    // tslint:disable-next-line:no-shadowed-variable
    const stateReceiver = {
      receiver: () => store.state,
      // tslint:disable-next-line:no-empty
      setState: (s: any) => {}
    };
    return {
      stateReceiver,
      state: store.state,
      actions: mapActions(internals.reducers, stateReceiver, internals)
    };
  });

  const { state, actions, stateReceiver } = sa;

  const receiver = () => {
    return state;
  };

  stateReceiver.receiver = receiver;

  const setState = (newState: any) => {
    internalSetState({
      actions,
      stateReceiver,
      state: newState
    });
  };

  stateReceiver.setState = setState;

  return {
    state,
    setState,
    actions
  };
};

export default useStore;
export { useLocalStore };
