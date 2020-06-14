// input: h in [0,360] and s,v in [0,1] - output: r,g,b in [0,1]
function hsl2rgb(h,s,l) 
{
  let a=s*Math.min(l,1-l);
  let f= (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1);                 
  return [f(0),f(8),f(4)];
}   

// in: r,g,b in [0,1], out: h in [0,360) and s,v in [0,1]
function rgb2hsl(r,g,b) 
{
  let a=Math.max(r,g,b), n=a-Math.min(r,g,b), f=(1-Math.abs(a+a-n-1)); 
  let h= n && ((a==r) ? (g-b)/n : ((a==g) ? 2+(b-r)/n : 4+(r-g)/n)); 
  return [60*(h<0?h+6:h), f ? n/f : 0, (a+a-n)/2];
} 

function hexToRgb(c){
  c = c.substring(1);      // strip #
  let rgb = parseInt(c, 16);   // convert rrggbb to decimal
  let r = (rgb >> 16) & 0xff;  // extract red
  let g = (rgb >>  8) & 0xff;  // extract green
  let b = (rgb >>  0) & 0xff;  // extract blue
  return [r,g,b];
}

function componentToHex(c) {
  var hex = parseInt(c).toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
//cmyk
function cmyk2rgb(c,m,y,k){
  let r = 255.*(1-c)*(1-k);
  let g = 255.*(1-m)*(1-k);
  let b = 255.*(1-y)*(1-k);
  return [r,g,b];
}
function rgb2cmyk(r,g,b){
  // btw this doesnt trigger ,,, why????
  if (r == 0 && g == 0 && b == 0){
    return [0,0,0,0];
  }
  let rr = r/255., gg=g/255., bb=b/255.;
  let k = 1.-Math.max(rr,gg,bb);
  let c = (1.-rr-k)/(1.-k);
  let m = (1.-gg-k)/(1.-k);
  let y = (1.-bb-k)/(1.-k);
  return [c,m,y,k];
}