// maybe i shouldnt be public
// okay---- graphcis, don't store those values ()
class ccmyk extends picker{
  constructor(canvas, ctx){
    super(canvas, ctx);
    this.bar1 = new chorizontalbar(canvas, ctx);
    this.bar1.crect_size(30, 60, 360, 30);
    
    this.bar2 = new chorizontalbar(canvas, ctx);
    this.bar2.crect_size(30, 110, 360, 30);
    
    this.bar3 = new chorizontalbar(canvas, ctx);
    this.bar3.crect_size(30, 160, 360, 30);
    
    this.bar4 = new chorizontalbar(canvas, ctx);
    this.bar4.crect_size(30, 210, 360, 30);

    this.trackers = [this.bar1, this.bar2, this.bar3, this.bar4];
    this.partitions = 9.;
  }
  colordecode(rgb){
    let cmyk = rgb2cmyk(rgb[0],rgb[1],rgb[2]);
    for(let i=0;i<4;i++) {
      this.trackers[i].set_pos(cmyk[i]);
    }
  }
  // bars: 4 bars 
  draw(color=[0,0,0], dynamic = false) {
    let converted = rgb2cmyk(color[0],color[1],color[2]);
    //let c = converted[0]; let m=converted[1]; let y=converted[2]; let k=converted[3];
    let c=0;let m=0; let y=0; let k=0;
    let partitions = this.partitions;
    // the last calculated value for a colored unit
    let rgb;
    for (let i=0;i<this.bar1.w;i+=partitions){
      let myrgb = cmyk2rgb(c, this.m, this.y,this.k);
      rgb = cmyk2rgb(c,m,y,k);
      this.ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      //this.ctx.fillStyle = `rgb(${myrgb[0]},${myrgb[1]},${myrgb[2]})`;
      //console.log(rgb);
      //console.log(bars[0].x+i, bars[0].y, partitions, partitions*3);
      this.ctx.fillRect(this.bar1.x+i, this.bar1.y, partitions, this.bar1.h);
 // console.log("drawing", bars[0].x+i, bars[0].y, bars[0].w);

      c += 1./(this.bar1.w/partitions);
    }
    
    this.bar1.showPointer();
    c=0;
    if(dynamic) c = converted[0];
    for (let i=0;i<this.bar2.w;i+=partitions){
      rgb = cmyk2rgb(c,m,y,k);
      this.ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      this.ctx.fillRect(this.bar2.x+i, this.bar2.y, partitions, this.bar2.h);
      m += 1./(this.bar2.w/partitions);
    }
    m=0;
    if(dynamic) m = converted[1];
    for (let i=0;i<this.bar3.w;i+=partitions){
      rgb = cmyk2rgb(c,m,y,k);
      this.ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      this.ctx.fillRect(this.bar3.x+i, this.bar3.y, partitions, this.bar3.h);
      y += 1./(this.bar3.w/partitions);
    } 
    y=0;
        if(dynamic) y = converted[2];
    for (let i=0;i<this.bar4.w;i+=partitions){
      rgb = cmyk2rgb(c,m,y,k);
      this.ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      this.ctx.fillRect(this.bar4.x+i, this.bar4.y, partitions, this.bar4.h);
      k += 1./(this.bar4.w/partitions);
    }
    this.bar2.showPointer();
    this.bar3.showPointer();
    this.bar4.showPointer();
  }
  decod(coord) {
    return coord/360;
  }
  // rgb to coords: first, rgb to cmyk
  colorcode(r,g,b){
    cmyk = rgb2cmyk(r,g,b);
    bars[0];
  }
  
  //coords to rgb
  decode(coords) {
     //   console.log(coords);
    // Guard against negative values when the pointer isn't set
    for (let i=0;i<coords.length;i++) {
      coords[i] = Math.max(0, coords[i]);
    }
    // coords = 4 pointers, [x,y,x,y,x,y,x,y] so the indices referring to x or y should be set respecitvely
    //console.log(coords[0],coords[2],coords[4],coords[6]);
    //console.log(coords);
    // 360 = total length of the bars; coords[i] is length it is at... this/total = ratio of 1
    //let cx = coords[0]/(360/0.9), mx = coords[2]/(360/0.9), yx = coords[4]/(360/0.9), kx = coords[6]/(360/0.9);
    let cx = this.decod(coords[0]), mx = this.decod(coords[2]), yx = this.decod(coords[4]), kx = this.decod(coords[6]);
    // serves no purpose yet
    this.c = cx; this.m = mx; this.y = yx; this.k = kx;
    
    let rgb = cmyk2rgb(cx, mx, yx, kx);
    
    return rgb;
  }
}