function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
}
const webSocket = new WebSocket('ws://localhost:8080');
webSocket.addEventListener('open', (e) => {
  const message = {
    type: 'open',
    id: Number.parseInt(getCookie('user'))
  }
  webSocket.send(JSON.stringify(message));
});
webSocket.addEventListener('message', (eventObj) => {
  const msgObj = JSON.parse(eventObj.data);
  console.log(msgObj);
  const messageEle = document.createElement('div');
  messageEle.innerHTML = `<ul>
                            <li class="message-list">${msgObj.message}</li>
                          </ul>`;
  messageEle.className = 'chat-other';
  let chatList = document.querySelector('.chat-list');
  chatList.append(messageEle);
  chatList.scrollTop = chatList.scrollHeight;
});
document.querySelector('.chat-form button').addEventListener('click', () => {
  const msg = document.querySelector('.chat-form input').value;
  const userActive = document.querySelector('.user-list .active').getAttribute('data-id');
  const msgObj = {
    type: 'chat',
    toUser: Number.parseInt(userActive),
    fromUser: Number.parseInt(getCookie('user')),
    message: msg
  }
  webSocket.send(JSON.stringify(msgObj));
  document.querySelector('.chat-form input').value = '';
  const messageEle = document.createElement('div');
  messageEle.innerHTML = `<ul>
                            <li class="message-list">${msg}</li>
                          </ul>`;
  messageEle.className = 'chat-self';
  const chatList = document.querySelector('.chat-list');
  chatList.append(messageEle);
  chatList.scrollTop = chatList.scrollHeight;
});