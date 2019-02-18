import { createStore } from "global-hook-store";

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
    increment: ({ count }) => ({ count: count + 1 }),
    decrement: ({ count }) => ({ count: count - 1 }),
    incrementByTen: async ({ count }) => {
      const promise = new Promise(resolve => setTimeout(resolve, 3000));
      await promise;
      return { count: count + 10 };
    }
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
    updateName: (state, name) => ({ ...state, name })
  }
);

export { counterStore, nameAndCounterStore, todoStore };
