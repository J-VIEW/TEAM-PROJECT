// Assuming "chatbox__support" is the container for the entire chat widget
document
  .querySelector(".chatbox__support")
  .addEventListener("click", function (event) {
    // Check if the clicked element is the send button
    if (event.target.classList.contains("chatbox__send--footer")) {
      const messageInput = document.querySelector(".chatbox__footer input");
      const message = messageInput.value;
      const sessionId = sessionStorage.getItem("session_id"); // Retrieve session ID

      if (message) {
        fetch("/chat/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: message, session_id: sessionId }),
        })
          .then((response) => response.json())
          .then((data) => {
            // Handle response here (e.g., display the message in the chatbox)
            console.log(data); // Placeholder for response handling
            messageInput.value = ""; // Clear the input field after sending
          })
          .catch((error) => console.error("Error sending message:", error));
      }
    }
  });
