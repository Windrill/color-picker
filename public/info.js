// type to graphics... cannot just be too unique..
///
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

class info {
  constructor(outer, inner, cb=undefined){
    this.cb = cb;
    this.outer = outer;
    this.inner = inner;

    this.validation = new Array(this.inner.length);
    this.touched = false;
    this.passing = true; // when to know if it fails?----1 & 2 & 3? when to know if it passes
  }

  checkhex(ele, i){
    ele.onblur = check(this, ele, i);
    function check(context, ele, i){
      return function(e){
        let hexval = ele.value;
        let hexes = hexToRgb(hexval)
        let res = hexes.map((ele, idx)=>ele>=0 && ele<=255);
        //console.log(hexToRgb(x), res);
        //console.log(hexes, res);
        if (hexval.length == 7 && hexval[0] == "#" && res.every((r)=>r)){
          //console.log(hexval);
          ele.classList.remove('error-border');
          context.validation[i] = true;

          context.cb(context.get(), true);

        } else {
          ele.classList.add('error-border');
          context.validation[i] = false;
        }
      }
    }
  }
  // register on-'blur': checking
  checknumber(ele, rangefunc, i){
    ele.onblur = check(this, ele, i);
    function check(context, ele, i){
      return function(e){
        let val = ele.value;
        // Input Validation
        if(val && isNumeric(val) && rangefunc(val)){
            ele.classList.remove('error-border');
            context.validation[i] = true;
          // if all colors are okay, update the color
          if (context.validation.reduce((a,b)=>a&&b, true)){
            let result = context.get();
            //if (result == undefined) {

            //} else {
              context.cb(context.get());
            //}
          }
        } else {
          ele.classList.add('error-border');
          context.validation[i] = false;
        }
      }
    }
  }

}

class icmyk extends info{
  constructor(outer, inner, cb){
    super(outer, inner, cb);
    for (let i=0;i<inner.length;i++){
      this.checknumber(inner[i], x=>x>=0&&x<=1, i);
    }
    this.outer.style="display:block;";
  }
  show(rgb){
    let cmyk = rgb2cmyk(rgb[0],rgb[1],rgb[2]);
    for (let i=0;i<4;i++){
      this.inner[i].value = (cmyk[i]).toFixed(4);
      //this.inner[i].setAttribute("value",(cmyk[i]).toFixed(4));
    }
  }
  hide(){
    this.outer.style="display:none;";
  }
  get(){
    let cmyk = [];
    for (let i=0;i<4;i++){
      cmyk.push(parseFloat(this.inner[i].value));
    }
    ///console.log(cmyk, cmyk2rgb(cmyk[0], cmyk[1], cmyk[2], cmyk[3]));
    return cmyk2rgb(cmyk[0], cmyk[1], cmyk[2], cmyk[3]);
  }
}

class irgb extends info{
  constructor(outer, inner, cb){
    super(outer, inner, cb);
    this.outer.style="display:block;";

    for (let i=0;i<inner.length;i++){
      this.checknumber(inner[i], x=>x>=0&&x<=255, i);
    }
  }
  show(rgb){
    for (let i=0;i<3;i++){
      (this.inner[i]).value=parseInt(rgb[i]);
      //(this.inner[i]).setAttribute("value",parseInt(rgb[i]));
    }
  }
  hide(){
    this.outer.style="display:none;";
  }
  get(){
    let rgb = [];
    for (let i=0;i<3;i++){
      rgb.push(this.inner[i].value);
    }
    return rgb;
  }
}
// stupid block always update from 'nweest color'
class ihex extends info {
  constructor(outer, inner, cb){
    super(outer, inner, cb);
    this.checkhex(outer, 0);

  }

  show(rgb){ //document.getElementById('hex')
    this.hex = rgbToHex(rgb[0],rgb[1],rgb[2]);
    this.outer.setAttribute("value",this.hex);
  }
  get(){
    return this.outer.value;
  }
}

class icomblock extends info {
  constructor(outer, inner, cb){
    super(outer, inner, cb);
    this.cb = cb;
    this.outer.onclick = function x (icom) { return function(e){
      icom.cb(icom.get());
    }}(this);
  }
  show(rgb){
  // don't directly use this
  // have an agreed upon code system.... eg: 'value=elememnt-complementary'
    this.outer.style.backgroundColor = `rgb(${255-rgb[0]},${255-rgb[1]},${255-rgb[2]})`;
    this.rgb = [255-rgb[0], 255-rgb[1], (255-rgb[2])];
  }
  get(){ return this.rgb; }
}

class iblock extends info {
  constructor(outer, inner, cb){
    super(outer, inner, cb);
    this.cb = cb;
    this.outer.onclick = function x (icom) { return function(e){
      icom.cb(icom.get());
    }}(this);
  }
  show(rgb){
    this.outer.style.backgroundColor = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
    this.rgb = [parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2])];
  }
  get(){ return this.rgb; }
}

class cblock{
  constructor(outer, inner, cb){ // cb = controller.control
    this.outer = outer;
    this.inner = inner;
    this.cb = cb;
//    console.log(this.inner[0][0]);
    let inn = this.inner[0][1];
    // wo ri!!!!! this,inner[0][1] versus this.inner!!! my code was orrect!!!
    this.ichild = new irgb(this.inner[0][0], this.inner[0][1], cb);
    this.lastRgb = [];
    this.lastName = "";

    //let info_dropdown = document.getElementById("all_types");
    this.outer.addEventListener('change', 
      e => { // the callback that's supposed to be returned is the event itself!
        this.listen();
      }
      ,false);
  }
  listen(){
    if(this.lastName == this.outer.value){
      return;
    }
    switch (this.outer.value){
      case 'rgb':
        this.ichild.hide();
        this.ichild = new irgb(this.inner[0][0], this.inner[0][1], this.cb);
        break;
      case 'cmyk':
        this.ichild.hide();
        this.ichild = new icmyk(this.inner[1][0], this.inner[1][1], this.cb);
        break;
      default:
        break;
    }
    this.lastName = this.outer.value;
    this.show(this.lastRgb);
  }
  show(rgb){
    if(rgb.length < 1){
      return;
    }
    this.lastRgb = rgb;
    this.ichild.show(rgb);
  }
}
