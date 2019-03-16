import { createStore, asyncState } from "global-hook-store";
import githubApi from "./utils";

type Todo = { [key: string]: boolean };

const todoStore = createStore({} as Todo, {
  toggleTodo: (todos, todo: string) => {
    todos[todo] = !todos[todo];
    return { ...todos };
  },
  addTodo: (todos, input: HTMLInputElement) => {
    const todo = input.value;
    input.value = "";
    return { ...todos, [todo]: false };
  }
});

const arrayStore = createStore([] as string[], {
  push: (state, newValue: string) => {
    state.push(newValue);
    return state;
  }
});

const counterStore = createStore(
  {
    count: 0
  },
  {
    increment: ({ count }) => ({ count: count + 1 }),
    decrement: ({ count }) => ({ count: count - 1 }),
    incrementByTen: async ({ count }) => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { count: count + 10 };
    }
  }
);

export type Repo = {
  id: string;
  name: string;
};

const githubStore = createStore(
  {
    repos: asyncState<Repo[]>([]),
    userId: ""
  },
  {
    setRepoId: (state, userId: string) => ({ ...state, userId }),
    getUserRepos: async ({ userId }, _payload: null, { asyncAction }) =>
      asyncAction("repos", githubApi.getRepo(userId)),
    reset: (_state, _payload: null, { reset }) => reset()
  }
);

const nameAndCounterStore = createStore(
  {
    count: 0,
    name: "Willy wonka",
    get length() {
      return this.name.length;
    }
  },
  {
    increment: ({ count, ...state }) => ({ ...state, count: count + 1 }),
    decrement: ({ count, ...state }) => ({ ...state, count: count - 1 }),
    updateName: (state, name: string) => ({ ...state, name })
  }
);

const primitiveStore = createStore("Choose name" as string, {
  kalle: () => "kålle",
  ada: () => "ada"
});

export {
  counterStore,
  nameAndCounterStore,
  todoStore,
  arrayStore,
  primitiveStore,
  githubStore
};
