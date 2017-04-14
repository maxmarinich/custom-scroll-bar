import setStyle from './common';


export class ScrollView {
    constructor(props) {
        this.props = props;
        this.scrollView = this.view();
        this.scrollArea = this.area();
    }

    view () {
        return document.querySelector(this.props.view); }

    area () {
        return this.scrollView.children[0]; }

    areaHeight() {
        return this.scrollArea.getBoundingClientRect().height; }

    scrollTo (x, y) {

        if (x < this.viewableWidth() - this.totalWidth()) {
            x = this.viewableWidth() - this.totalWidth();
        }
        if (x > 0) { x = 0; }

        if (y < this.viewableHeight() - this.totalHeight()) {
            y = this.viewableHeight() - this.totalHeight()
        }
        if (y > 0) { y = 0; }

        this.areaCoords(x, y);

        Object.assign(this.scrollArea.style, {
            transition: 'all .3s',
            transform: `translate(${x}px, ${y}px`
        });
    };

    viewableHeight () {
        return this.props.height
            || this.scrollView.getBoundingClientRect().height;
    };

    viewableWidth () {
        return this.props.width
            || this.scrollView.getBoundingClientRect().width;
    };

    totalWidth (el) {
        this._totalWidth = this.scrollArea.offsetWidth;

        if (!arguments.length) return this._totalWidth;
        this._totalWidth = el.offsetWidth;
    };

    totalHeight (el) {
        this._totalHeight = this.scrollArea.offsetHeight;

        if (!arguments.length) return this._totalHeight;
        this._totalHeight = el.offsetHeight;
    };

    areaCoords (x, y) {
        if (!this._coords) this._coords = {x: null , y: null};

        if (!arguments.length) return this._coords;
        this._coords.x = x;
        this._coords.y = y;
    };

    scrollBy (x, y) {
        const _x = this.areaCoords().x + x;
        const _y = this.areaCoords().y + y;

        this.stopScroll();
        this.scrollTimer = window.setInterval(
            () =>  this.scrollTo(_x, _y), 40);
    };
    
    stopScroll () {
        if (this.scrollTimer) {
            window.clearInterval(this.scrollTimer);
        }
    };

    resetAll () {
        this.scrollArea.style.cssText = '';
        this.totalHeight(this.scrollArea);
        this.totalWidth(this.scrollArea);
        this.viewableHeight();
        this.viewableWidth();
        this.areaCoords(0, 0);
    };

    init () {
        this.resetAll();
        this.scrollView.style.cssText =
            'position: absolute; overflow: hidden; width: 100%; height: 100%';

        return this;
    }
}
