import { Difficulty } from '../../engine'
import { RoomConnection } from '../../lib/main'

export type ModeSelection =
  | { mode: 'hotseat' }
  | { mode: 'ai'; difficulty: Difficulty }
  | { mode: 'online'; connection: RoomConnection; roomCode: string }

function randomRoomCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)]
  return code
}

export function renderModeSelect(container: HTMLElement, onSelect: (selection: ModeSelection) => void): void {
  container.innerHTML = `
    <div class="mode-select">
      <h2>迷你象棋</h2>
      <div class="mode-select__menu">
        <button data-mode="hotseat">本機雙人</button>
        <button data-mode="ai">電腦對戰</button>
        <button data-mode="online">線上對戰</button>
      </div>
      <div class="mode-select__panel"></div>
    </div>
  `

  const panel = container.querySelector<HTMLDivElement>('.mode-select__panel')!

  container.querySelector('[data-mode="hotseat"]')!.addEventListener('click', () => {
    onSelect({ mode: 'hotseat' })
  })

  container.querySelector('[data-mode="ai"]')!.addEventListener('click', () => {
    renderDifficultyPicker(panel, onSelect)
  })

  container.querySelector('[data-mode="online"]')!.addEventListener('click', () => {
    renderOnlinePicker(panel, onSelect)
  })
}

function renderDifficultyPicker(panel: HTMLDivElement, onSelect: (selection: ModeSelection) => void): void {
  panel.innerHTML = `
    <p>選擇難度(你執黑先行)</p>
    <button data-difficulty="easy">簡單</button>
    <button data-difficulty="medium">中等</button>
    <button data-difficulty="hard">困難</button>
  `
  panel.querySelectorAll<HTMLButtonElement>('[data-difficulty]').forEach((btn) => {
    btn.addEventListener('click', () => {
      onSelect({ mode: 'ai', difficulty: btn.dataset.difficulty as Difficulty })
    })
  })
}

function renderOnlinePicker(panel: HTMLDivElement, onSelect: (selection: ModeSelection) => void): void {
  const params = new URLSearchParams(location.search)
  const roomFromLink = params.get('room') ?? ''

  panel.innerHTML = `
    <div class="online-picker">
      <button data-action="host">建立房間</button>
      <div class="online-picker__join">
        <input data-input="room" placeholder="輸入房號" value="${roomFromLink}" maxlength="6" />
        <button data-action="join">加入房間</button>
      </div>
      <p data-status></p>
    </div>
  `

  const status = panel.querySelector<HTMLParagraphElement>('[data-status]')!
  const setStatus = (text: string) => {
    status.textContent = text
  }

  panel.querySelector('[data-action="host"]')!.addEventListener('click', async () => {
    const roomCode = randomRoomCode()
    setStatus(`房間代碼: ${roomCode} (等待對手加入...) 分享連結: ${location.origin}${location.pathname}?room=${roomCode}`)
    try {
      const connection = await RoomConnection.host(roomCode)
      onSelect({ mode: 'online', connection, roomCode })
    } catch (err) {
      setStatus(`建立房間失敗: ${err instanceof Error ? err.message : String(err)}`)
    }
  })

  panel.querySelector('[data-action="join"]')!.addEventListener('click', async () => {
    const input = panel.querySelector<HTMLInputElement>('[data-input="room"]')!
    const roomCode = input.value.trim().toUpperCase()
    if (!roomCode) {
      setStatus('請輸入房號')
      return
    }
    setStatus('連線中...')
    try {
      const connection = await RoomConnection.join(roomCode)
      onSelect({ mode: 'online', connection, roomCode })
    } catch (err) {
      setStatus(`加入房間失敗: ${err instanceof Error ? err.message : String(err)}`)
    }
  })
}
