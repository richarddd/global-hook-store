import { Store, StoreReducers, createStore } from "./useStore";
import { string, number } from "prop-types";

type Todo = { [key: string]: boolean };

const todoStore = createStore({} as Todo, {
  toggleTodo: (todos, todo) => {
    todos[todo] = !todos[todo];
    return { ...todos };
  },
  addTodo: (todos, input) => {
    const todo = input.value;
    input.value = "";
    return { ...todos, [todo]: false };
  }
});

const counterStore = createStore(
  {
    count: 0
  },
  {
    increment: ({ count, ...state }) => ({ ...state, count: count + 1 }),
    decrement: ({ count, ...state }) => ({ ...state, count: count - 1 }),
    incrementByTen: async ({ count, ...state }) => {
      const promise = new Promise(resolve => setTimeout(resolve, 3000));
      await promise;
      return { ...state, count: count + 10 };
    }
  }
);

const nameAndCounterStore = createStore(
  {
    count: 0,
    name: "kalle",
    get length() {
      console.log("this", this);
      return this.name.length;
    }
  },
  {
    increment: ({ count, ...state }) => ({ ...state, count: count + 1 }),
    decrement: ({ count, ...state }) => ({ ...state, count: count - 1 }),
    updateName: (state, name) => ({ ...state, name })
  }
);

export { counterStore, nameAndCounterStore, todoStore };
