
export class ScrollView {
    constructor(selector,
                elemWidth,
                elemHeight) {
        this.selector = selector;
        this.elemWidth = elemWidth;
        this.elemHeight = elemHeight;

        this.resetAll();
        this.stopScroll();
        this.setParentStyle(
            'position: absolute; overflow: hidden; width: 100%; height: 100%');
    }

    scrollElement () {
        return document.querySelector(this.selector);
    }

    getContentHeight() {
        return this.scrollElement().getBoundingClientRect().height;
    }

    setParentStyle (cssString) {
        const element = this.scrollElement();
        const parent = element.closest('.scrollbar-view');

        if (!arguments.length) { parent.style.cssText = ''; }

        parent.style.cssText = cssString;
        return this;
    }

    setElementPosition (x, y) {
        const element = this.scrollElement();

        if (x < this.viewableWidth() - this.totalWidth()) {
            x = this.viewableWidth() - this.totalWidth();
        }
        if (x > 0) { x = 0; }

        if (y < this.viewableHeight() - this.totalHeight()) {
            y = this.viewableHeight() - this.totalHeight()
        }
        if (y > 0) { y = 0; }

        this.coords(x, y);

        element.style.cssText =
            `transition: all .3s; transform: translate(${this.coords().x}px, ${this.coords().y}px)`;
    };


    viewableHeight (height) {
        this._viewableHeight = this.elemHeight
            || this.scrollElement().closest('.scrollbar-view').getBoundingClientRect().height;

        if (!arguments.length) return this._viewableHeight;
        this._viewableHeight = height;
    };

    viewableWidth (width) {

        this._viewableWidth = this.elemWidth
            || this.scrollElement().closest('.scrollbar-view').getBoundingClientRect().width;

        if (!arguments.length) return this._viewableWidth;
        this._viewableWidth = width;
    };

    totalWidth (el) {
        this._totalWidth = this.scrollElement().offsetWidth;

        if (!arguments.length) return this._totalWidth;
        this._totalWidth = el.offsetWidth;
    };

    totalHeight (el) {
        this._totalHeight = this.scrollElement().offsetHeight;

        if (!arguments.length) return this._totalHeight;
        this._totalHeight = el.offsetHeight;
    };

    coords (x, y) {
        if (!this._coords) this._coords = {};

        if (!arguments.length) return this._coords;
        this._coords.x = x;
        this._coords.y = y;
    };

    scrollBy (x, y) {
        const _x = this.coords().x + x;
        const _y = this.coords().y + y;

        this.stopScroll();
        this.scrollTimer = window.setInterval(
            () =>  this.setElementPosition(_x, _y), 40);
    };

    scrollTo (x, y) {
        console.log('from scroll: ', this.coords().y, y);
        const _x = this.coords().x + x;
        const _y = this.coords().y + y;

        this.setElementPosition(-_x, -_y);
    };

    stopScroll () {
        if (this.scrollTimer) {
            window.clearInterval(this.scrollTimer);
        }
    };

    resetAll () {
        const element = this.scrollElement();

        element.style.cssText = '';
        this.totalHeight(this.scrollElement());
        this.totalWidth(this.scrollElement());
        this.viewableHeight();
        this.viewableWidth();
        this.coords(0, 0);
    };

}
