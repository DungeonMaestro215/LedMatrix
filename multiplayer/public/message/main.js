window.onload = function () {

    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const messageColor = document.getElementById("messageColor");
    const sendDialog = document.getElementById("sendDialog");

    messageInput.addEventListener("keyup", (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendButton.click();
        }

    });

    sendButton.addEventListener("click", () => {
        // Get the message when user presses send button
        const message = messageInput.value;
        const color = messageColor.value;
        console.log(message);
        console.log(color);
        
        if (sendButton.classList.contains("flip")) {
            sendButton.classList.add("flipback");
            sendButton.classList.remove("flip");
        } else {
            sendButton.classList.add("flip");
            sendButton.classList.remove("flipback");
        }
        
        sendDialog.classList.remove("hidden");
        setTimeout(() => sendDialog.classList.add("hidden"), 1500);

        axios({
            method: 'post',
            url: 'https://afternoon-plateau-82522.herokuapp.com/message/messagepost',
            // url: 'http://localhost:3000/message/messagepost',
            data: {
                message: message,
                color: color
            }
        })

        messageInput.value = "";
    });

};