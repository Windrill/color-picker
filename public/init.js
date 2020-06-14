let interval;
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
width = canvas.width;
height = canvas.height;
let pause = true;
let basic = new controller(canvas,ctx);
// new rule: dark pages must have dark var

window.MutationObserver = window.MutationObserver
|| window.WebKitMutationObserver
|| window.MozMutationObserver;

function is_dark(){
  return true;
}
// modify this to select in more detail...
function info_listener(){
  // span.onclick...
  let copyIcons = document.getElementsByClassName("far fa-clone");
  for(let i=0;i<copyIcons.length;i++){
    copyIcons[i].addEventListener('mousedown', e => {
      let copied = "";
      //let retrieve = (document.getElementById("c_"+copyIcons[i].id).innerHTML).toString();
      let copyCandidates = document.getElementsByClassName(copyIcons[i].id);
      let copyContent = "";
      for (let i=0;i<copyCandidates.length;i++){
        ///console.log(document.defaultView.getComputedStyle(copyCandidates[i]).display);
        if(document.defaultView.getComputedStyle(copyCandidates[i]).display != 'none')
          copyContent += copyCandidates[i].innerHTML;
      }

      //console.log(copyContent);
      let result;
      //((?<=<.*?value.*?").+?(?=".*?>))|((?<=>\s*?)\S+?(?=\s*?<))|(?<=>).+?(?=$)
      let re = new RegExp(/((?<=<.*?value.*?").+?(?=".*?>))|((?<=>\s*?)\S+?(?=\s*?<))|(?<=>).+?(?=$)/mg);
      while((result = re.exec(copyContent)) !== null) {
        //console.log(result[0]);
        copied += result[0];
        if ((result[0]).length < 1){
          break;
        }
      }
      let textArea = document.createElement("textarea");
      textArea.value = copied;
      textArea.style.position="fixed";  //avoid scrolling to bottom
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();

    });  
  }

  let allSelectElements = document.getElementsByTagName("select");
  for(let i=0;i<allSelectElements.length; i++){
    allSelectElements[i].addEventListener('wheel', 
        e => {        
          // of course do my change first, then work on the event propagation!
          allSelectElements[i].selectedIndex = ++allSelectElements[i].selectedIndex%(allSelectElements[i].length);
          if ("createEvent" in document) {
            let evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", false, true);
            allSelectElements[i].dispatchEvent(evt);
          }
        },
      false);
  }
  
  // fabricating correlation, beware!
  let allOptionHides = document.getElementsByClassName("hidey");
  let allOptionHideTarget = document.getElementsByClassName("hidey-target");
  for(let i=0;i<allOptionHides.length;i++) {
    allOptionHides[i].addEventListener('click',
      e => {
        if(allOptionHideTarget[i].style.display == "none") {
          allOptionHideTarget[i].style.display = "block";
        } else {
          allOptionHideTarget[i].style.display = "none";
        }
      });
  }

  // for every event with the 'click-switch' class, it should be an <input> checkbox with a few children elements (name=save_style class="click-child")
  // secondly, onclick, the value is reloaded
  let allClickSwitches = document.getElementsByClassName("click-switch");
  for(let i=0;i<allClickSwitches.length;i++) {
    // this is the fucking closure
    // HTML collection to array
    let clickchildren = allClickSwitches[i].parentNode.children;
    clickchildren = [].slice.call(clickchildren);
    clickchildren = clickchildren.slice(1);

    // create an observer instance
    let observer = new MutationObserver(function(mutation) {
      // 'this', is the mutatiomobserver object
      ///console.log(mutation[0], mutation[0].attributeName, allClickSwitches[i]);
     /** this is the callback where you do what you need to do.
         The argument is an array of MutationRecords where the affected attribute is
         named "attributeName". There is a few other properties in a record
         but I'll let you work it out yourself.
      **/
      let curr_opt = parseInt(allClickSwitches[i].getAttribute("switch_index"));
      for (let j=0;j<clickchildren.length;j++) {
            clickchildren[j].style.display = "none";
      }
      clickchildren[curr_opt].style.display = "inline";

    }),
    // configuration of the observer:
    config = {
        attributes: true // this is to watch for attribute changes.
    };

    let curr_opt = parseInt(allClickSwitches[i].getAttribute("switch_index"));
    //console.log(allClickSwitches[i].getAttribute("switch_index"), clickchildren)
    // init time
    clickchildren[curr_opt].style.display = "inline";
        // pass in the element you wanna watch as well as the options
    observer.observe(allClickSwitches[i], config);

    for (let j=0; j < clickchildren.length; j++) {
      if (clickchildren[j].className == "click-child") {
        let initial_opt = parseInt(allClickSwitches[i].getAttribute("switch_index"));
        if (j == initial_opt) {
          clickchildren[j].style.display="inline";
        }
        clickchildren[j].addEventListener('click',
          e => {
            //let curr_opt = parseInt(allClickSwitches[i].getAttribute("switch_index"));
            //clickchildren[curr_opt].style.display = "none";
            curr_opt = (curr_opt+1)%(clickchildren.length);
            allClickSwitches[i].setAttribute("switch_index", curr_opt);
            //clickchildren[curr_opt].style.display = "inline";
          });
      }
    }
  }

    // later, you can stop observing
    // observer.disconnect();

}
class click_switch{
  click_switch(){
    // i could wrap a html element in this, then also pass this to color-picker
    // then color-picker would have the responsibility of keeping the object in....the options class....
    // then i have to serialize differently...............urgh!
    // quick fix: undo redo everythin
  }
}

