(function () {
  const input = document.getElementById('ask-input');
  const sendBtn = document.getElementById('ask-send');
  const suggestions = document.getElementById('ask-suggestions');
  const resultEl = document.getElementById('ask-result');
  const questionEl = document.getElementById('ask-result-question');
  const answerEl = document.getElementById('ask-result-answer');

  let history = [];
  let sending = false;

  function typeText(el, text) {
    // Efeito de digitação leve, no espírito das transições suaves do site
    el.classList.remove('loading');
    el.textContent = '';

    const textNode = document.createTextNode('');
    el.appendChild(textNode);

    const cursor = document.createElement('span');
    cursor.className = 'ask-cursor';
    el.appendChild(cursor);

    let i = 0;
    const charsPerFrame = 2; // avança ~2 caracteres por frame, sem reflow por letra

    function step() {
      i += charsPerFrame;

      if (i >= text.length) {
        textNode.textContent = text;
        cursor.remove();
        return;
      }

      textNode.textContent = text.slice(0, i);
      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  async function ask(question) {
    if (!question || sending) return;
    sending = true;
    sendBtn.disabled = true;

    // Mostra a área de resposta com a pergunta e um estado de carregamento
    questionEl.textContent = question;
    answerEl.textContent = 'Pensando...';
    answerEl.classList.add('loading');
    resultEl.hidden = false;
    // força reflow pra animação de entrada rodar
    void resultEl.offsetWidth;
    resultEl.classList.add('visible');
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history }),
      });
      const data = await res.json();

      if (!res.ok) {
        answerEl.classList.remove('loading');
        answerEl.textContent = data.error || 'Não consegui responder agora. Tenta de novo.';
      } else {
        typeText(answerEl, data.reply);
        history.push({ role: 'user', text: question });
        history.push({ role: 'model', text: data.reply });
        history = history.slice(-6);
      }
    } catch (err) {
      answerEl.classList.remove('loading');
      answerEl.textContent = 'Não consegui conectar agora. Tenta de novo em um instante.';
    } finally {
      sending = false;
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener('click', () => ask(input.value.trim()));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') ask(input.value.trim());
  });

  suggestions.addEventListener('click', (e) => {
    const chip = e.target.closest('.ask-chip');
    if (!chip) return;
    input.value = chip.textContent;
    ask(chip.textContent);
  });
})();
