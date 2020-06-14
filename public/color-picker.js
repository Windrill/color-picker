let width;
let height;
let mouseDown = false;

function event_select_history(controller, ele) {
    ele.select = !ele.select;
    if(ele.select) {
      let color_str = ele.style.background;
      let dynamic_rgb = (color_str.substring(4, (color_str.length)-1)).split(",");
      history_highlight(ele);
      ele.color = dynamic_rgb;
      let different_color = (dynamic_rgb.map((el,idx)=>{
        return el==controller.color[idx];
      }));
      ///console.log(different_color, controller.last_history);
      different_color=different_color.every((val)=>val);
      //console.log(different_color, controller.last_history);

      //if (controller.options.add_history && controller.last_history >=0 && controller.history[controller.last_history].select != true){
        // did this need to happen? no unless saving isn't automatic then can happen
        // auto-adding would not need this functionality
        // fine, still disabling by default. too clunky to use
      /*if(!controller.options.add_history && controller.clicked_on_tracker) {
        controller.create_history(controller.color, controller.history.length);
        controller.clicked_on_tracker = false;
      }*/
      //}
      if (controller.last_history >= 0 && controller.last_history!=ele.index) {
        ///console.log("yes unselecting you", ele.index, controller.last_history,   controller.history[controller.last_history].select);
        controller.history[controller.last_history].select = false;
        controller.history[controller.last_history].style.border = "0px";
      }
      // 3. paint this color where you need it to be!!
      // then you set the last history to you!!
      ///console.log("Index:", ele.index, dynamic_rgb);
      controller.last_history = ele.index;
      controller.control(dynamic_rgb);

      controller.plate.colordecode(controller.color);
    } else{
      ele.style.border = "0px";
    }

}

/*
function mousefunc(es) {
  console.log("firast run");
  mouseDown = true;
  return (function(e) {
    es.check_trackers(e);
  });
}*/
// UTILS
async function window_alert(func, prompt="Are you sure?"){
  document.body.classList.add("disabled");
  let result = 
  new Promise(function(resolve, reject) {
    setTimeout(function(){
    let confirmed = window.confirm(prompt);
    document.body.classList.remove("disabled");
    if(confirmed){
      func();
    }
      resolve(confirmed);
  },15);
})
  return result;
}

// Deals with html element <color>, adds a border to it (for history)
function history_highlight(ese, dynamic_rgb=undefined){
  let border = "red";
  if(dynamic_rgb){
    dynamic_rgb = dynamic_rgb.map(x=>parseFloat(x));
    let cr = 255-dynamic_rgb[0];
    let cg = 255-dynamic_rgb[1];
    let cb = 255-dynamic_rgb[2];
    border =`rgb(${cr},${cg},${cb})`;
  } else {
    ese.style.border = `2px solid ${border}`;
  }

}

class controller {
  load() {
   return new Promise(function(resolve, reject) {
    window.onload = resolve;
    });
  }

  color_equal(a,b){    
    let diff = (a.map((ele,idx)=>{return ele==b.color[idx];}))
    return diff.every((val)=>val);
  }

  // yeah check_trackers triggers every time you click/move-on-click/do such an operation
  check_trackers(e) {
    if (this.options.loose_mouse){
      e.loose_mouse = true;
    }
    //console.log("why aren't you slamming the brake? ", this.last_history, this.history.length);

    // record positions of all tracker in the trackers...
    // remember to change the rect when resizing TODO
    let rgb = this.plate.check_trackers(e, this.rect);
    if(this.last_history != -1){
      ///console.log("stopping this historical nonsense");
      this.history[this.last_history].select = false;
      this.history[this.last_history].style.border = "0px";
      this.last_history = -1;
    }
    this.clicked_on_tracker = true; // clicked on tracker, then you need to save history. simple as that/
    this.control(rgb);
  } //end check_trackers
  //changes tracker AND does control!!
  recv_color(rgb, hex=false){
    if (hex) {
      rgb = hexToRgb(rgb);
    }
    ///console.log("ok ", rgb, hex);
    this.plate.colordecode(rgb);
    this.control(rgb);
  }

