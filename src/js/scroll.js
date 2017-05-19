import { scrollView, scrollbarVertical } from './components';
import { setStyle } from './common';

export default class ScrollView {
    constructor(props) {
        this.props = props;
        this.component = props.view;
    }

    _viewableHeight () {
        return this.props.height
            || this.scrollView.getBoundingClientRect().height;
    };

    _viewableWidth () {
        const scrollbarTrackWidth = this.scrollBarVertical.getBoundingClientRect().width;

        return (this.props.width
            || this.scrollView.getBoundingClientRect().width) - scrollbarTrackWidth;
    };

    _totalWidth () {
        return this.scrollArea.offsetWidth;
    };

    _totalHeight () {
        return this.scrollArea.offsetHeight;
    };

    _ratio() {
        const contentHeight = this._totalHeight() - this._viewableHeight();
        const scrollBarVerticalHeight =
            this.verticalTrack.offsetHeight - this.verticalThumb.offsetHeight;

        return (contentHeight / scrollBarVerticalHeight);
    }

    _scrollAreaCoords (x, y) {
        if (!this._coords) this._coords = {x: null , y: null};

        if (!arguments.length) return this._coords;
        this._coords.x = x;
        this._coords.y = y;
    };

    _verticalThumbHeight() {
        const arrowsHeight = 0; // *2
        const viewableRatio = this._viewableHeight() / this._totalHeight();

        return Math.round((this._viewableHeight() - arrowsHeight * 2) * viewableRatio);
    }

    _isOverflow (dir) {
        return dir === 'y'
          ? this.scrollView.offsetHeight < this.scrollArea.offsetHeight
          : this.scrollView.offsetWidth < this.scrollArea.offsetWidth;
    }

    _onWheel(e = window.event) {
        if (!this._isOverflow('y')) return;

        this.deltaY = e.deltaY || e.detail || e.wheelDelta;

        const positionY = this._scrollAreaCoords().y + this.deltaY / this._ratio();

        this._scrollTo(0, positionY);
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    }

    _scrollTo(deltaX, deltaY) {
        let trackHeight = this.verticalTrack.offsetHeight - this.verticalThumb.offsetHeight;

        if (deltaY > trackHeight) deltaY = trackHeight;
        if (deltaY < 0) deltaY = 0;

        this._scrollAreaCoords(0, deltaY);
        const scrollAriaOffset = Math.round(deltaY * this._ratio());

        setStyle(this.scrollArea, {
            transform: `translate(0px, ${-scrollAriaOffset}px`
        });

        setStyle(this.verticalThumb, {
            transform: `translate(0px, ${deltaY}px`
        });
    }

    _onButtonClick(e) {
        const deltaY = this.deltaY || 53;

			  const positionY = this._scrollAreaCoords().y + deltaY / this._ratio();

			  this._scrollTo(0, -positionY);
			  e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    }
    _scrollbarClick(e) {
        const { target, clientY } = e;
        const className = this.verticalTrack.className;
        if (target.className.indexOf(className) === -1) return;

        const { top: targetTop } = target.getBoundingClientRect();
        const offset = Math.abs(targetTop - clientY) - this._verticalThumbHeight() / 2;

        this._scrollTo(0, offset);
    }

    _handleDrugStart(e) {
      e.stopImmediatePropagation();

      this.dragging = true;
      this._setupDragging();
    }

    _setupDragging() {
        document.addEventListener('mousemove', this._handleDrag.bind(this));
        document.addEventListener('mouseup', this._handleDragEnd.bind(this));
        document.onselectstart = () => false;
    }

    _handleDragEnd() {
        this.dragging = false;
        this.prevPageX = this.prevPageY = 0;
        this._cancelDragging();
    }

    _cancelDragging() {
      document.removeEventListener('mousemove', this._handleDrag);
      document.removeEventListener('mouseup', this._handleDragEnd);
    }

    _handleDrag(e) {
        if (this.prevPageY) {
            const { clientY } = e;
            const { top: trackTop } = this.verticalTrack.getBoundingClientRect();
            const thumbHeight = this.verticalThumb.offsetHeight;
            const clickPosition = thumbHeight - this.prevPageY;
            const offset = -trackTop + clientY - clickPosition;

            this._scrollTo(0, offset);
        }
        return false;
    }

    _handleVerticalThumbMouseDown(e) {
        const { target, clientY } = e;
        const { offsetHeight } = target;
        const { top } = target.getBoundingClientRect();

        this.prevPageY = offsetHeight - (clientY - top);
        this._scrollAreaCoords(0 , this.prevPageY);
        this._setupDragging();
    }

    _renderDomComponents() {
      this.component.appendChild(this.scrollView);
      this.component.appendChild(this.scrollBarVertical);
    }

    _setInitialStyles() {
      this.component.style.height = this._viewableHeight() + 'px';
      this.component.style.width = this._viewableWidth() + 'px';
      this.scrollView.style.width = this._viewableWidth() + 'px';
      this.verticalThumb.style.height = this._verticalThumbHeight() + 'px';
    }

    _addListeners() {
        document.onselectstart = () => false;
        this.verticalThumb.ondrugstart = () => false;

        this.component.addEventListener('wheel', this._onWheel.bind(this), false );
        this.verticalTrack.addEventListener('mousedown', this._scrollbarClick.bind(this), false);
        this.verticalThumb.addEventListener('mousedown', this._handleVerticalThumbMouseDown.bind(this), false);
        this.topButton.addEventListener('click', this._onButtonClick.bind(this), false);
    }

    resetAll () {
        this.scrollArea.style.cssText = '';
        this._totalHeight(this.scrollArea);
        this._totalWidth(this.scrollArea);
        this._viewableHeight();
        this._viewableWidth();
        this._scrollAreaCoords(0, 0);
    };

    init () {
        this.scrollView = scrollView(this.component.children[0]);
        this.scrollArea = this.scrollView.children[0];
        this.scrollBarVertical = scrollbarVertical();
        this.verticalTrack = this.scrollBarVertical.querySelector('.scrollbar-vertical__track');
        this.verticalThumb = this.scrollBarVertical.querySelector('.scrollbar-vertical__thumb');
        this.topButton = this.scrollBarVertical.querySelector('.scrollbar-vertical__button--top');
        this.bottomButton = this.scrollBarVertical.querySelector('.scrollbar-vertical__button--bottom');

        this._scrollAreaCoords(0, 0);
        this._renderDomComponents();
        this._setInitialStyles();
        this._addListeners();

        return this;
    }
}
