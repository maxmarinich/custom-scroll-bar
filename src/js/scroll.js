import { scrollView, scrollbarVertical } from './components';
import { setStyle, getElemHeight, getElemWidth, throttle } from './common';

export default class Scrollbar {
  constructor(props) {
    this.props = props;
    this.component = props.scrollbar
  }

  _scrollAreaWidth () {
    return getElemWidth(this.scrollArea) };

  _scrollAreaHeight () {
    return getElemHeight(this.scrollArea) };

  _componentHeight () {
    const height = this.props.height || getElemHeight(this.component);
    console.log('_componentHeight: ', height);
    return height;
  }

  _componentWidth () {
    const width = this.props.width || getElemWidth(this.component);
    console.log('_componentWidth: ', width);
    return width;
  }

  _scrollViewWidth() {
    const scrollBarVerticalWidth = this.scrollBarVertical
      ? getElemWidth(this.scrollBarVertical) : 0;

    return this.comonentWidth - scrollBarVerticalWidth;
  }

  _scrollViewHeight() {
    const scrollbarHorizontalHeight = this.scrollBarHorizontal
        ? getElemHeight(this.scrollBarHorizontal) : 0;
    
    return this.componentHeight - scrollbarHorizontalHeight;
  }

  _ratioVertical() {
    const contentHeight = this.scrollAreaHeight - this.scrollViewHeight;

    const scrollBarVerticalHeight = getElemHeight(this.verticalTrack) - getElemHeight(this.verticalThumb);
    //console.log('ratio: ', (contentHeight / scrollBarVerticalHeight));
    return (contentHeight / scrollBarVerticalHeight);
  }

  _scrollAreaCoords (x, y) {
    if (!this.areaCoords)
      this.areaCoords = {x: null , y: null};

    if (!arguments.length) return this.areaCoords;
    this.areaCoords.x = x;
    this.areaCoords.y = y;
  };

  _verticalTrackHeight() {
    return this.scrollViewHeight - this.buttonHeight * 2;
  }
  _calculateButtonsSize() {
    this.buttonWidth = 0;
    this.buttonHeight = 0;
    const { disableButtons } = this.props;

    if (!disableButtons) {
      this.buttonWidth = getElemWidth(this.scrollBarVertical.children[0]);
      this.buttonHeight = getElemHeight(this.scrollBarVertical.children[0]);
    }
  }

  _verticalThumbHeight() {
    const viewableRatio = this.scrollViewHeight / this.scrollAreaHeight;
    return Math.round((this.scrollViewHeight - this.buttonHeight * 2) * viewableRatio);
  }

  _onWheel(e = window.event) {
    if (this._isOverflow('y')) {
      this.deltaY = e.deltaY || e.detail || e.wheelDelta;
      const positionY = this._scrollAreaCoords().y + this.deltaY / this._ratioVertical();
      this._scrollTo(null, positionY);
    }
    e.preventDefault ? e.preventDefault() : (e.returnValue = false);
  }

  _scrollTo(deltaX, deltaY) {

    let trackHeight = this.verticalTrackHeight - this.verticalThumbHeight;
    let trackWidth = getElemWidth(this.verticalTrack) - getElemWidth(this.verticalThumb);

    if (deltaY < 0) deltaY = 0;
    if (deltaY > trackHeight) deltaY = trackHeight;
    if (!deltaY && deltaY !== 0) deltaY = this.areaCoords.y;

    if (deltaX < 0) deltaX = 0;
    if (deltaX > trackWidth) deltaX = trackWidth;
    if (!deltaX && deltaX !== 0) deltaX = this.areaCoords.x;

    const translateY = Math.round(deltaY * this._ratioVertical());
    const translateX = Math.round(deltaX * this._ratioVertical());

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
    const positionY = this._scrollAreaCoords().y + -deltaY / this._ratioVertical();

    this._scrollTo(null, positionY);
    e.preventDefault ? e.preventDefault() : (e.returnValue = false);
  }

