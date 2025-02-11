const chatContainer = document.querySelector(".chatbox");
const chatInput = document.querySelector("#txt-input");
const sendButton = document.querySelector(".text-box span");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");
const API_KEY = "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";

// Load chat history and theme from local storage
const loadDataFromLocalStorage = () => {
    const themeColor = localStorage.getItem("themeColor");
    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1>DevsAI | Web3bridge</h1>
                            <p>Start a conversation and explore the power of AI.<br> Your chat history will be displayed here.</p>
                            </div>`
    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;


    

};

// Create chat message element
const createChatElement = (content, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv;
};

// Fetch chatbot response
const getChatResponse = async (incomingChatDiv) => {
    try {
        const response = await fetch("https://api.openai.com/v1/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "text-davinci-003",
                prompt: chatInput.value.trim(),
                max_tokens: 2048,
                temperature: 0.7,
                n: 1
            })
        });
        const data = await response.json();
        const responseText = data.choices?.[0]?.text.trim() || "Error: No response";
        incomingChatDiv.querySelector(".chatbox-animation").remove();
        incomingChatDiv.querySelector(".chat-details").innerHTML += `<p>${responseText}</p>`;
        localStorage.setItem("all-chats", chatContainer.innerHTML);
        chatContainer.scrollTo(0, chatContainer.scrollHeight);
    } catch (error) {
        console.error(error);
        incomingChatDiv.querySelector(".chat-details").innerHTML += `<p class='error'>Error: Unable to retrieve response.</p>`;
    }
};

// Handle user message
const handleOutgoingChat = () => {
    const userText = chatInput.value.trim();
    if (!userText) return;
    chatInput.value = "";
    const outgoingChatHtml = `<div class="chat-content"><div class="chat-details"><img src="images/user.jpg" alt="user-img"><p>${userText}</p></div></div>`;
    const outgoingChatDiv = createChatElement(outgoingChatHtml, "user-msg");
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    
    setTimeout(() => {
        const incomingChatHtml = `<div class="chat-content"><div class="chat-details"><img src="images/chatbot.jpg" alt="chatbot-img"><div class="chatbox-animation"><div class="dotted-txt"></div><div class="dotted-txt"></div><div class="dotted-txt"></div></div></div><span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span></div>`;
        const incomingChatDiv = createChatElement(incomingChatHtml, "chatbot-msg");
        chatContainer.appendChild(incomingChatDiv);
        chatContainer.scrollTo(0, chatContainer.scrollHeight);
        getChatResponse(incomingChatDiv);
    }, 500);
};

// Copy chatbot response
const copyResponse = (copyBtn) => {
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    if (!responseTextElement) return;
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
};

// Delete chat history
deleteButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all chats?")) {
        localStorage.removeItem("all-chats");
        chatContainer.innerHTML = "";
    }
});

// Toggle theme
themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const newTheme = document.body.classList.contains("light-mode") ? "light_mode" : "dark_mode";
    localStorage.setItem("themeColor", newTheme);
    themeButton.innerText = newTheme;
});

// Handle enter key for sending messages
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

// Send button click
sendButton.addEventListener("click", handleOutgoingChat);

// Load chat history on page load
loadDataFromLocalStorage();