  // the thing that does everything eh i guess
  control(rgb){
    this.color = rgb;
    for (let i=0;i<this.infos.length;i++){
      this.infos[i].show(rgb);
    }
  }
  load_history_addbtn(){
    let history_add  = document.getElementById("history_add");
    //if (this.options.add_history) {
    //  history_add.style.display = "none";
    //} else {
    // i'm going to leave this button 'on' so that you can add a history button if you'd like, and submitting the options form doesnt need reloading buttons
    history_add.style.display = "block";
    history_add.onclick = function(controller){
      return (e) => {
        controller.create_history(controller.color, controller.history.length);          
      }
    }(this);
    //}
  }
  /*
      while(h = this.history.pop()){
        h.parentNode.removeChild(h);
      }
      localStorage.removeItem("colorpick_history");
      // //
  ./*/
  deferred(){
    let history_remove = document.getElementById("history_remove");
    history_remove.onclick = function(controller) {
    return function(e){
    // fine, do the fucking indexing.
    //  console.log("im not even going to use my own indexing", this.parentNode.childElementCount);
    if(controller.last_history >= 0) {
      // change cache around
      let cached_history = (localStorage.getItem("colorpick_history")).split(",");
      ///console.log("sanity check", cached_history, cached_history.length, cached_history[cached_history.length-1].length == 0);
      if (cached_history[cached_history.length-1].length == 0) {
        cached_history = cached_history.slice(0,cached_history.length-1);
      }
      // last bit is an array
      let last_bit = ((controller.last_history*3)+3 < cached_history.length) ? cached_history.slice((controller.last_history*3)+3) : [];
      cached_history = cached_history.slice(0,(controller.last_history*3)).concat(last_bit); // if last bit is "", I will automatically remove it a few lines on top so no prob
      // console.log("wtf math", (controller.last_history*3)+3 < cached_history.length, 
      //   (controller.last_history*3)+3, 
      //   cached_history.length);
      // console.log("hmmm", cached_history.slice(0,(controller.last_history*3)), "\n",last_bit);
      // // then, change....your own history, then remove the element too!!
      
      localStorage.removeItem("colorpick_history");
      localStorage.setItem("colorpick_history", cached_history.join(",").concat(","));
      // actually, index ..........might be actually 'unique id's, movign them will moev the position in html child, so don't reindex them, just remove them (until page reload)
      let h = controller.history[controller.last_history];

      for (let i=controller.last_history+1;i<controller.history.length;i++){
        controller.history[i].index--;
        ///console.log(controller.history[i].index);
      }
      h.parentNode.removeChild(h);
      // therefore, don't remoev history.......can just point it to null...hmm! it's no longer accessible, so yeah
      //controller.history[controller.last_history] = null;
      ///console.log("last hist??? ", controller.last_history, controller.history.slice(controller.last_history+1));
      controller.history = controller.history.slice(0,controller.last_history).concat(controller.history.slice(controller.last_history+1));
      // haha, quickly select the next one 
      if (controller.last_history < controller.history.length) {
        event_select_history(controller, controller.history[controller.last_history]);
      }
      else {
        controller.last_history = -1;
      }
      // need to add a tailing ""....? to allow comma to be added on add_history?
      if (cached_history.length == 0 || cached_history[cached_history.length-1].length != 0) {
        cached_history.push("");
      }
      //console.log("ok processed.", cached_history,cached_history.length);
  }
  }
    }(this);

    this.load_history_addbtn();
    let history_clear = document.getElementById("history_clear");
    history_clear.onclick = function(controller) {
      return function(e){
        // Speaking of logic reading inwards
        if (controller.options.color_confirmation) {
          //if (!controller.history.length) return;
          window_alert((controller.clear_history).bind(controller), prompt="Clear all history?");
        } else {
          controller.clear_history();
        } // end options color_confirmation
      }
    }(this);

    let history_save = document.getElementById("history_save");
    history_save.onclick = onsave_func(this, history_save);
    function onsave_func(controller, button) {
      return function(e){
        let sz=40;
        let col =  10;
        let num_colors = (controller.history).length;
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext('2d');

        let large = 200;
        let largecol = 6;

          if (controller.options.save_style  == 1) {
            canvas.width = sz*col;
            canvas.height = Math.floor((num_colors+col-1)/col)*sz;
          } else if (controller.options.save_style  == 0) {

            canvas.width = large*largecol;
            canvas.height = Math.floor((num_colors+largecol-1)/largecol)*large;
          }
        ///console.log(controller.options.save_style);
        let textinfo = "";
        for (let i =0;i<num_colors;i++){ //.color <- as an array
          if (controller.options.save_style  == 2) {

            let color_str = (controller.history[i]).style.background;
            let dynamic_rgb = (color_str.substring(4, (color_str.length)-1)).split(",");
            dynamic_rgb = dynamic_rgb.map(x=>parseFloat(x));
            textinfo += rgbToHex(dynamic_rgb[0], dynamic_rgb[1], dynamic_rgb[2])+"\n";// + "\n";

          } else if (controller.options.save_style  == 1) {
            let color_str = (controller.history[i]).style.background;
            let dynamic_rgb = (color_str.substring(4, (color_str.length)-1)).split(",");
            dynamic_rgb = dynamic_rgb.map(x=>parseFloat(x));

            ctx.fillStyle = `rgb(${dynamic_rgb[0]},${dynamic_rgb[1]},${dynamic_rgb[2]})`;
            ctx.strokeStyle = "";
            ctx.fillRect((i%col)*sz, Math.floor(i/col)*sz, sz, sz);
          } else if (controller.options.save_style  == 0) {
            let color_str = (controller.history[i]).style.background;
            let dynamic_rgb = (color_str.substring(4, (color_str.length)-1)).split(",");
            dynamic_rgb = dynamic_rgb.map(x=>parseFloat(x));

            ctx.fillStyle = `rgb(${dynamic_rgb[0]},${dynamic_rgb[1]},${dynamic_rgb[2]})`;
            ctx.strokeStyle = "";
            //console.log("save rect", i*large, Math.floor(i/largecol)*large, dynamic_rgb);
            ctx.fillRect((i%largecol)*large, Math.floor(i/largecol)*large, large, large);
            let luma = 0.2126 * dynamic_rgb[0] + 0.7152 * dynamic_rgb[1] + 0.0722 * dynamic_rgb[2]; // per ITU-R BT.709
            //let hsl = rgb2hsl(dynamic_rgb[0], dynamic_rgb[1], dynamic_rgb[2]);
            let textcolor;
            //console.log("save color:", luma, dynamic_rgb, hsl);
            if (luma < 50) {
              textcolor = [255,255,255];
              //hsl[2] = Math.min(360,hsl[2] + luma*1);
            } else {
              textcolor = [0,0,0];
              //hsl[2] = Math.max(0,hsl[2] - luma*.5); //luminance is by degree
            }
            //let textcolor = hsl2rgb(hsl[0],hsl[1],hsl[2]);
            ctx.fillStyle = `rgb(${textcolor[0]},${textcolor[1]},${textcolor[2]})`;
            ctx.font = "32px arial";//sans-serif
            ctx.fillText(rgbToHex(dynamic_rgb[0], dynamic_rgb[1], dynamic_rgb[2]),//.toUpperCase(),
              (i%largecol)*large+2, Math.floor(i/largecol)*large+198);
          }
        }

          // forced download on chrome and ff
          let d = new Date();
          function pad(num){
            return num >= 10 ? `${num}`:`0${num}`;
          }

        if(controller.options.save_style == 2) {
          let color_option = "color_hex";
          button.download = `${color_option}_${pad(d.getDate())}${pad(d.getMonth()+1)}${pad(d.getYear()%100)}_${num_colors}.txt`;
          let blob = new Blob([textinfo], {type: 'text/csv;charset=utf-8'});
          //let blob = new Blob([JSON.stringify(textinfo, undefined, 2)], {type:'text/plain'});
          button.href = window.URL.createObjectURL(blob);
        } else {
          let color_option = controller.options.save_style == 1 ? "color_blocks" : "color_large_icons";
          //${pad(d.getUTCHours()+8)}${pad(d.getUTCMinutes())}_
          history_save.download = `${color_option}_${pad(d.getDate())}${pad(d.getMonth()+1)}${pad(d.getYear()%100)}_${num_colors}.png`;
          let dataURL = canvas.toDataURL('image/png');
          button.href = dataURL;  
        }
        
      }
    }

  }
  load_history_cache(){
    let cached_history = (localStorage.getItem("colorpick_history"));
    if(cached_history) {
      cached_history = (cached_history.split(","));
      ///console.log(cached_history[cached_history.length-1].length);
      if (cached_history[cached_history.length-1].length == 0) {
        if (cached_history.length == 1) {
          cached_history = [];
        } else {
          cached_history = cached_history.slice(0,cached_history.length-1);
        }
      }
      cached_history = cached_history.map(x=>parseFloat(x));
    //console.log(Array.isArray(cached_history), cached_history.length, cached_history[cached_history.length-1]);
    if(Array.isArray(cached_history) && cached_history.length%3==0){
      let history_colors = [];
      for (let i=0;i<cached_history.length/3;i++){
        history_colors.push(cached_history.slice(i*3, i*3+3));
      }

      let i = -1;
      // ahh!! reconstruction of history may push your foo color as a side effect
      history_colors.map(color=> {
        this.create_history(color, ++i, false);
      });
      // Select the last used color
      //prerequisites are: history cache exists
      event_select_history(this, this.history[this.history.length-1]);
      this.last_history = (this.history.length-1);
      // it saved. you reassigned it.
      //console.log("why didnt it save", this, this.last_history);
    } else if (cached_history.length%3!=0){
      console.log("History data is inappropriately organized. This is a bug. Clearing cache by force..");
      console.log("Colors (use to debug and backup):", cached_history);
    localStorage.removeItem("colorpick_history");
    }
  }
}
serialize_options(){
  ///console.log(this.options);
  let opts = [
    this.options["load_history"],
    this.options["add_history"],
    this.options["color_confirmation"],
    this.options["random_color"],
    this.options["scroll_bar"],
    this.options["loose_mouse"],
    this.options["dynamic_color_rgb"],
    this.options["dynamic_color_cmyk"],

    this.options["save_style"], // 0 and 1...and 2!!

    ];
    opts = opts.join('');
    return opts;
  }

constructor(canvas, ctx) {
  this.ctx = ctx;
  this.canvas = canvas;
  this.color = [0,0,0];
  // unloaded settings (not default, set default in the html!)
  let oa = [0,0,0,0,0,0,0,0,0];
  let allchecks = document.forms[0].elements;

  for (let i =0;i<allchecks.length;i++) {
    // console.log(allchecks[i], allchecks[i].checked);
    if (allchecks[i].className=="click-switch") {
      oa[i] = parseInt(allchecks[i].getAttribute("switch_index"));
    }
    else if(allchecks[i].type=="checkbox") {
      oa[i] = allchecks[i].checked ? 1:0;
    }
  }
  let cached_options = (localStorage.getItem("colorpick_options"));
  //console.log(cached_options);
  // magical number: number of options
  if(cached_options && cached_options.length==9){
    try {
      for(let i=0;i< cached_options.length;i++){
        oa[i] = parseInt(cached_options[i]);
        // now, you need to load the special case for save_style, using the "value" parameter instead of 'checkeed'
      }
    }
    catch {
      console.log("WARNING: Localstorage should be modified by external source for this to trigger!!!")
      localStorage.removeItem("colorpick_options");
    }
  }
  // load to html....
  let formarr = document.forms[0].elements;
  for (let i=0;i< formarr.length;i++){
    let ele = formarr[i];
    //console.log("reloading from reset-default, ", ele);
    // two options to set: checkbox, click-switch
    if (ele.className == "click-switch") {
      ele.setAttribute("switch_index", oa[i]);
    } else if(ele.type=="checkbox" &&  ele.value){
      ele.checked = oa[i]==1?true:false;
    }
  }
  // load to class
  this.options = {
    "load_history": oa[0],
    "add_history": oa[1],
    "color_confirmation": oa[2],
    "random_color": oa[3],
    "scroll_bar": oa[4],
    "loose_mouse": oa[5],
    "dynamic_color_rgb": oa[6],
    "dynamic_color_cmyk": oa[7],
    "save_style": oa[8], // 0 and 1
  };
  // id: in order of occurence
  // Listen to interactions with box and bar  
  // the second thing to listen..infoblock=cblock

  this.infos = [
  new iblock(document.getElementsByClassName('color')[0], [], (this.recv_color).bind(this)), 
  new icomblock(document.getElementsByClassName('color')[1], [], (this.recv_color).bind(this)), 
    // control module: the receiver, then list of targets
    new cblock(document.getElementById('all_types'),
      [
      [document.getElementById('c_1'),[document.getElementById('r'),document.getElementById('g'),document.getElementById('b')]],
      [document.getElementById('c_3'),[document.getElementById('c'),document.getElementById('m'),document.getElementById('y'),document.getElementById('k')]]


      ],
      // a controlled callback function!!!
      (this.recv_color).bind(this)), 
    new ihex(document.getElementById('hex'), [document.getElementById('hex')], (this.recv_color).bind(this))
    ];
  
  // controls the display of the box in the middle' other boxes are managed by the boxes themselves
  this.dic = {"classic":crgb, "cmyk":ccmyk};
  this.canvas_display();
  // Initialization
  this.control(this.color);
  // dont just reassign your own values, stupid! initialize first, then set your stuff
  this.history = [];
  this.last_history = -1;

  if (this.options.load_history)
    this.load_history_cache();
  if (this.options.random_color){
    this.color = [Math.random()*255, Math.random()*255, Math.random()*255];
  }
  // if i am within a 'history' timeline, i will use this variable as a last checkpoint indicator

  this.rect = canvas.getBoundingClientRect();

  document.addEventListener('wheel', e=> {
      this.rect = canvas.getBoundingClientRect();
  });
  this.canvas.addEventListener('wheel', e => {
    if (this.options.scroll_bar) {
      e.preventDefault();
    }
    this.check_trackers(e);
  });
  this.canvas.addEventListener('mousedown', e => {
    mouseDown = true;
    this.check_trackers(e);
  });
  this.canvas.addEventListener('mouseout', e => {
    if(mouseDown) { // what is this for? i don't remember
      this.record();
    }
    mouseDown = false;
  });
  this.canvas.addEventListener('mouseup', e => {
    this.record();
    // notify 
    this.plate.notify_unfocus();
    mouseDown = false;
  });

  this.canvas.addEventListener('mousemove', e => {
    if (mouseDown) {
      this.check_trackers(e);
    }
  });
  (this.load()).then(
    // Event Listener for History Functions
    this.deferred()
    );

  //controller takes care of canvas events..
  let canvas_selection = document.getElementById("all_views");
  canvas_selection.addEventListener('change', 
    e => {
     this.canvas_display();
   },
   false);

  } //end controller constructor

// On form submit, immediately do (a part!) of changes....that apply to user @ current session
load_changes(options){
  if (!this.options.load_history) {
    //console.log(this.options.load_history);
    //localStorage.removeItem("colorpick_history");
  }

}

// ~~~~~~~~~~ change the font size of history to be the same size as hex
load_options(options) {
  //console.log(options);
  for (let key in options) {
    this.options[key] = options[key];
  }
  let serial = this.serialize_options();
  //console.log("Loading by form submit", serial);
  this.load_changes();
  localStorage.setItem("colorpick_options", serial);
}
  // History Element that belongs to the controller/picker...for now
  // each color: right click: delete color with 'delete color: yes/no' popup...

