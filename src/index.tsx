import React, { useRef } from "react";
import { render } from "react-dom";
import useStore, { Store } from "./useStore";
import { nameAndCounterStore, counterStore, todoStore } from "./stores";

import "./styles.css";

const OtherComponent = () => {
  const store = useStore(nameAndCounterStore);
  const { state, actions } = store;
  const cStore = useStore(counterStore);

  return (
    <div>
      <h5>
        Other comp: {state.name} {cStore.state.count}
      </h5>
      <h5>Char length: {state.length}</h5>
      <input
        value={state.name}
        onChange={e => actions.updateName(e.target.value)}
      />
    </div>
  );
};

const AsyncComponent = () => {
  const { actions } = useStore(counterStore);

  return (
    <button onClick={() => actions.incrementByTen()}>
      Delayed increment by 10
    </button>
  );
};

const ToDoList = () => {
  const { state, actions } = useStore(todoStore);
  const ref = useRef(null);

  return (
    <div>
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
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <h3>Count {state.count}</h3>
      <button onClick={() => actions.decrement()}>-</button>
      <button onClick={() => actions.increment()}>+</button>
      <OtherComponent />
      <OtherComponent />
      <AsyncComponent />

      <ToDoList />
    </div>
  );
};

const rootElement = document.getElementById("root");
render(<App />, rootElement);
