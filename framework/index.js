import { Component } from "./component";
import { createElement } from "./element";
import { init, classModule, propsModule, eventListenersModule } from "snabbdom";

global.h = createElement;

const patch = init([
  classModule, // makes it easy to toggle classes
  propsModule, // for setting properties on DOM elements
  eventListenersModule, // attaches event listeners
]);

const render = (RootComponent, rootElement) =>
  patch(rootElement, RootComponent);

export { Component, render, patch };
