import React, { useRef, useEffect } from "react";
import { render } from "react-dom";
import useStore, { useLocalStore } from "global-hook-store";
import {
  nameAndCounterStore,
  counterStore,
  todoStore,
  arrayStore,
  primitiveStore
} from "./stores";

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
      <h4>
        Other component: {name} {count}
      </h4>
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
      <h3>Own store</h3>
      <h4>Count {count}</h4>
      <button onClick={() => actions.decrement()}>-</button>
      <button onClick={() => actions.increment()}>+</button>
    </div>
  );
};

const ArrayStore = () => {
  const { state, actions } = useLocalStore(arrayStore);

  return (
    <div>
      <h3>Array store</h3>
      <div>
        {state.map((a, i) => (
          <span key={i}>{a}</span>
        ))}
      </div>
      <button onClick={() => actions.push(`Value #${state.length}`)}>
        PUSH
      </button>
    </div>
  );
};

const PrimitiveStore = () => {
  const { state: name, actions } = useLocalStore(primitiveStore);

  return (
    <div>
      <h3>Primitivestore</h3>
      <h4>Name: {name}</h4>
      <button onClick={() => actions.kalle()}>Kålle</button>
      <button onClick={() => actions.ada()}>Ada</button>
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
        <h3>Hello Global Store</h3>
        <h4>Count {state.count}</h4>
        <button onClick={() => actions.decrement()}>-</button>
        <button onClick={() => actions.increment()}>+</button>
      </div>
      <OwnStore />
      <OwnStore />
      <OtherComponent />
      <OtherComponent />
      <AsyncComponent />
      <ToDoList />
      <ArrayStore />
      <PrimitiveStore />
    </div>
  );
};

const rootElement = document.getElementById("root");
render(<App />, rootElement);
