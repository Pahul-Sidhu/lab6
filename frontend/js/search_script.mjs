import messages from "./messages.mjs";

const getWordFormElement = document.getElementById("getWordForm");

getWordFormElement.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(getWordFormElement);
    const word = formData.get("word").toLowerCase();

    fetch(`https://lab6backend-uozr.onrender.com/definitions?word=${word}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.msg === messages.EXISTS) {
                document.getElementById("getres").innerHTML =
                   messages.EXISTS;
                return;
            }

            document.getElementById("getres").innerHTML =
                "Definition : " + data.msg;
        })
        .catch((error) => {
            console.error("Error:", error);
        });
});


document.addEventListener("DOMContentLoaded", function () {
    // Fetch data from the server
    fetch("https://lab6backend-uozr.onrender.com/languages")
      .then((response) => {
        if (!response.ok) {
          throw new Error(messages.NETWORK);
        }
        return response.json();
      })
      .then((data) => {
        const dropdown1 = document.getElementById("dropdown");
  
        // Loop through the data and create options for each dropdown
  
        data.languages.forEach((item) => {
          const option = document.createElement("option");
          option.value = item.name; // Set the value attribute
          option.textContent = item.name; // Set the text content
          dropdown1.appendChild(option);
        });
      })
      .catch((error) => {
        console.error(messages.SERVER_ERROR, error);
      });
  });