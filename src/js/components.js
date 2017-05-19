const scrollbarButton = ( side, direction, entity) => {
    const button = document.createElement('button');
    button.setAttribute('class', `scrollbar-${side}__button scrollbar-${side}__button--${direction}`);
    button.innerHTML = entity;

    return button;
};


const scrollbarThumb = () => {
    const thumb = document.createElement('div');
    thumb.setAttribute('class', 'scrollbar-vertical__thumb');

    return thumb;
};

const scrollBarVerticalTrack = () => {
    const scrollbarTrack = document.createElement('div');
    scrollbarTrack.setAttribute('class', 'scrollbar-vertical__track');
    scrollbarTrack.appendChild(scrollbarThumb());

    return scrollbarTrack;
};

export const scrollbarVertical = (disableButtons) => {
    const scrollbarTrack = scrollBarVerticalTrack();
    const topButton = scrollbarButton('vertical', 'top', '&#9652');
    const bottomButton = scrollbarButton('vertical', 'bottom', '&#9662;');
    const scrollbarVertical =  document.createElement('div');

    scrollbarVertical.setAttribute('class', 'scrollbar-vertical');

    if (disableButtons) {
			scrollbarVertical.appendChild(scrollbarTrack);
    } else {
			scrollbarVertical.appendChild(topButton);
			scrollbarVertical.appendChild(scrollbarTrack);
			scrollbarVertical.appendChild(bottomButton);
    }

    return scrollbarVertical;
};

export const scrollView = (scrollArea) => {
    const scrollView = document.createElement('div');

    scrollView.setAttribute('class', 'scroll-view');
    scrollArea.setAttribute('class', 'scroll-area');
    scrollView.appendChild(scrollArea);

    return scrollView;
};
