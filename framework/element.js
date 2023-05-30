import { h } from "snabbdom";
import { computeAttrs } from "./attributes";

export const createComponent = (Component, attrs, children) => {
  const component = new Component({
    children,
    ...attrs,
  });

  const rendered = component.render();
  component.currentNode = rendered;
  component.onDidMount && component.onDidMount();
  return rendered;
};

export const createElement = (tagName, attrs, ...children) => {
  if (typeof tagName === "function") {
    return createComponent(tagName, attrs, children);
  }

  return h(tagName, computeAttrs(attrs || {}), children);
};
