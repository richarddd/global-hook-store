import React, { useRef } from "react";
import { render } from "react-dom";
import useStore, { useLocalStore } from "global-hook-store";
import { nameAndCounterStore, counterStore, todoStore } from "./stores";

import "./styles.css";

const OtherComponent = () => {
  const {
    state: { name, length },
    actions: { updateName }
  } = useStore(nameAndCounterStore);
  const {
    state: { count }
  } = useStore(counterStore);

  return (
    <div>
      <h3>
        Other component: {name} {count}
      </h3>
      <h5>Char length: {length}</h5>
      <input value={name} onChange={e => updateName(e.target.value)} />
    </div>
  );
};

const OwnStore = () => {
  const {
    state: { count },
    actions
  } = useLocalStore(counterStore);

  return (
    <div>
      <h1>Own store</h1>
      <h2>Count {count}</h2>
      <button onClick={() => actions.decrement()}>-</button>
      <button onClick={() => actions.increment()}>+</button>
    </div>
  );
};

const AsyncComponent = () => {
  const { actions } = useStore(counterStore);

  return (
    <div>
      <h3>Async example</h3>
      <button onClick={() => actions.incrementByTen()}>
        Delayed increment by 10
      </button>
    </div>
  );
};

const ToDoList = () => {
  const { state, actions } = useStore(todoStore);
  const ref = useRef(null);

  return (
    <div>
      <h3>Todo list example</h3>
      {Object.entries(state).map(([todo, done], i) => (
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

const App = () => {
  const { actions, state } = useStore(counterStore);

  return (
    <div className="App">
      <div>
        <h1>Hello Global Store</h1>
        <h2>Count {state.count}</h2>
        <button onClick={() => actions.decrement()}>-</button>
        <button onClick={() => actions.increment()}>+</button>
      </div>
      <OwnStore />
      <OwnStore />
      <OtherComponent />
      <OtherComponent />
      <AsyncComponent />
      <ToDoList />
    </div>
  );
};

const rootElement = document.getElementById("root");
render(<App />, rootElement);
