// js/chatbot.js — Flora Chatbot Widget
// Loaded after supabase.js (uses window.supabaseClient)

const GEMINI_API_KEY = atob('QVEuQWI4Uk42STBySEM2SldTdzA4TmtfLVRWc1Joc1VaN0lLT0Zsdmdja0NaZWFnMDIxQmc=');

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
      .select('content')
      .order('created_at', { ascending: false });

    console.log('knowledge query error:', error);
    console.log('knowledge raw data:', data);
    if (error) throw error;

    if (data && data.length) {
      chatbotState.knowledge = data
        .map(function(r) { return r.content; })
        .filter(function(c) { return c && c.trim(); })
        .join('\n\n');
    }
    console.log('knowledge loaded, length:', chatbotState.knowledge ? chatbotState.knowledge.length : 0);
  } catch (e) {
    console.log('Failed to load chatbot knowledge:', e.message);
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

  callGemini(text);
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

async function callGemini(userText) {
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
  var contents = recentMessages.map(function(m) {
    return { role: m.role, parts: [{ text: m.text }] };
  });

  var body = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: contents
  };

  console.log('=== SYSTEM PROMPT SENT TO GEMINI ===');
  console.log(systemPrompt);
  console.log('=== END SYSTEM PROMPT ===');

  try {
    var res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    var data = await res.json();

    hideTypingIndicator();
    chatbotState.awaitingResponse = false;

    if (data.candidates && data.candidates.length && data.candidates[0].content && data.candidates[0].content.parts.length) {
      var reply = data.candidates[0].content.parts[0].text;
      addMessage(reply, false);
    } else {
      var errMsg = data.error ? data.error.message : 'No response from Flora. Please try again.';
      addMessage(errMsg, false);
    }
  } catch (e) {
    hideTypingIndicator();
    chatbotState.awaitingResponse = false;
    addMessage('Sorry, I couldn\'t reach the server. Please check your connection and try again.', false);
    console.log('Gemini API error:', e.message);
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
