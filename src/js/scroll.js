import { scrollView, scrollbarVertical } from './components';
import { setStyle, getElemHeight, getElemWidth, throttle } from './common';

export default class Scrollbar {
    constructor(props) {
        this.props = props;
        this.component = props.view
    }

	  _totalWidth () {
		    return getElemWidth(this.scrollArea) };

	  _totalHeight () {
		    return getElemHeight(this.scrollArea) };

    _viewableHeight () {
        return this.props.height || getElemHeight(this.component) };

    _viewableWidth () {
        return this.props.width || getElemWidth(this.component) };

    _viewWidth() {
        return this._viewableWidth() - getElemWidth(this.scrollBarVertical) }

    _viewHeight() {
        return this._viewableHeight() - getElemHeight(this.scrollBarHorizontal) }

    _ratio() {
        const contentHeight = this._totalHeight() - this._viewHeight();
        const scrollBarVerticalHeight =
            getElemHeight(this.verticalTrack) - getElemHeight(this.verticalThumb);

        return (contentHeight / scrollBarVerticalHeight);
    }

    _scrollAreaCoords (x, y) {
        if (!this.areaCoords)
            this.areaCoords = {x: null , y: null};

        if (!arguments.length) return this.areaCoords;
        this.areaCoords.x = x;
        this.areaCoords.y = y;
    };

    _verticalThumbHeight() {
        const arrowHeight = getElemHeight(this.scrollBarVertical.children[0]);
        const viewableRatio = this._viewHeight() / this._totalHeight();

        return Math.round((this._viewHeight() - arrowHeight * 2) * viewableRatio);
    }

    _isOverflow (dir) {
        switch(true) {
            case dir === 'y':
							  return this.scrollView.offsetHeight < this.scrollArea.offsetHeight;
            case dir === 'x':
                return this.scrollView.offsetWidth < this.scrollArea.offsetWidth;
            default:
                return (
                    this.scrollView.offsetHeight < this.scrollArea.offsetHeight
							      || this.scrollView.offsetWidth < this.scrollArea.offsetWidth
                );
        }
    }

    _onWheel(e = window.event) {
        if (this._isOverflow('y')) {
					  this.deltaY = e.deltaY || e.detail || e.wheelDelta;
					  const positionY = this._scrollAreaCoords().y + this.deltaY / this._ratio();

					  this._scrollTo(null, positionY);
        }
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    }

    _scrollTo(deltaX, deltaY) {

        let trackHeight = getElemHeight(this.verticalTrack) - getElemHeight(this.verticalThumb);
        let trackWidth = getElemWidth(this.verticalTrack) - getElemWidth(this.verticalThumb);

        if (deltaY > trackHeight) deltaY = trackHeight;
			  if (!deltaY) deltaY = this.areaCoords.y;
        if (deltaY < 0) deltaY = 0;

        if (deltaX > trackWidth) deltaX = trackWidth;
			  if (!deltaX) deltaX = this.areaCoords.x;
        if (deltaX < 0) deltaX = 0;

        const translateY = Math.round(deltaY * this._ratio());
        const translateX = Math.round(deltaX * this._ratio());

			  this._scrollAreaCoords(deltaX, deltaY);

        setStyle(this.scrollArea, {
            transform: `translate(${translateX}, ${-translateY}px`
        });

        setStyle(this.verticalThumb, {
            transform: `translate(${deltaX}, ${deltaY}px`
        });
    }

    _onTouchStart(e) {
        this.toucStartY = e.changedTouches[0].clientY;
			  this.areaClientY = this._scrollAreaCoords().y;

        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    }

    _onTouchMove(e) {
        const touch = e.changedTouches[0].clientY;
        const touchDistance = touch - this.toucStartY;

        if (Math.abs(touchDistance) < 5) return;

        let position = parseInt((this.areaClientY + touchDistance));

        this._scrollTo(null, position);
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    }

    _onButtonTopClick(e) {
        const deltaY = Math.abs(this.deltaY) || 53;
        const positionY = this._scrollAreaCoords().y + -deltaY / this._ratio();

        this._scrollTo(null, positionY);
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    }

