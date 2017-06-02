export function setTransformAnimation(element, position, durationMs) {
    const prefixes = ['Webkit', 'Moz', 'ms', 'O', ''];

    for (let value of prefixes) {
        element.style[value + 'Transform'] = `translate3d(${position}px, 0, 0)`;
        element.style[value + 'Transition'] = `transform ${durationMs}ms ease-out`;
    }
}

export function setStyle(node, css) {
    Object.assign(node.style, css);
}

export function getElemHeight(elem) {
    return elem.getBoundingClientRect().height;
}

export function getElemWidth(elem) {
	return elem.getBoundingClientRect().width;
}

export function throttle(func, ms = 0) {
	  let savedArgs,savedThis, isThrottled = false;

	  function wrapper() {
		    if (isThrottled) {
			      savedArgs = arguments;
			      savedThis = this;
			      return;
		    }

        func.apply(this, arguments);
        isThrottled = true;

        setTimeout(() => {
            isThrottled = false;
                if (savedArgs) {
                    wrapper.apply(savedThis, savedArgs);
                    savedArgs = savedThis = null;
            }
        }, ms);
    }
	  return wrapper;
}