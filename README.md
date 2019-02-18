# global-hook-store

Dead simple global store using hooks for react.

##TLDR##

Counter: https://codesandbox.io/s/j2v0p6kq7w

Todo list: https://codesandbox.io/s/54kwqpppnx

## Installation

    //yarn
    yarn add global-hook-store

    //or npm
    npm -i global-hook-store --save

## Usage

Its super super simple to use. Only three steps required.

1. Create your store with initial state & reducer style functions 👇

```javascript
const counterStore = createStore(
  {
    count: 0
  },
  {
    increment: ({ count }) => ({ count: count + 1 }),
    decrement: ({ count }) => ({ count: count - 1 })
  }
);
```

1. Use store 👌

```javascript
const App = () => {
  const { actions, state } = useGlobalStore(counterStore);

  return (
    <>
      <h1>Count {state.count}</h1>
      <button onClick={() => actions.decrement()}>-</button>
      <button onClick={() => actions.increment()}>+</button>
    </>
  );
};
```

3. Profit 🎉

_The reducer style functions are converted to actions which could be called from react_

## Example with payload

Todo list:

```javascript


const todoStore = createStore({} as Todo, {
  // payload is here:  👇
  toggleTodo: (todos, todo) => {
    todos[todo] = !todos[todo];
    return { ...todos };
  },
  // payload is here:👇
  addTodo: (todos, input) => {
    const todo = input.value;
    input.value = "";
    return { ...todos, [todo]: false };
  }
});

```

```javascript
const ToDoList = () => {
  const { state, actions } = useGlobalStore(todoStore);
  const ref = useRef(null);

  return (
    <div>
      <h3>Todo list example</h3>
      {Object.entries(state).map(([todo, done], i) => (
        // passed payload:                      👇
        <div onClick={() => actions.toggleTodo(todo)} key={i + todo}>
          {todo}
          {done ? " ✔" : " ⏲"}
        </div>
      ))}
      <input ref={ref} />
      <button onClick={() => actions.addTodo(ref.current!)}>Add todo</button>
    </div>
  );
};
```

## Nice to have

### Typescript support

When using typescript actions and state are inffered:
![Inferred Types](typescript.png "Inffered types")

### Async actions work out of the box:

### Getters and setters are preserved:

```javascript
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
```

```javascript
const {
  state: { length },
  actions
} = useGlobalStore(nameAndCounterStore);
```

```
<span>{length}</span>
```

### Use the same style local store also

```javascript
const App = () => {
  const { actions, state } = useStore(counterStore);

  return (
    <>
      <h1>Count {state.count}</h1>
      <button onClick={() => actions.decrement()}>-</button>
      <button onClick={() => actions.increment()}>+</button>
    </>
  );
};
```