function load_save_options(event, defaultvalue=false){
  let options = {}
  let defaultSettings = "111010102";
  let formarr = [].slice.call(document.forms[0].elements);
  formarr = formarr.filter(f => f.type == "checkbox");

  for (let i=0;i< formarr.length;i++){
    let ele = formarr[i];
    // boolean , good as new
    //console.log("checking: ", ele, ele.value);
        if (ele.className == "click-switch") {
          //console.log(ele.getAttribute("switch_index"))
          if(defaultvalue == false){
            options[ele.value] = parseInt(ele.getAttribute("switch_index"));
          }
          else {
            options[ele.value] = defaultSettings[i];
          }
        } else if(ele.type=="checkbox" &&  ele.value) {

          if(defaultvalue == false)
          options[ele.value] = ele.checked ? 1:0;
        else {
            options[ele.value] = defaultSettings[i];
        }
        }
  //console.log("im looking at the type of checked", ele, ele.value, ele.checked, typeof(ele.checked), !ele.checked);
  } //end for loop

  // Need this so that you can save the form values in cache, and load it next time (maybe cache too slow. worked in next tick)
  basic.load_options(options);
  //console.log("do i have thie triggered", document.forms[0].elements);

  // This preventDefault is for regular option setting only.
  if(!defaultvalue) {
    event.preventDefault();
  }
  //document.forms[0].submit();
}

async function reset_options(event){
  // The event flow will continue and not wait for the promise that the event handler returns
  event.preventDefault();
  let okay = await window_alert(load_save_options.bind(this, event, defaultvalue=true), prompt="Reset all options to default?");//(event, defaultvalue=true)); //{event, defaultvalue:true}
  if (okay) {
    document.forms[0].submit();
  }
  return false;
}
function start() {
  if (pause) {
    interval = setInterval(function(){basic.draw();}, 30);
    pause = false;
    info_listener();
  } else {
    clearInterval(interval);
    pause = true;
  }
}


start();
window.addEventListener("resize", basic.resize);

window.addEventListener("focus", function (event) {
  interval = setInterval(function(){basic.draw();}, 30);
}, false);

window.addEventListener("blur", function (event) {
	clearInterval(interval);
}, false);

