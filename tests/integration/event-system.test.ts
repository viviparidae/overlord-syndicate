import { EventSystem } from "@core/EventSystem";
import { describe, expect, it } from "vitest";

describe("EventSystem", () => {
  it("リスナーにイベントが配信される", () => {
    const system = new EventSystem();
    let called = false;
    system.on("testEvent", () => {
      called = true;
    });
    system.emit("testEvent");
    expect(called).toBe(true);
  });

  it("リスナーを解除できる", () => {
    const system = new EventSystem();
    const cb = () => {};
    system.on("testEvent", cb);
    system.off("testEvent", cb);
    system.emit("testEvent");
    expect(system.listenerCount("testEvent")).toBe(0);
  });

  it("リスナー数を正しく返せる", () => {
    const system = new EventSystem();
    const cb1 = () => {};
    const cb2 = () => {};
    system.on("testEvent", cb1);
    system.on("testEvent", cb2);
    expect(system.listenerCount("testEvent")).toBe(2);
  });

  it("全リスナーを解除できる", () => {
    const system = new EventSystem();
    system.on("a", () => {});
    system.on("b", () => {});
    system.clear();
    expect(system.listenerCount("a")).toBe(0);
    expect(system.listenerCount("b")).toBe(0);
  });
});