    _onButtonDownClick(e) {
        const deltaY = Math.abs(this.deltaY) || 53;
			  const positionY = this._scrollAreaCoords().y + deltaY / this._ratio();

			  this._scrollTo(null, positionY);
			  e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    }

    _onKeyPressHandler(e) {
        // left 37, right 39
        switch(e.keyCode) {
            case 38:
                this._onButtonTopClick(e);
                break;
            case 40:
                this._onButtonDownClick(e);
                break;

        }
			  e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    }

    _scrollbarClick(e) {
        const { target, clientY } = e;
        const className = this.verticalTrack.className;
        if (target.className.indexOf(className) === -1) return;
//        console.log(className);

        const { top: targetTop } = target.getBoundingClientRect();
        const offset = Math.abs(targetTop - clientY) - this._verticalThumbHeight() / 2;

        this._scrollTo(null, offset);
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
            const thumbHeight = getElemHeight(this.verticalThumb);
            const clickPosition = thumbHeight - this.prevPageY;
            const offset = -trackTop + clientY - clickPosition;

            this._scrollTo(null, offset);
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

        if (this._isOverflow('y')) {
					  this.component.appendChild(this.scrollBarVertical);
					  this.verticalThumb.style.height = this._verticalThumbHeight() + 'px';

            this.scrollView.style.width = this._viewWidth() + 'px';
            this.scrollView.style.height = this._viewHeight() + 'px';
        }


    }

    _setInitialStyles() {
			  this.scrollView.style.width = this._viewWidth() + 'px';
			  this.scrollView.style.height = this._viewHeight() + 'px';
			  this.component.style.width = this._viewableWidth() + 'px';
        this.component.style.height = this._viewableHeight() + 'px';
    }

    _onResizeHandler() {

			  this.scrollView.style = '';
			  this.component.style = '';
			  this._setInitialStyles();

        if (this._isOverflow('y')) {
            this.component.appendChild(this.scrollBarVertical);
            this.verticalThumb.style.height = this._verticalThumbHeight() + 'px';
        } else {
            this.component.removeChild(this.scrollBarVertical);
        }

        this._scrollAreaCoords(0,0);
        this._scrollTo(0,0);

    }

    _addListeners() {
        this.verticalThumb.ondrugstart = () => false;
			  this._onTouchMoveThrottled = throttle(this._onTouchMove, 16);
			  this._onWheelThrottled = throttle(this._onWheel, 16);

        this.component.addEventListener('wheel', this._onWheelThrottled.bind(this));
        this.component.addEventListener('keydown', this._onKeyPressHandler.bind(this));
        this.scrollArea.addEventListener('touchstart', this._onTouchStart.bind(this));
        this.scrollArea.addEventListener('touchmove', this._onTouchMoveThrottled.bind(this));
        this.topButton.addEventListener('click', this._onButtonTopClick.bind(this));
        this.bottomButton.addEventListener('click', this._onButtonDownClick.bind(this));
        this.verticalTrack.addEventListener('mousedown', this._scrollbarClick.bind(this));
        this.verticalThumb.addEventListener('mousedown', this._handleVerticalThumbMouseDown.bind(this));
        window.addEventListener('resize', this._onResizeHandler.bind(this));
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
        this.component.setAttribute('tabindex', '-1');
        this.scrollView = scrollView(this.component.children[0]);
        this.scrollArea = this.scrollView.children[0];
        this.scrollBarVertical = scrollbarVertical();
        this.verticalTrack = this.scrollBarVertical.querySelector('.scrollbar-vertical__track');
        this.verticalThumb = this.scrollBarVertical.querySelector('.scrollbar-vertical__thumb');
        this.topButton = this.scrollBarVertical.querySelector('.scrollbar-vertical__button--top');
        this.bottomButton = this.scrollBarVertical.querySelector('.scrollbar-vertical__button--bottom');

        this._scrollAreaCoords(0, 0);
			  this._setInitialStyles();
        this._renderDomComponents();


        this._addListeners();

        return this;
    }
}
