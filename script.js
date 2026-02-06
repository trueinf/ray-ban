// Chatbot functionality
let chatbotOpen = false;
let conversationHistory = [];

// Supabase and OpenAI configuration
const SUPABASE_URL = 'https://lfnnavbdsxmrxsjimkwq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmbm5hdmJkc3htcnhzamlta3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MzMyMTgsImV4cCI6MjA1OTEwOTIxOH0.QXdkwEbzZHw8wiaQ80Rn00m8U2xIsUMpzP6iW0Hrccw';

// Contact button functionality - opens chatbot
function setupContactButton() {
    const contactBtn = document.getElementById('contactBtn');
    const chatbotToggleBtn = document.getElementById('chatbotToggleBtn');
    
    if (contactBtn) {
        contactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleChatbot();
        });
    }
    
    if (chatbotToggleBtn) {
        chatbotToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleChatbot();
        });
    }
}

// Toggle chatbot visibility
function toggleChatbot() {
    const chatbotWidget = document.getElementById('chatbotWidget');
    const chatbotToggleBtn = document.getElementById('chatbotToggleBtn');
    
    if (chatbotWidget) {
        if (chatbotOpen) {
            chatbotWidget.classList.remove('chatbot-open');
            chatbotOpen = false;
            // Show toggle button when closing
            if (chatbotToggleBtn) {
                chatbotToggleBtn.style.display = 'flex';
            }
        } else {
            chatbotWidget.classList.add('chatbot-open');
            chatbotOpen = true;
            // Hide toggle button when opening
            if (chatbotToggleBtn) {
                chatbotToggleBtn.style.display = 'none';
            }
            // Focus input when opening
            const input = document.getElementById('chatbotInput');
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
    }
}

// Close chatbot
function closeChatbot() {
    const chatbotWidget = document.getElementById('chatbotWidget');
    if (chatbotWidget) {
        chatbotWidget.classList.remove('chatbot-open');
        chatbotOpen = false;
    }
}

// Format markdown text to HTML
function formatMessage(content) {
    if (!content) return '';
    
    let formatted = content;
    
    // Remove "Shape" markers (they're just section dividers)
    formatted = formatted.replace(/Shape\s*/g, '');
    
    // Convert **bold** to <strong>bold</strong>
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Convert ✅ Step X: to formatted step headers (must be at start of line)
    formatted = formatted.replace(/^✅\s*Step\s*(\d+):\s*(.+)$/gm, '<div class="step-header"><span class="checkmark">✅</span> <strong>Step $1:</strong> $2</div>');
    
    // Convert standalone ✅ to checkmark (but not if it's part of Step X)
    formatted = formatted.replace(/^✅\s+(?!Step)(.+)$/gm, '<div class="checkmark-line"><span class="checkmark">✅</span> $1</div>');
    
    // Convert numbered lists (1. item)
    formatted = formatted.replace(/^(\d+)\.\s+(.+)$/gm, '<div class="list-item"><span class="list-number">$1.</span> $2</div>');
    
    // Convert lettered lists (A) item or B) item
    formatted = formatted.replace(/^([A-Z]\))\s+(.+)$/gm, '<div class="list-item"><span class="list-letter">$1</span> $2</div>');
    
    // Convert bullet points (- item or • item)
    formatted = formatted.replace(/^[-•]\s+(.+)$/gm, '<div class="bullet-item"><span class="bullet">•</span> $1</div>');
    
    // Convert double line breaks to paragraphs
    formatted = formatted.split(/\n\n+/).map(para => {
        para = para.trim();
        if (!para) return '';
        // Don't wrap if it's already a div
        if (para.startsWith('<div') || para.startsWith('<strong')) {
            return para;
        }
        return `<p>${para}</p>`;
    }).join('');
    
    // Convert single line breaks to <br> (but preserve existing HTML)
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

// Add message to chat
function addMessage(content, isUser = false) {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Use formatted HTML for bot messages, plain text for user messages
    if (isUser) {
        contentDiv.textContent = content;
    } else {
        contentDiv.innerHTML = formatMessage(content);
    }
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Add loading indicator
function addLoadingMessage() {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chatbot-message bot-message';
    messageDiv.id = 'loadingMessage';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content loading';
    contentDiv.innerHTML = '<span></span><span></span><span></span>';
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Remove loading indicator
function removeLoadingMessage() {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

// Send message to chatbot
async function sendMessage(message) {
    if (!message.trim()) return;
    
    // Add user message
    addMessage(message, true);
    conversationHistory.push({ role: 'user', content: message });
    
    // Add loading indicator
    addLoadingMessage();
    
    // Disable input
    const input = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('chatbotSend');
    if (input) input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;
    
    try {
        // Call Supabase Edge Function
        const response = await fetch(`${SUPABASE_URL}/functions/v1/chatbot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
                message: message,
                history: conversationHistory.slice(-5) // Last 5 messages for context
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        removeLoadingMessage();
        
        // Add bot response
        addMessage(data.response || 'Sorry, I encountered an error. Please try again.');
        conversationHistory.push({ role: 'assistant', content: data.response });
        
    } catch (error) {
        console.error('Error sending message:', error);
        removeLoadingMessage();
        addMessage('Sorry, I\'m having trouble connecting. Please check your internet connection and try again.');
    } finally {
        // Re-enable input
        if (input) input.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        if (input) input.focus();
    }
}

// Setup chatbot event listeners
function setupChatbot() {
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    
    if (chatbotClose) {
        chatbotClose.addEventListener('click', closeChatbot);
    }
    
    if (chatbotSend) {
        chatbotSend.addEventListener('click', () => {
            const message = chatbotInput?.value.trim();
            if (message) {
                chatbotInput.value = '';
                sendMessage(message);
            }
        });
    }
    
    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const message = chatbotInput.value.trim();
                if (message) {
                    chatbotInput.value = '';
                    sendMessage(message);
                }
            }
        });
    }
}

// Smooth scroll for anchor links
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Header scroll effect
function setupHeaderScroll() {
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.background = 'rgba(28, 30, 33, 0.98)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'var(--primary-dark)';
            header.style.backdropFilter = 'none';
        }
        
        lastScroll = currentScroll;
    });
}

// Product Modal Functions
function showProductDetails(name, gen, price, description) {
    const modal = document.getElementById('productModal');
    const modalName = document.getElementById('modalName');
    const modalPrice = document.getElementById('modalPrice');
    const modalDesc = document.getElementById('modalDesc');
    
    if (modal && modalName && modalPrice && modalDesc) {
        modalName.textContent = `${name} (${gen})`;
        modalPrice.textContent = price;
        modalDesc.textContent = description;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProductModal();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupContactButton();
    setupChatbot();
    setupSmoothScroll();
    setupHeaderScroll();
});
