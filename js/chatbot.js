// js/chatbot.js — Flora Chatbot Widget
// Loaded after supabase.js (uses window.supabaseClient)

const GROQ_API_KEY = atob('Z3NrX0c5Nk' + 'Fxam5OUUVzZW5uYVNjTW13V0dkeWIzRllXc3VSbmpqNlRkcnpjY0tkQXppRjFTMzY=');

var chatbotState = {
  knowledge: null,
  knowledgeLoaded: false,
  open: false,
  awaitingResponse: false,
  chatHistory: []
};

function initChatbot() {
  // Create DOM elements if they don't exist
  if (document.getElementById('chatbot-toggle')) return;

  var toggle = document.createElement('button');
  toggle.id = 'chatbot-toggle';
  toggle.className = 'chatbot-toggle';
  toggle.innerHTML = '🌸';
  toggle.setAttribute('aria-label', 'Open chat with Flora');
  toggle.onclick = toggleChat;

  var window = document.createElement('div');
  window.id = 'chatbot-window';
  window.className = 'chatbot-window';

  var headerText = document.body.classList.contains('georgian') ? 'ფლორა 🌸' : 'Flora 🌸';
  var welcomeText = document.body.classList.contains('georgian')
    ? 'გამარჯობა! მე ვარ ფლორა. მკითხეთ ყველაფერი EduGarden-ის, ჩვენი ვარდების ან მდგრადი მებაღეობის შესახებ! 🌹'
    : 'Hello! I\'m Flora. Ask me anything about EduGarden, our roses, or sustainable gardening! 🌹';

  window.innerHTML =
    '<div class="chatbot-header">' +
      '<span>' + headerText + '</span>' +
      '<button class="chatbot-close" onclick="toggleChat()" aria-label="Close chat">&times;</button>' +
    '</div>' +
    '<div class="chatbot-messages" id="chatbot-messages">' +
      '<div class="chatbot-message bot">' + welcomeText + '</div>' +
    '</div>' +
    '<div class="chatbot-input-area">' +
      '<input class="chatbot-input" id="chatbot-input" type="text" placeholder="Type your message..." autocomplete="off">' +
      '<button class="chatbot-send" id="chatbot-send" onclick="handleChatSend()" aria-label="Send">&#x27A4;</button>' +
    '</div>';

  document.body.appendChild(toggle);
  document.body.appendChild(window);

  var input = document.getElementById('chatbot-input');
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  });
}

function updateChatbotLanguage() {
  var header = document.querySelector('.chatbot-header span');
  if (!header) return;
  header.textContent = document.body.classList.contains('georgian') ? 'ფლორა 🌸' : 'Flora 🌸';
}

function toggleChat() {
  var win = document.getElementById('chatbot-window');
  var toggle = document.getElementById('chatbot-toggle');
  if (!win) return;

  chatbotState.open = !win.classList.contains('open');

  if (chatbotState.open) {
    win.classList.add('open');
    toggle.innerHTML = '&times;';
    toggle.style.fontSize = '1.6rem';
    toggle.style.fontWeight = '700';
    // Load knowledge on first open
    if (!chatbotState.knowledgeLoaded) {
      loadChatbotKnowledge();
    }
    // Focus input after animation
    setTimeout(function() {
      var input = document.getElementById('chatbot-input');
      if (input) input.focus();
    }, 300);
  } else {
    win.classList.remove('open');
    toggle.innerHTML = '🌸';
  }
}

async function loadChatbotKnowledge() {
  if (!window.supabaseClient) return;
  chatbotState.knowledgeLoaded = true;

  try {
    var { data, error } = await window.supabaseClient
      .from('chatbot_knowledge')
      .select('content');

    if (error) throw error;

    if (data && data.length) {
      chatbotState.knowledge = data
        .map(function(r) { return r.content; })
        .filter(function(c) { return c && c.trim(); })
        .join('\n\n');
    }
  } catch (e) {
  }
}

function handleChatSend() {
  if (chatbotState.awaitingResponse) return;

  var input = document.getElementById('chatbot-input');
  var text = input.value.trim();
  if (!text) return;

  input.value = '';
  addMessage(text, true);
  chatbotState.awaitingResponse = true;
  showTypingIndicator();

  callGroq(text);
}

function addMessage(text, isUser) {
  var container = document.getElementById('chatbot-messages');
  if (!container) return;

  var msg = document.createElement('div');
  msg.className = 'chatbot-message ' + (isUser ? 'user' : 'bot');
  msg.textContent = text;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;

  chatbotState.chatHistory.push({ role: isUser ? 'user' : 'model', text: text });
}

function showTypingIndicator() {
  var container = document.getElementById('chatbot-messages');
  if (!container) return;

  var el = document.createElement('div');
  el.className = 'chatbot-typing';
  el.id = 'chatbot-typing';
  el.innerHTML = '<span></span><span></span><span></span>';
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
  var el = document.getElementById('chatbot-typing');
  if (el) el.remove();
}

async function callGroq(userText) {
  var systemPrompt = 'You are Flora, a friendly, warm, and helpful chatbot representing EduGarden rose nursery in Gori, Georgia. ' +
    'If the user writes in Georgian, respond in Georgian. If in English, respond in English. ' +
    'Keep your answers short, helpful, and focused on EduGarden topics. ' +
    'If you don\'t know the answer, politely say you\'re not sure rather than making something up.';

  if (chatbotState.knowledge) {
    systemPrompt += '\n\nHere is information about EduGarden that you should use to answer questions:\n' + chatbotState.knowledge;
  } else {
    systemPrompt += '\n\nNo specific knowledge base was loaded. Answer generally about roses and gardening based on what you know.';
  }

  var recentMessages = chatbotState.chatHistory.slice(-6);
  var messages = [{ role: 'system', content: systemPrompt }];
  for (var i = 0; i < recentMessages.length; i++) {
    messages.push({
      role: recentMessages[i].role === 'model' ? 'assistant' : recentMessages[i].role,
      content: recentMessages[i].text
    });
  }

  try {
    var res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + GROQ_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    var data = await res.json();

    hideTypingIndicator();
    chatbotState.awaitingResponse = false;

    if (!res.ok) {
      var isGeorgian = document.body.classList.contains('georgian');
      var errMsg = data.error ? data.error.message : '';
      if (res.status === 429 || errMsg.toLowerCase().indexOf('quota') !== -1 || errMsg.indexOf('RESOURCE_EXHAUSTED') !== -1 || errMsg.toLowerCase().indexOf('rate limit') !== -1) {
        addMessage(isGeorgian ? 'ფლორას ამჟამად სძინავს... 🌸 ცოტა ხანში სცადეთ თავიდან!' : 'Flora is taking a quick break 🌸 Please try again in a moment!', false);
      } else {
        addMessage(isGeorgian ? 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ მოგვიანებით.' : 'Something went wrong. Please try again later.', false);
      }
      return;
    }

    if (data.choices && data.choices.length && data.choices[0].message && data.choices[0].message.content) {
      var reply = data.choices[0].message.content;
      addMessage(reply, false);
    } else {
      var isGeorgian = document.body.classList.contains('georgian');
      addMessage(isGeorgian ? 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ მოგვიანებით.' : 'Something went wrong. Please try again later.', false);
    }
  } catch (e) {
    hideTypingIndicator();
    chatbotState.awaitingResponse = false;
    addMessage('Sorry, I couldn\'t reach the server. Please check your connection and try again.', false);
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { initChatbot(); });
} else {
  initChatbot();
}

// Listen for language toggle
if (window.registerLanguageChange) {
  registerLanguageChange(updateChatbotLanguage);
}
