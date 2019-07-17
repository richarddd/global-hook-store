import React, { useState } from "react";
import { shallow, mount } from "enzyme";
import { act } from "react-dom/test-utils";

import useStore, { createStore } from "../src/index";

describe("useStore", () => {
  const store = createStore(
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

  beforeEach(() => {
    act(() => {});
  });

  it("Should be able to use store in a component", () => {
    const BtnComponent = () => {
      const {
        actions: { increment },
        state: { count }
      } = useStore(store);

      return (
        <button onClick={() => increment()}>
          This button has been clicked {count} times
        </button>
      );
    };

    const TextComponent = () => {
      const {
        state: { count }
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
    rendered.find("button").simulate("click");
    rendered.find("button").simulate("click");
    rendered.find("button").simulate("click");

    console.log(rendered.text());
    console.log(store);
    expect(rendered.text()).toBe("This button has been clicked 2 times");
  });
});