  _onButtonDownClick(e) {
    const deltaY = Math.abs(this.deltaY) || 53;
    const positionY = this._scrollAreaCoords().y + deltaY / this._ratioVertical();

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

    const { top: targetTop } = target.getBoundingClientRect();
    const offset = Math.abs(targetTop - clientY) - this.verticalThumbHeight / 2;

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


  _addListeners() {
    const { disableButtons } = this.props;

    this.verticalThumb.ondrugstart = () => false;
    this._onTouchMoveThrottled = throttle(this._onTouchMove, 16);
    this._onWheelThrottled = throttle(this._onWheel, 16);

    this.component.addEventListener('wheel', this._onWheelThrottled.bind(this));
    this.component.addEventListener('keydown', this._onKeyPressHandler.bind(this));
    this.scrollArea.addEventListener('touchstart', this._onTouchStart.bind(this));
    this.scrollArea.addEventListener('touchmove', this._onTouchMoveThrottled.bind(this));
    this.verticalTrack.addEventListener('mousedown', this._scrollbarClick.bind(this));
    this.verticalThumb.addEventListener('mousedown', this._handleVerticalThumbMouseDown.bind(this));
    //window.addEventListener('resize', this._onResizeHandler.bind(this));

    if (!disableButtons) {
      this.topButton.addEventListener('click', this._onButtonTopClick.bind(this));
      this.bottomButton.addEventListener('click', this._onButtonDownClick.bind(this));
    }
  }

  _isOverflow (dir) {
    switch(true) {
      case dir === 'y':
        const overY = this.scrollView.offsetHeight < this.scrollArea.offsetHeight;
        console.log('over-y: ', overY);
        return overY;
      case dir === 'x':
        const overX = this.scrollView.offsetWidth < this.scrollArea.offsetWidth;
        console.log('over-x: ', overX);
        return overX;
        return this.scrollView.offsetWidth < this.scrollArea.offsetWidth;
      default:
        const over =  this.scrollView.offsetHeight < this.scrollArea.offsetHeight
          || this.scrollView.offsetWidth < this.scrollArea.offsetWidth;
        console.log('over: ', over);
        return over;
    }
  }


  _renderScrollBars() {
    if (this._isOverflow('y')) {
      this.component.appendChild(this.scrollBarVertical);
    }
  }

  _setInitialComponentsStyles() {
    this._calculateButtonsSize();
    this.verticalThumbHeight = this._verticalThumbHeight();
    this.scrollViewWidth = this._scrollViewWidth();
    this.verticalTrackHeight = this._verticalTrackHeight();


    setStyle(this.verticalTrack, {
      top: this.buttonHeight + 'px',
      bottom: this.buttonHeight + 'px',
      height: this.verticalTrackHeight + 'px',
    });

    setStyle(this.scrollView, {
      width: this.scrollViewWidth + 'px'
    });

    setStyle(this.verticalThumb, {
      height: this.verticalThumbHeight + 'px'
    });

  }

  _setInitialSizes() {
    this.comonentWidth = this._componentWidth();
    this.componentHeight = this._componentHeight();
    this.scrollViewWidth = this._scrollViewWidth();
    this.scrollViewHeight = this._scrollViewHeight();
    this.scrollAreaWidth = this._scrollAreaWidth();
    this.scrollAreaHeight = this._scrollAreaHeight();

    this.component.style.width = this.comonentWidth + 'px';
    this.component.style.height = this.componentHeight + 'px';
  }



  init () {
    this._scrollAreaCoords(0, 0);
    this.component.setAttribute('tabindex', '-1');
    this.scrollView = scrollView(this.component);
    this.scrollArea = this.scrollView.children[0];
    this.scrollBarVertical = scrollbarVertical(this.props.disableButtons);
    this.verticalTrack = this.scrollBarVertical.querySelector('.scrollbar-vertical__track');
    this.verticalThumb = this.scrollBarVertical.querySelector('.scrollbar-vertical__thumb');
    this.topButton = this.scrollBarVertical.querySelector('.scrollbar-vertical__button--top');
    this.bottomButton = this.scrollBarVertical.querySelector('.scrollbar-vertical__button--bottom');
    this.component.appendChild(this.scrollView);


    this._setInitialSizes();
    this._renderScrollBars();
    this._setInitialComponentsStyles();




    this._addListeners();

    return this;
  }
}
