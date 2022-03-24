window.onload = function () {

    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const messageColor = document.getElementById("messageColor");

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

        axios({
            method: 'post',
            url: 'https://afternoon-plateau-82522.herokuapp.com/message/messagepost',
            data: {
                message: message,
                color: color
            },
            // headers: {
            //     'Content-Type': 'text/plain;charset=utf-8',
            // }
        })
    });

};