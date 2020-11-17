import React, { useState } from "react";
import { shallow, mount } from "enzyme";
import { act } from "react-dom/test-utils";

import useStore, { createStore } from "../src/index";

const delay = (timeout) =>
  new Promise((resolve) => setTimeout(resolve, timeout));

const simulateClicks = async (target, count) => {
  for (let i = 0; i < count; i++) {
    target.simulate("click");
    await delay(1);
  }
};

describe("useStore", () => {
  const store = createStore(
    {
      count: 0,
    },
    {
      increment: ({ count }) => ({ count: count + 1 }),
      decrement: ({ count }) => ({ count: count - 1 }),
      incrementByTen: async ({ count }) => {
        await delay(1000);
        return { count: count + 10 };
      },
      incrementByTenReceived: async (_state, _payload, { receiveState }) => {
        await delay(1000);
        return { count: receiveState().count + 10 };
      },
      reset: (_state, _payload: null, { reset }) => reset(),
    }
  );

  const BtnComponent = () => {
    const {
      actions: { increment, incrementByTen, reset, incrementByTenReceived },
      state,
    } = useStore(store);

    return (
      <div>
        <button id="inc" onClick={increment}>
          This button has been clicked {state.count} times
        </button>
        <button id="async" onClick={incrementByTen}>
          Async
        </button>
        <button id="async-received" onClick={incrementByTenReceived}>
          Async
        </button>
        <button id="reset" onClick={reset}>
          Reset
        </button>
      </div>
    );
  };

  const TextComponent = () => {
    const {
      state: { count },
    } = useStore(store);

    return <h1>This button has been clicked {count} times</h1>;
  };

  const App = () => (
    <div>
      <BtnComponent />
      <TextComponent />
    </div>
  );

  const rendered = mount(<App />);

  it("Should be able to update state globally", async () => {
    const button = rendered.find("button#inc");

    await act(async () => {
      await simulateClicks(button, 3);
    });

    const expectation = "This button has been clicked 3 times";
    expect(rendered.find("h1").text()).toBe(expectation);
    expect(button.text()).toBe(expectation);
  });

  it("Should be able to reset using action", async () => {
    await act(async () => {
      await store.actions.reset();
    });
    const button = rendered.find("button#inc");
    const expectation = "This button has been clicked 0 times";
    expect(rendered.find("h1").text()).toBe(expectation);
    expect(button.text()).toBe(expectation);
  });

  it("Should be able to run async actions", async () => {
    const asyncButton = rendered.find("button#async");
    const asyncReceivedButton = rendered.find("button#async-received");
    const incButton = rendered.find("button#inc");

    await act(async () => {
      await simulateClicks(asyncButton, 3);
    });
    const expectation = "This button has been clicked 0 times";
    expect(rendered.find("h1").text()).toBe(expectation);
    expect(incButton.text()).toBe(expectation);

    await act(async () => {
      await incButton.simulate("click");
    });

    const expectation2 = "This button has been clicked 1 times";
    expect(rendered.find("h1").text()).toBe(expectation2);
    expect(incButton.text()).toBe(expectation2);

    await act(async () => {
      await delay(1500);
    });

    //should be 10 because we are using the old state (0) in the store
    const expectation3 = "This button has been clicked 10 times";
    expect(rendered.find("h1").text()).toBe(expectation3);
    expect(incButton.text()).toBe(expectation3);

    await act(async () => {
      await simulateClicks(asyncReceivedButton, 3);
    });

    await delay(100);

    await act(async () => {
      await incButton.simulate("click");
    });

    const expectation4 = "This button has been clicked 11 times";
    expect(rendered.find("h1").text()).toBe(expectation4);
    expect(incButton.text()).toBe(expectation4);

    await act(async () => {
      await delay(1500);
    });

    const expectation5 = "This button has been clicked 41 times";
    expect(rendered.find("h1").text()).toBe(expectation5);
    expect(incButton.text()).toBe(expectation5);
  });
});