  // Record the current color selected with id
  record(){
    // auto-add history!
    if(this.options.add_history){
      this.create_history(this.color, this.history.length);
    }
  }

  clear_history(){
    let h;
    while(h = this.history.pop()){
      h.parentNode.removeChild(h);
    }
    this.last_history = -1;
    //console.log("CLEARING");
    localStorage.removeItem("colorpick_history");
  }

  // history: add, remove from history, 
  canvas_display(){
    delete this.plate;
    let val = document.getElementById("all_views").value; //classic, cmyk
    this.plate = new this.dic[val](this.canvas, this.ctx);
    this.plate.colordecode(this.color);
    this.display();
  }

  setup() {
  }
  
  display() {
    (this.ctx).clearRect(0, 0, width, height);
    this.setup();
    this.draw();
  }
  draw() {
    this.ctx.fillStyle = "#1f2128";
    this.ctx.fillRect(0,0,width, height);

    this.plate.draw(this.color);
  }
  create_history(rgb, number, new_color=true){
    let r = rgb[0];
    let g = rgb[1];
    let b = rgb[2];
    let color = document.createElement("color");
    color.style.width = "20px";
    color.style.height="20px";
    color.style.margin="2px";
    color.style.display="inline-block";
    color.style.background=`rgb(${r},${g},${b})`;
    color.style["box-sizing"] ="border-box";
    // values for color-picker to keep track (controller)
    color.select =false;
    color.index = number;

    //setAttribute("style", `color:rgb(${r},${g},${b}); width:20px; height:20px;`);
    // dont need to replace this, this will probably always be here just add in another context
    color.onclick =(controller => {
      return function(e) {
        event_select_history(controller, this);
      }
    ;})(this);
  //select_history(this);
    // onclick_func(this);
    // function onclick_func (controller){

    // }; //end onclick_func
        // this is for multiple histories...
    // the following is applied on every functionc all!
    let hist = document.getElementById("history");

    hist.appendChild(color);
    // oh you have a back-poitner alerady!?
    // the wrapper
    this.history.push(color);
    //console.log(color);
    //let all_colors = this.history.map(xx=>xx.color)
    //console.log(this.color.toString());
    // If I am not loading from cache

    if (new_color){
      let color_array = (localStorage.getItem("colorpick_history")||"")+this.color.toString()+",";
      //console.log("Add check::", this.color.toString());
      localStorage.setItem("colorpick_history", color_array);
    }
  }
}
