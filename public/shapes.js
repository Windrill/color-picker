class crect {
  constructor(canvas, ctx){
    this.scrollable = false;
    // if options.select-across-bar is not enabled, if this rect is not the target of control, then don't trigger anything
    this.focused = false;
    this.canvas = canvas;
    this.ctx=ctx;
  }
  scrollable(){
    return this.scrollable;
  }

  crect_size(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.x1 = this.x + this.w;
    this.y1 = this.y + this.h;
    this.px = x;
    this.py = y;
  }
  
  crect_range(x, y, x1, y1) {
    this.x = x;
    this.y = y;
    this.x1 = x1;
    this.y1 = y1;
    this.w = this.x1 - this.x;
    this.h = this.y1 - this.y;
    this.px = x;
    this.py = y;
  }
  
  display(color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(this.x,this.y,this.w,this.h);
  }
  
  /*
   * Returns mousex, mousey
   */
  within(event, rect) {
    let mouseX = event.clientX  - rect.left;//+ document.body.scrollLeft
    let mouseY = event.clientY - rect.top;//+ document.body.scrollTop 
    //console.log("Mouse:", mouseX, mouseY);
    //console.log("Obj:", rect.left, rect.top, rect);
    //console.log("Window", event.clientX, event.clientY, document.body.scrollLeft, document.body.scrollTop);
    if (mouseX <= this.x1 && mouseX >= this.x && mouseY <= this.y1 && mouseY >= this.y) {
      //console.log("within!", mouseX, mouseY, this.x,this.x1,this.y,this.y1);
      return [mouseX, mouseY];
      //decode(this.px-this.x, this.py-this.y, 
    }
    return false;
  }
  move(pos){
    this.px = pos[0];
    this.py = pos[1];
  }
  scroll(event, amt){

  }
  
  relativeGet() {
    return [this.px-this.x, this.py-this.y];
  }

}

class cbox extends crect {
  showPointer() {
    this.ctx.beginPath();
    this.ctx.arc(this.px, this.py, 8, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth=2;
    this.ctx.stroke();
    this.ctx.closePath();
  }

  set_pos(percenty, percentx){
    // did not add the 'adjustment' offset??? ok the offset is this.x, this.y
    this.px = percentx*this.w+this.x;
    this.py = percenty*this.h+this.y;
  }
}

class cbar extends crect {
  constructor(canvas, ctx){
    super(canvas, ctx);
    this.scrollable = true;
  }
  showPointer() {
    // pointer at height of 10, centered at this.py-5
    this.ctx.beginPath();
    this.ctx.rect(this.x , this.py - 5, this.w-9, 10);

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth=2;
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.closePath();
  }

  set_pos(percent){
    this.py = percent*this.h+this.y;
  }
  scroll(event, amt){
    // configuration that can be set later!
    if(this.scrollable && !event.dont_scroll){
      //console.log(event.deltaY);
      // how much is 'one section'???????????????????????????? and where is the negative check???
      // urgggh, native decode then
      if (event.deltaY > 0){
        // add
        this.py = Math.min(this.py+amt, this.h);
      } else {
        this.py = Math.max(this.py-amt, 0);
      }
    }
  }
}

class chorizontalbar extends crect {
  constructor(canvas, ctx){
    super(canvas, ctx);
    this.scrollable = true;

  }
  showPointer() {
  // pointer at height of 10, centered at this.py-5
    // Problem: too many boxes drawn? Solution: Remember to close your path to stop drawing!
    this.ctx.beginPath();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth=2;
    this.ctx.rect(this.px-5 , this.y, 10, this.h);
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.closePath();
  }
  set_pos(percent){
    this.px = percent*this.w+this.x;
  }
  scroll(event, amt){
    // configuration that can be set later!
    if(this.scrollable && !event.dont_scroll){
      //console.log(this.x, this.w, this.h, this.px);
      // how much is 'one section'???????????????????????????? and where is the negative check???
      // urgggh, native decode then
      if (event.deltaY > 0){
        this.px = Math.min(this.px+amt, this.w);
      } else {
        this.px = Math.max(this.px-amt, 0);
      }
    }
  }
}

