export function h(type, props, ...children) {
  return { type, props: props || {}, children };
}

function setBooleanProp($target, name, value) {
  if (value) {
    $target.setAttribute(name, value);
    $target[name] = true;
  } else {
    $target[name] = false;
  }
}

function removeBooleanProp($target, name) {
  $target.removeAttribute(name);
  $target[name] = false;
}

function isEventProp(name) {
  return /^on/.test(name);
}

function extractEventName(name) {
  return name.slice(2).toLowerCase();
}

function isCustomProp(name) {
  return isEventProp(name) || name === "forceUpdate";
}

function setProp($target, name, value) {
  if (isCustomProp(name)) {
    return;
  } else if (name === "className") {
    $target.setAttribute("class", value);
  } else if (typeof value === "boolean") {
    setBooleanProp($target, name, value);
  } else {
    $target.setAttribute(name, value);
  }
}

function removeProp($target, name, value) {
  if (isCustomProp(name)) {
    return;
  } else if (name === "className") {
    $target.removeAttribute("class");
  } else if (typeof value === "boolean") {
    removeBooleanProp($target, name);
  } else {
    $target.removeAttribute(name);
  }
}

function setProps($target, props) {
  Object.keys(props).forEach((name) => {
    setProp($target, name, props[name]);
  });
}

function updateProp($target, name, newVal, oldVal) {
  if (!newVal) {
    removeProp($target, name, oldVal);
  } else if (!oldVal || newVal !== oldVal) {
    setProp($target, name, newVal);
  }
}

function updateProps($target, newProps, oldProps = {}) {
  const props = Object.assign({}, newProps, oldProps);
  Object.keys(props).forEach((name) => {
    updateProp($target, name, newProps[name], oldProps[name]);
  });
}

function addEventListeners($target, props) {
  Object.keys(props).forEach((name) => {
    if (isEventProp(name)) {
      $target.addEventListener(extractEventName(name), props[name]);
    }
  });
}

function createElement(node) {
  if (typeof node === "string") {
    return document.createTextNode(node);
  }
  const $el = document.createElement(node.type);
  setProps($el, node.props);
  addEventListeners($el, node.props);
  node.children.map(createElement).forEach($el.appendChild.bind($el));
  return $el;
}

function changed(node1, node2) {
  return (
    typeof node1 !== typeof node2 ||
    (typeof node1 === "string" && node1 !== node2) ||
    node1.type !== node2.type ||
    (node1.props && node1.props.forceUpdate)
  );
}

export function diff(newNode, oldNode, index = 0) {
  return ($parent) => {
    if (!oldNode) {
      $parent.appendChild(createElement(newNode));
    } else if (!newNode) {
      $parent.removeChild($parent.childNodes[index]);
    } else if (changed(newNode, oldNode)) {
      $parent.replaceChild(createElement(newNode), $parent.childNodes[index]);
    } else if (newNode.type) {
      updateProps($parent.childNodes[index], newNode.props, oldNode.props);
      const newLength = newNode.children.length;
      const oldLength = oldNode.children.length;
      for (let i = 0; i < newLength || i < oldLength; i++) {
        patch(
          $parent.childNodes[index],
          newNode.children[i],
          oldNode.children[i],
          i
        );
      }
    }
  };
}
