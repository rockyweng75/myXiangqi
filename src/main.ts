import './style.css'
import { Action, ActionResult } from '../lib/main'
import { renderModeSelect, ModeSelection } from './ui/modeSelect'

const app = document.querySelector<HTMLDivElement>('#app')!
renderModeSelect(app, startGame)

function startGame(selection: ModeSelection) {
  app.innerHTML = `
<div class="game-layout">
  <div class="game-layout__board">
    <canvas width="500" height="500" id="canvas"></canvas>
  </div>
  <div class="game-layout__panel">
    <div id="turn-indicator" class="turn-indicator turn-indicator--black">
      <span class="turn-indicator__dot"></span>
      <span id="turn-indicator-text">輪到黑方</span>
    </div>
    <div id="status"></div>
    <ul id="message"></ul>
  </div>
</div>
`
  const dom = document.getElementById('canvas');
  const canvas = new Action(dom as HTMLCanvasElement);

  const turnIndicatorEl = document.getElementById('turn-indicator')!;
  const turnIndicatorText = document.getElementById('turn-indicator-text')!;
  const updateTurnIndicator = () => {
    turnIndicatorEl.classList.remove('turn-indicator--black', 'turn-indicator--red', 'turn-indicator--over');
    if (canvas.isOver) {
      turnIndicatorText.textContent = '對局結束';
      turnIndicatorEl.classList.add('turn-indicator--over');
      return;
    }
    const faction = canvas.state.turn;
    turnIndicatorText.textContent = faction === 'black' ? '輪到黑方' : '輪到紅方';
    turnIndicatorEl.classList.add(faction === 'black' ? 'turn-indicator--black' : 'turn-indicator--red');
  };

  canvas.oncommit = (res: ActionResult) => {
    if (res.message) {
      document.getElementById("message")!.innerHTML += '<li>' + res.message + '</li>';
    }
    updateTurnIndicator();
  }

  if (selection.mode === 'hotseat') {
    canvas.init().then(() => canvas.print());
    return;
  }

  if (selection.mode === 'ai') {
    const statusEl = document.getElementById('status')!;
    canvas.onAIThinking = (thinking) => {
      statusEl.textContent = thinking ? '電腦思考中...' : '';
      statusEl.classList.toggle('status--thinking', thinking);
    };
    canvas.init().then(() => canvas.print()).then(() => {
      canvas.setAIOpponent('red', selection.difficulty);
    });
    return;
  }

  // online
  const statusEl = document.getElementById('status')!;
  canvas.onRemoteStatus = (status) => {
    if (status === 'closed') statusEl.textContent = '對手已離線';
    else if (status === 'error') statusEl.textContent = '連線發生錯誤';
    else statusEl.textContent = `已連線 (你執${selection.connection.localFaction === 'black' ? '黑' : '紅'}子)`;
  };
  canvas.attachRemote(selection.connection);

  const resumed = Action.loadPersistedState(selection.roomCode);
  const ready = resumed ? Promise.resolve(canvas.loadState(resumed)) : canvas.init();
  Promise.resolve(ready).then(() => canvas.print());
}
