/* Chat front-end: envia { message, history } para /api/chat (backend já existente) */
/* Substitua conforme seu backend; aqui assumimos POST /api/chat retornando { answer: "..." } */

const chatWindow = document.getElementById('chatWindow');
const input = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const imageInput = document.getElementById('imageInput');

let history = []; // mantém contexto curto

// Helpers UI
function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function createUserBubble(text) {
  const row = document.createElement('div');
  row.className = 'userRow';
  const bubble = document.createElement('div');
  bubble.className = 'msg msg-user';
  bubble.innerText = text;
  row.appendChild(bubble);
  chatWindow.appendChild(row);
  scrollToBottom();
}

function createBotBubble(text) {
  const row = document.createElement('div');
  row.className = 'botRow';
  const avatar = document.createElement('img');
  avatar.src = 'https://i.imgur.com/VpHkY9N.png';
  avatar.className = 'avatar';
  const bubble = document.createElement('div');
  bubble.className = 'msg msg-bot';
  bubble.innerText = text;
  row.appendChild(avatar);
  row.appendChild(bubble);
  chatWindow.appendChild(row);
  scrollToBottom();
}

function createBotTyping() {
  const row = document.createElement('div');
  row.className = 'botRow typingRow';
  row.setAttribute('id', 'typingRow');
  const avatar = document.createElement('img');
  avatar.src = 'https://i.imgur.com/VpHkY9N.png';
  avatar.className = 'avatar';
  const bubble = document.createElement('div');
  bubble.className = 'msg msg-bot';
  bubble.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  row.appendChild(avatar);
  row.appendChild(bubble);
  chatWindow.appendChild(row);
  scrollToBottom();
}

function removeTyping() {
  const t = document.getElementById('typingRow');
  if (t) t.remove();
}

// file -> dataURL
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text && !imageInput.files.length) return;

  // show user message
  if (text) createUserBubble(text);
  if (imageInput.files.length) {
    // show preview image in user bubble
    const dataUrl = await fileToDataUrl(imageInput.files[0]);
    const row = document.createElement('div');
    row.className = 'userRow';
    const bubble = document.createElement('div');
    bubble.className = 'msg msg-user';
    const img = document.createElement('img');
    img.src = dataUrl;
    bubble.appendChild(img);
    row.appendChild(bubble);
    chatWindow.appendChild(row);
    scrollToBottom();
  }

  const payload = {
    message: text || '',
    history: history.slice(-10) // curto contexto
  };

  input.value = '';
  imageInput.value = '';

  // typing indicator
  createBotTyping();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });

    removeTyping();

    if (!res.ok) {
      createBotBubble('Desculpe — erro na comunicação com o servidor.');
      return;
    }

    const data = await res.json();
    const answer = data.answer || 'Desculpe, não entendi. Pode reformular?';

    createBotBubble(answer);

    // store in history
    if (text) history.push({role:'user', content:text});
    history.push({role:'assistant', content:answer});

  } catch (err) {
    removeTyping();
    createBotBubble('Erro de rede: ' + (err.message || ''));
    console.error(err);
  }
}

// send on click or Enter
sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// initial message
createBotBubble('Olá — eu sou a Asla. Pergunte algo sobre programação ou peça um exercício.');
