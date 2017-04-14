import { ScrollView } from './scroll';
import { ScrollBar } from './scrollBar';

const props = {
    view: '.scroll-view',
    width: null,
    height: null
};

const scrollView  = new ScrollView(props).init();

const scrollBarr = new ScrollBar("#scrollbar", scrollView, 10, 200);
//    .setParentStyle( "position: absolute; overflow: hidden; width: 100%; height: 100%");

