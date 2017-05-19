import ScrollView from './scroll';
import { ScrollBar } from './scrollBar';

const view = document.querySelector('.scrollbar');

new ScrollView({ view, width: null, height: 150 }).init();

//const scrollBarr = new ScrollBar("#scrollbar", scrollView, 100, 200);
//    .setParentStyle( "position: absolute; overflow: hidden; width: 100%; height: 100%");


