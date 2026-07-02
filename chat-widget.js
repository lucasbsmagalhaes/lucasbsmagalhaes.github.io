(function () {
  const toggle = document.getElementById('chat-toggle');
  const panel = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close');
  const messagesEl = document.getElementById('chat-messages');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');

  let history = [];
  let sending = false;

  function addMessage(text, role) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + (role === 'user' ? 'user' : 'bot');
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function openPanel() {
    panel.classList.add('open');
    if (messagesEl.children.length === 0) {
      addMessage(
        'Oi! Pode perguntar sobre a formação, os projetos (como o AgroVision AI) ou as skills do Lucas. 🙂',
        'bot'
      );
    }
    input.focus();
  }

  function closePanel() {
    panel.classList.remove('open');
  }

  toggle.addEventListener('click', () => {
    panel.classList.contains('open') ? closePanel() : openPanel();
  });
  closeBtn.addEventListener('click', closePanel);

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || sending) return;

    sending = true;
    addMessage(text, 'user');
    input.value = '';

    const typingEl = addMessage('digitando...', 'bot');
    typingEl.classList.add('typing');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();
      typingEl.remove();

      if (!res.ok) {
        addMessage(data.error || 'Erro ao falar com o assistente.', 'bot');
      } else {
        addMessage(data.reply, 'bot');
        history.push({ role: 'user', text });
        history.push({ role: 'model', text: data.reply });
        history = history.slice(-6);
      }
    } catch (err) {
      typingEl.remove();
      addMessage('Não consegui conectar agora. Tenta de novo em um instante.', 'bot');
    } finally {
      sending = false;
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();
