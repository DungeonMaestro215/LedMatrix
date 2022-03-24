
window.onload = function () {

    const messageInput = document.getElementById("messageInput");

    document.getElementById("sendButton").addEventListener("click", () => {
        // Get the message when user presses send button
        let message = messageInput.value;
        console.log(message);

        axios({
            method: 'post',
            url: 'http://localhost:3000/message/messagepost',
            data: {
                message: message
            },
            // headers: {
            //     'Content-Type': 'text/plain;charset=utf-8',
            // }
        })
    });

};