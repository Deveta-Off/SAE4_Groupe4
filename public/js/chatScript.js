const socket = io();

/* Gérer les clicks (ouverture de la fenêtre de chat)*/
let chatDiv = document.getElementById("chatDiv");
let chatDivHeader = document.getElementById("chatDivHeader");
chatDivHeader.addEventListener("click", (e) => {
  if (chatDiv.classList.contains("isOpened")) {
    chatDiv.classList.remove("isOpened");
    chatDiv.classList.add("notOpened");
  } else {
    chatDiv.classList.remove("notOpened");
    chatDiv.classList.add("isOpened");
  }
});

/* Gérer les clicks (choix de classe)*/
let globalClassChoice = document.getElementById("classDivClassGeneral");
let currentGroupChoice = document.getElementById("classDivClassGroup");

globalClassChoice.addEventListener("click", (e) => {
  globalClassChoice.classList.add("selectedClass");
  currentGroupChoice.classList.remove("selectedClass");
  socket.emit("leaveClass");
});

currentGroupChoice.addEventListener("click", (e) => {
  globalClassChoice.classList.remove("selectedClass");
  currentGroupChoice.classList.add("selectedClass");
  socket.emit("joinClass");
});

/* Gérer l'envoi de messages */
let isWriting = false; //Sert quand on est en train d'écrire, sera mis à false quand on envoie
let chatInputForm = document.getElementById("chatDivInput");
chatInputForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let inputMsg = e.target[0].value;
  socket.emit("sendMsg", inputMsg);
  addNewMessage({ author: "A récupérer", msg: inputMsg }, true);
  chatInputForm.reset();
  socket.emit("isWritingUpdate", false);
  isWriting = false;
  console.log("azaozeaz");
});

/* Pour ajouter un message à la liste HTML */
let chatList = document.getElementById("chatDivContent");
let isConnectedToGeneral = true; //True = reçoit les messages généraux, False = reçoit les messages du groupe de TP

function addNewMessage(msgObj, isSelf) {
  let newMsgDiv = document.createElement("div"); //Contient le tout
  newMsgDiv.classList.add("chatDivHolder");
  let newMsgContent = document.createElement("div"); //Contient le contenu du message

  //Ajout contenu message
  newMsgContent.classList.add("chatDivMessageContent");
  if (isSelf) {
    newMsgContent.classList.add("self");
    newMsgDiv.style.alignSelf = "end";
    newMsgDiv.style.textAlign = "right";
  } else {
    //Ajout auteur (que si message pas envoyé par soi-même)
    let newMsgAuthor = document.createElement("div");
    newMsgAuthor.textContent = msgObj.author;
    newMsgDiv.appendChild(newMsgAuthor);
  }
  newMsgContent.textContent = msgObj.msg;

  newMsgDiv.appendChild(newMsgContent);
  chatList.appendChild(newMsgDiv);

  //Scroll lors de l'envoi
  chatList.scrollTop = chatList.scrollHeight;
}

/* Gérer quand un utilisateur commence à écrire */
let textInput = document.getElementById("chatDivInputText");
let typingTimer;
textInput.addEventListener("input", (e) => {
  if (isWriting == false) {
    socket.emit("isWritingUpdate", true);
    isWriting = true;
  }
  // Réinitialiser le timer
  clearTimeout(typingTimer);

  // Démarrer un nouveau timer
  typingTimer = setTimeout(function () {
    console.log("bte");
    socket.emit("isWritingUpdate", false);
    isWriting = false;
  }, 2000);
});

//EVENTS SOCKET.IO
socket.on("msgReceived", (msgObj) => {
  addNewMessage(msgObj, false);
});

socket.on("usersWritingUpdate", (users) => {
  let res = "";
  let writingStatusNode = document.getElementById("chatDivInputStatus");
  if (users.length >= 2) {
    res = "Plusieurs personnes sont en train d'écrire ...";
  } else if (users.length > 0) {
    users.forEach((user, index) => {
      res += user + (index != users.length - 1 ? ", " : "");
    });
    res += " est en train d'écrire ...";
  }
  writingStatusNode.textContent = res;
});

/* On scrolle jusqu'au messages les plus récents */
chatList.scrollTop = chatList.scrollHeight;
