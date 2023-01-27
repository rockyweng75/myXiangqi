import './style.css'
import { Action, ActionResult } from '../lib/main'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div class="left">
  <div id="message">
  </div>
</div>
<div class="rigth">
  <canvas width="500" height="500" id="canvas"></canvas>
</div>

`
const dom = document.getElementById('canvas');
const canvas = new Action(dom as HTMLCanvasElement);
init();

addEventListener("resize", async (event) => {
  canvas.handleResize(event)
});

addEventListener("scroll", async (event) => {
  canvas.handleScroll(event)
});

function init (){  
  canvas.init()
  canvas.print()
  canvas.oncommit = (res: ActionResult)=>{
    console.log('oncommit', res)
    if(res.message){
      document.getElementById("message")!.innerHTML += '<li>'+ res.message  + '</li>'; 
    }
  }
}




