class picker {
  constructor(canvas, ctx){
    this.canvas = canvas;
    this.ctx = ctx;
  }
  notify_unfocus(){
    for (let i = 0; i < this.trackers.length; i++) {
      this.trackers[i].focused = false;
    }
  }

  // combines all the information from trackers to get rgb value
  check_trackers(e, rect){
    // triggers for: mousedown, mousemove, wheel
    let rgbs = [];
    for (let i = 0; i < this.trackers.length; i++) {
      let in_question = this.trackers[i];
      // Returns mouseX, mouseY
      let pos = in_question.within(e, rect);
    //console.log("checking:", in_question, rect);
      if (pos) {
       // Recording where the mouse is focusing on different areas
       if (e && e.type == "mousedown") {
          // if you have a new mousedown, it must mean that your cursor must have had gone somewhere else already~
          // the default behavior is already when you unfocus on canvas, your mouse cannot come back & pick up on the same place it had been
          this.notify_unfocus();
          in_question.focused = true;
        }
        if (e && e.type != "wheel"){
          // if e.dont_scroll, use the decision above to stop tracker from updating if it is from a different element
          if (e.loose_mouse || in_question.focused) {
            in_question.move(pos);
          }
        } else {
          in_question.scroll(e, this.partitions);
        }
      }
      // all coordinates... x and y for each tracker
      rgbs = rgbs.concat(in_question.relativeGet(rect));
    }
    return this.decode(rgbs);
  }

}
class crgb extends picker {
  constructor(canvas, ctx){
  //Uncaught ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor
    super(canvas, ctx);
    this.r=0;this.g=0;this.b=0;
    this.partitions = 10;
    /* TOOD dimensions are hardcoded*/
    this.box = new cbox(canvas, ctx);
    this.box.crect_size(10, 10, 360, 360);
    this.bar = new cbar(canvas, ctx);
    this.bar.crect_size(380, 10, 40, 360);
    // this is supposed to be better usage but i'll leave both ways (direct box/bar or trackers 0 or 1) here for now
    this.trackers = [this.box, this.bar];
  }
  // normalize everything between 0 and 1
  colordecode(rgb){
    // for trackers in trackers?
    this.trackers[0].set_pos(rgb[0]/255.,rgb[1]/255.);
    this.trackers[1].set_pos(rgb[2]/255.);
  }
  draw(color=[0,0,0], dynamic=false){
    let r=color[0];//this.r;
    let g=color[1];//this.g;
    let b=0;
    let partitions = this.partitions;
    // bar
    for(let i=0;i<this.bar.h;i+=partitions){
      this.ctx.fillStyle = `rgb(${r},${g},${b})`;
      this.ctx.fillRect(this.bar.x, this.bar.y + i, partitions*3, partitions);
      b += 255/(this.bar.h/partitions);
    }
    
    b=color[2];//this.b;
    // box
    r=0;g=0;
    for (let i = 0; i < this.box.w; i += partitions) {
      for (let j = 0; j < this.box.h; j += partitions) {
        this.ctx.fillStyle = `rgb(${r},${g},${b})`;
        //console.log(box.x + i, box.y + j, partitions, partitions);
        this.ctx.fillRect(this.box.x + i,this. box.y + j, partitions, partitions);
        r += 255 / (this.box.h/partitions);
      }
      g += 255 / (this.box.w/partitions);
      r = 0;
    }
    this.box.showPointer();
    this.bar.showPointer();
  }
  decode(coords){
    // Guard against negative values when the pointer isn't set
    for (let i=0;i<coords.length;i++) {
      coords[i] = Math.max(0, coords[i]);
    }
    let x = coords[0]; let y = coords[1]; let bar = coords[3]+10;
    //console.log(x,y, bar); //281... 269.,, 10
    let r = 0, g=0,b=0;
    let psratio = 255/360; // step / partition.....
    let displace_x = 0;
    let displace_y = 0;
    
    r = y*psratio;
    g = x*psratio;
    b = bar*psratio;
    ///this.r = r;this.g=g;this.b=b;
    
    return [r,g,b];
  }

}