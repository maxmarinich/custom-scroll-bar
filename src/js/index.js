import Scrollbar from './scroll';
import { ScrollBar } from './scrollBar';

const scrollbar = document.querySelector('.scrollbar');

new Scrollbar({ scrollbar, width: null, height: 200, disableButtons: true }).init();

//const scrollBarr = new ScrollBar("#scrollbar", scrollView, 100, 200);
//    .setParentStyle( "position: absolute; overflow: hidden; width: 100%; height: 100%");


