// app.js
const messageContainer = document.querySelector(".message-container");
const messageInput = document.querySelector("#message-input");
const sendButton = document.querySelector("#send-button");

function appendMsg(message) {
  var message = message;

  if (!message) {
    return;
  }

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  const messageHeader = document.createElement("div");
  messageHeader.classList.add("message-header");
  messageHeader.innerHTML = '<img height="1cm" width = "1cm" src="http://localhost:3000/images/abhay" style="height: 1cm;width: 1cm;"></img>'+ message.user;

  const messageBody = document.createElement("div");
  messageBody.classList.add("message-body");
  messageBody.innerHTML = message.text;

  const messageFooter = document.createElement("div");
  messageFooter.classList.add("message-footer");
  messageFooter.innerHTML = message.timestamp;

  messageDiv.appendChild(messageHeader);
  messageDiv.appendChild(messageBody);
  messageDiv.appendChild(messageFooter);

  messageContainer.appendChild(messageDiv);
  

  messageInput.value = "";
  var elem = document.getElementById('allmsgs');
  elem.scrollTop = elem.scrollHeight;
};


// Get Messages from Server
function getMessages() {
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/messages",
        success: function (res) {
             renderMessages(res);
        },
        error: function (err) {
            console.log(err);
        }
    });
}

// Render Messages
function renderMessages(messages) {
    messageContainer.innerHTML = "";

    messages.forEach(message => {
        appendMsg(message);
    //     const messageDiv = document.createElement("div");
    //     messageDiv.innerHTML = `
    //   <p><strong>${message.user}</strong>: ${message.text}</p>
    //   <p>${new Date(message.timestamp).toLocaleString()}</p>
    // `;

    //     messageContainer.appendChild(messageDiv);
    });
}

// Send Message to Server
function sendMessage() {
    var obj = {
        text: messageInput.value,
        user: 'abhay',//username,
        timestamp : new Date()
    }
    $.ajax({
        type: "POST",
        url: "http://localhost:3000/messages",
        data: JSON.stringify(obj),
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (data) {
            messageInput.value = "";
            getMessages();
        },
        error: function (err) {
            console.log(err);
        }
    })
}

sendButton.addEventListener("click", sendMessage);

getMessages();


const form = document.getElementById('myForm');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('myFile', document.getElementById('myFile').files[0]);
    formData.append('name', $('#myFile').val());

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/upload', true);

    xhr.onload = function () {
      if (xhr.status === 200) {
        console.log('File uploaded successfully');
      } else {
        console.error('File upload failed');
      }
    };

    xhr.send(formData);
  });
