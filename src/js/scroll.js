import { scrollView, scrollbarVertical } from './components';
import { setStyle, getElemHeight, getElemWidth, throttle } from './common';

export default class Scrollbar {
    constructor(props) {
        this.props = props;
        this.component = props.view
    }

    _viewableHeight () {
        return this.props.height || getElemHeight(this.scrollView);
    };

    _viewableWidth () {
        return this.props.width || getElemWidth(this.scrollView);
    };

    _viewWidth() {
			  return this._viewableWidth() - getElemWidth(this.scrollBarVertical);
    }

    _viewHeight() {
        return this._viewableHeight() - getElemHeight(this.scrollBarHorizontal);
    }

    _totalWidth () {
        //return this.scrollArea.offsetWidth;
			getElemWidth(this.scrollArea);
    };

    _totalHeight () {
        return this.scrollArea.offsetHeight;
    };

    _ratio() {
        const contentHeight = this._totalHeight() - this._viewHeight();
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
        const viewableRatio = this._viewHeight() / this._totalHeight();

        return Math.round((this._viewHeight() - arrowsHeight * 2) * viewableRatio);
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

    _onFocus() {
        console.log('focused')
    }

    _scrollTo(deltaX, deltaY) {

        let trackHeight = this.verticalTrack.offsetHeight - this.verticalThumb.offsetHeight;

        if (deltaY > trackHeight) deltaY = trackHeight;
        if (deltaY < 0) deltaY = 0;


        const scrollAriaOffset = Math.round(deltaY * this._ratio());

        setStyle(this.scrollArea, {
            transform: `translate(0, ${-scrollAriaOffset}px`
        });

        setStyle(this.verticalThumb, {
            transform: `translate(0, ${deltaY}px`
        });
			  this._scrollAreaCoords(0, deltaY);

    }

    _onTouchStart(e) {
        this.toucStartY = e.changedTouches[0].clientY;
			  this.areaClientY = this._scrollAreaCoords().y;

        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    }

    _onTouchMove(e) {
        const touch = e.changedTouches[0].clientY;
        const touchDistance = touch - this.toucStartY;

        if(Math.abs(touchDistance) < 5) return;

        let position = parseInt((this.areaClientY + touchDistance));

        this._scrollTo(0, position);
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    }

    _onButtonTopClick(e) {
        const deltaY = Math.abs(this.deltaY) || 53;
        const positionY = this._scrollAreaCoords().y + -deltaY / this._ratio();

        this._scrollTo(0, positionY);
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    }

    _onButtonDownClick(e) {
        const deltaY = Math.abs(this.deltaY) || 53;
			  const positionY = this._scrollAreaCoords().y + deltaY / this._ratio();

			  this._scrollTo(0, positionY);
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
			document.onselectstart = () => true;
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
      this.scrollView.style.width = this._viewWidth() + 'px';
      this.scrollView.style.height = this._viewHeight() + 'px';
      this.verticalThumb.style.height = this._verticalThumbHeight() + 'px';
    }

    _addListeners() {
        this.verticalThumb.ondrugstart = () => false;
			  this._onTouchMoveThrottled = throttle(this._onTouchMove, 16);

        this.component.addEventListener('wheel', this._onWheel.bind(this));
        this.component.addEventListener('focus', this._onFocus.bind(this), true);
        this.scrollArea.addEventListener('touchstart', this._onTouchStart.bind(this));
        this.scrollArea.addEventListener('touchmove', this._onTouchMoveThrottled.bind(this));
        this.topButton.addEventListener('click', this._onButtonTopClick.bind(this));
        this.bottomButton.addEventListener('click', this._onButtonDownClick.bind(this));
        this.verticalTrack.addEventListener('mousedown', this._scrollbarClick.bind(this));
        this.verticalThumb.addEventListener('mousedown', this._handleVerticalThumbMouseDown.bind(this));
    }

    resetAll () {
        this.scrollArea.style.cssText = '';
        //this._totalHeight(this.scrollArea);
        //this._totalWidth(this.scrollArea);
        this._viewableHeight();
        this._viewableWidth();
        this._viewHeight();
        this._viewWidth();
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
