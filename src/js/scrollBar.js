
export class ScrollBar {
    constructor(scrollBar, scrollingContent) {
        this._scr = scrollingContent;
        this.scrollBar = scrollBar;

        this._resetAll();
    }

    _resetAll () {
        //this.scrollBar = document.querySelector(this.scrollBar); // Scrollbar-Container // parent
        this._track = document.querySelector('.scrollbar-track');
        this._handle = document.querySelector('.scrollbar-handle');

        const arrowsHeight = 0; // * 2
        const viewportHeight = this._scr.viewableHeight();
        const contentHeight = this._scr.getContentHeight();
        const viewableRatio = viewportHeight / contentHeight;

        const thumbHeight = Math.round((viewportHeight - arrowsHeight * 2) * viewableRatio);


        this._trackHeight  = this._track.offsetHeight;
        this._handleHeight = thumbHeight;

        this._coords(0, 0);

        this._handle.style.height = thumbHeight + 'px';
        this._scr.scrollElement().addEventListener('wheel', this._onWheel.bind(this) )

    }


    _ratio() {
        const contentHeight = this._scr.totalHeight() - this._scr.viewableHeight();
        const scrollBarHeight = this._track.offsetHeight - this._handle.offsetHeight;

        return (contentHeight / scrollBarHeight);
    }

    _onWheel (e) {
        e = e || window.event;

        const speedRatio = 1;
        const deltaY = e.deltaY || e.detail || e.wheelDelta;


        // this._scrollY(this._coords().y + deltaY / this._ratio());

        this._scrollY((-this._scr.coords().y + deltaY / speedRatio ) / this._ratio());

        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    }

    _scrollY (delta) {

        let y = delta;
        let height = this._trackHeight - this._handleHeight;

        if (delta > height) y = height;
        if (delta < 0) y = 0;

        this._coords(0, y);
        //this._handle.style.cssText = 0;

        Object.assign(this._handle.style,{transition: `all .3s`, transform: `translate(0, ${y}px`});

        this._scr.setElementPosition(0, -Math.round(y * this._ratio()));         // move content

    }



    _coords (x, y) {
        if (!this.coords) this.coords = {};

        if (!arguments.length) return this.coords;

        this.coords.x = x;
        this.coords.y = y;
    };

    //_getOffsetTop (node) { return node.offsetTop; }
}
