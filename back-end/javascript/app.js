class Chatbox {
  constructor() {
    this.args = {
      openButton: document.querySelector(".chatbox__button"),
      chatBox: document.querySelector(".chatbox__support"),
      sendButton: document.querySelector(".send__button"),
    };

    this.state = false;
    this.messages = [];
    this.isAuthenticated = false;
  }

  display() {
    const { openButton, chatBox, sendButton } = this.args;

    openButton.addEventListener("click", () => {
      if (this.isAuthenticated) {
        this.toggleState(chatBox);
      } else {
        alert("Please sign in to use the chatbot");
      }
    });

    sendButton.addEventListener("click", () => this.onSendButton(chatBox));

    const node = chatBox.querySelector("input");
    node.addEventListener("keyup", ({ key }) => {
      if (key === "Enter") {
        this.onSendButton(chatBox);
      }
    });
  }

  toggleState(chatbox) {
    this.state = !this.state;

    // show or hides the box
    if (this.state) {
      chatbox.classList.add("chatbox--active");
    } else {
      chatbox.classList.remove("chatbox--active");
    }
  }

  onSendButton(chatbox) {
    var textField = chatbox.querySelector("input");
    let text1 = textField.value;
    if (text1 === "") {
      return;
    }

    let msg1 = { name: "User", message: text1 };
    this.messages.push(msg1);
    this.updateChatText(chatbox);
    textField.value = "";

    this.sendMessageToServer(text1, chatbox); // Call the method here
  }

  sendMessageToServer(message, chatbox) {
    const session_id = getSessionId(); // Implement this function to get the session ID
    fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, session_id }), // Include session_id in the request body
      mode: "cors",
    })
      .then((response) => response.json())
      .then((data) => {
        let botMsg = { name: "Sam", message: data.answer };
        this.messages.push(botMsg);
        this.updateChatText(chatbox);
      })
      .catch((error) => console.error("Error:", error));
  }

  updateChatText(chatbox) {
    var html = "";
    this.messages
      .slice()
      .reverse()
      .forEach(function (item, index) {
        if (item.name === "Sam") {
          html +=
            '<div class="messages__item messages__item--visitor">' +
            item.message +
            "</div>";
        } else {
          html +=
            '<div class="messages__item messages__item--operator">' +
            item.message +
            "</div>";
        }
      });

    const chatmessage = chatbox.querySelector(".chatbox__messages");
    chatmessage.innerHTML = html;
  }
}

function getSessionId() {
  const sessionId = sessionStorage.getItem("session_id");
  console.log("Retrieved Session ID:", sessionId); // Add this log statement
  return sessionId;
}

document.getElementById("logoutButton").addEventListener("click", function () {
  // Implement your logout logic here
  // For example: clear the session storage and redirect to the login page
  sessionStorage.clear();
  window.location.href = "/index.html";
});

document.addEventListener("DOMContentLoaded", function () {
  const chatbox = new Chatbox();
  chatbox.display();
});
