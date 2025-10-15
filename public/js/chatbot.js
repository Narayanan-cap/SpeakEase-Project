
  const faqKeywords = [
    {
      keywords: ["hii", "hi", "hello", "who are you"],
      response: "Hey! How can I assist you today?"
    },
    {
      keywords: ["site", "about", "platform", "purpose", "goal", "what is this"],
      response: "This is a digital feedback platform where you can raised any complain or suggestion against any person ."
    },
   
    {
      keywords: ["commission", "custom", "personal", "request", "custom art"],
      response: "Yes! We offer custom commissions. Visit the Commission page, fill in the request form with your idea, and the artist will reach out to you."
    },
  
    
    {
      keywords: ["complaint", "register complaint", "submit complaint"],
      response: "Sure! Let's get started with your complain.Please provide NAME,LOCATION,COMPLAIN CATEGORY,brief summary,contact number"
    },
    {
      keywords: ["support", "help", "assist", "issue", "problem"],
      response: "Need help? Just type your question here! You can ask about how to raise a feedback."
    },
    
    {
      keywords: ["login", "sign in", "register", "account"],
      response: "Click on the top left login button to login or register as a new user."
    },
    {
      keywords: ["terms", "policy", "return", "refund"],
      response: "We currently do not accept returns for digital feedback. For any concerns, please reach out via the Contact page."
    }
  ];
 
  function toggleChatbot() {
    const chatbot = document.getElementById("chatbot");
    chatbot.style.display = chatbot.style.display === "flex" ? "none" : "flex";
  }
 
  function handleKey(e) {
    if (e.key === "Enter") {
      const input = document.getElementById("chatbot-input");
      const message = input.value.trim();
      if (message !== "") {
        addMessage(message, "user-message");
        respondTo(message.toLowerCase());
        input.value = "";
      }
    }
  }
 
  function addMessage(message, className) {
    const msgContainer = document.getElementById("chatbot-messages");
    const msg = document.createElement("div");
    msg.className = className;
    msg.textContent = message;
    msgContainer.appendChild(msg);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }
 
  function respondTo(query) {
    let response = "I'm sorry, I couldn't understand your question. You can ask about buying art, commissions, pricing, or contact details.";
 
    for (let entry of faqKeywords) {
      for (let keyword of entry.keywords) {
        if (query.includes(keyword)) {
          response = entry.response;
          break;
        }
      }
      if (response !== "I'm sorry, I couldn't understand your question. You can ask about buying art, commissions, pricing, or contact details.") break;
    }
 
    setTimeout(() => addMessage(response, "bot-message"), 500);
  }
