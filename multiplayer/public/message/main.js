window.onload = function () {

    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    messageInput.addEventListener("keyup", (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendButton.click();
        }

    });

    sendButton.addEventListener("click", () => {
        // Get the message when user presses send button
        let message = messageInput.value;
        console.log(message);

        axios({
            method: 'post',
            url: 'https://afternoon-plateau-82522.herokuapp.com/message/messagepost',
            data: {
                message: message
            },
            // headers: {
            //     'Content-Type': 'text/plain;charset=utf-8',
            // }
        })
    });

};