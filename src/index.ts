import { useState, useEffect, SetStateAction, Dispatch } from "react";

export type SetStateFunction<S = any> = Dispatch<SetStateAction<S>>;

type ActionStoreInternal = {
  setStateSet: Set<SetStateFunction>;
  setters: {
    [key: string]: any;
  };
  getters: {
    [key: string]: any;
  };
  reducers: StoreReducers<any>;
  actions: StoreActions<any, any>;
  utils: ReducerUtils<any>;
};

type AsyncState<T> = {
  loading: boolean;
  error?: object | string;
  data: T;
};

type AsyncAction<S> = <T extends keyof S, B>(
  key: T,
  promise: Promise<B>,
  throwError?: boolean
) => S[T] extends
  | AsyncState<B>
  | AsyncState<B | null>
  | AsyncState<B | undefined>
  ? Promise<S>
  : void;

type ReducerUtils<S> = {
  setState: SetStateFunction<S>;
  asyncAction: AsyncAction<S>;
};

export type ReducerFunction<S> = (
  state: S,
  payload: any,
  utils: ReducerUtils<S>
) => Promise<S> | S;

type StoreReducers<S> = {
  [key: string]: ReducerFunction<S>;
};

type Store<S, R extends StoreReducers<S>> = {
  state: S;
  reducers: R;
};

type StoreActions<S, P extends string | number | symbol> = {
  [T in P]: (payload?: any) => Promise<S>
};

export type ActionStore<S, P extends string | number | symbol> = {
  state: S;
  actions: StoreActions<S, P>;
  setState: SetStateFunction<S>;
};

function asyncState<T>(): AsyncState<T | undefined>;
function asyncState<T>(data: T): AsyncState<T>;
function asyncState<T>(data?: T): AsyncState<T> | AsyncState<T | undefined> {
  return {
    data,
    loading: false
  };
}

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
    store: ActionStore<S, keyof R>;
    receiver: () => S;
    setState: SetStateFunction<S>;
  },
  internals: ActionStoreInternal
) => StoreActions<S, keyof R> = (reducers, stateReceiver, internals) => {
  return Object.entries(reducers).reduce(
    (acc, [key, reducer]) => {
      acc[key] = async payload => {
        const newState = await reducer(
          copyState(stateReceiver.receiver()),
          payload,
          internals.utils
        );
        stateReceiver.setState(newState);
        return newState;
      };
      return acc;
    },
    {} as StoreActions<any, any>
  );
};

const applySettersGetters = (internals: ActionStoreInternal, state: any) => {
  Object.entries(internals.setters).forEach(([k, setter]) => {
    state.__defineSetter__(k, setter);
  });
  Object.entries(internals.getters).forEach(([k, getter]) => {
    state.__defineGetter__(k, getter);
  });
};

export const createStore: <S, R extends StoreReducers<S>>(
  initialState: S,
  reducers: R
) => ActionStore<S, keyof R> = (initialState, reducers) => {
  const internals: ActionStoreInternal = {
    reducers,
    setStateSet: new Set(),
    setters: {},
    getters: {},
    actions: {},
    utils: {} as any
  };
  const setState = (state: any) => {
    applySettersGetters(internals, state);
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

  const stateReceiver = {
    setState,
    receiver: () => actionStore.state,
    store: actionStore
  };

  internals.utils = {
    setState,
    asyncAction: async (
      key: string | number | symbol,
      promise: Promise<any>,
      throwError: boolean = false
    ) => {
      const state = stateReceiver.receiver() as any;
      let asyncStateObj = state[key] as AsyncState<any>;
      delete asyncStateObj.error;
      asyncStateObj.loading = true;
      stateReceiver.setState({ ...state, [key]: asyncStateObj });
      try {
        const data = await promise;
        asyncStateObj = {
          data,
          loading: false
        };
      } catch (error) {
        asyncStateObj.loading = false;
        asyncStateObj.error = error;
        if (throwError) {
          throw error;
        }
      }

      return { ...state, [key]: asyncStateObj };
    }
  };

  const actions = mapActions(reducers, stateReceiver, internals);

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
  actions: {} as StoreActions<any, any>,
  ["__internal"]: internals
});

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
  const internals = (store as any)["__internal"] as ActionStoreInternal;
  const [sa, internalSetState] = useState(() => {
    // tslint:disable-next-line:no-shadowed-variable
    const stateReceiver = {
      store: {} as ActionStore<any, any>,
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
    applySettersGetters(internals, newState);
    internalSetState({
      actions,
      stateReceiver,
      state: newState
    });
  };

  const actionStore = {
    state,
    setState,
    actions
  };

  stateReceiver.setState = setState;
  stateReceiver.store = actionStore;

  return actionStore;
};

export default useStore;
export { useLocalStore, asyncState };
