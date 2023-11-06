import messages from "./messages.mjs";

const wordForm = document.getElementById("wordForm");
const englishRegex = /[A-Za-z]/;
const chineseRegex = /[\u4E00-\u9FFF]/;

wordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(wordForm);
  const word = formData.get("word").trim().toLowerCase();
  const definition = formData.get("definition").trim();
  const word_language = document.getElementById("dropdown1").value;
  const definition_language = document.getElementById("dropdown2").value;
  const buttonValue = e.submitter.name;

  if (!word || !definition) {
    alert(messages.REQUIRED);
    return;
  }
  if (!isNaN(word) || !isNaN(definition)) {
    alert(messages.NUMBERS);
    return;
  }

  if(!(((chineseRegex.test(word) && chineseRegex.test(word_language) ) || (englishRegex.test(word) && englishRegex.test(word_language))) && ((chineseRegex.test(definition) && chineseRegex.test(definition_language) ) || (englishRegex.test(definition) && englishRegex.test(definition_language))))){
    alert(messages.LANGUAGES);
    return;
  }

  if (buttonValue === "store") {
    fetch("http://localhost:3000/definitions", {
      method: "POST",
      body: JSON.stringify({
        word: word,
        definition: definition,
        word_language: word_language,
        definition_language: definition_language,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.msg === messages.ALREADY_EXISTS) {
          const confirmed = confirm(
            messages.EXISTS
          );
          if (confirmed) {
            update(word, definition, word_language, definition_language);
          }
          return;
        }
        document.getElementById("postres").innerHTML =
          data.msg +
          ". Total entries: " +
          data.total +
          ", " +
          "Word: " +
          data.entry.word +
          ", " +
          "Definition: " +
          data.entry.definition;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else if(buttonValue === "delete"){
    fetch(`http://localhost:3000/delete?word=${word}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        })
        .then((response) => response.json())
        .then((data) => {
            const total = ". Total entries: " +
            data.total;

            document.getElementById("postres").innerHTML =
            data.msg + total;
            
        })
        .catch((error) => {
            console.error("Error:", error);
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
  // Fetch data from the server
  fetch("http://localhost:3000/languages")
    .then((response) => {
      if (!response.ok) {
        throw new Error(messages.NETWORK);
      }
      return response.json();
    })
    .then((data) => {
      const dropdown1 = document.getElementById("dropdown1");
      const dropdown2 = document.getElementById("dropdown2");

      // Loop through the data and create options for each dropdown

      data.languages.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.name; // Set the value attribute
        option.textContent = item.name; // Set the text content
        dropdown1.appendChild(option);
        dropdown2.appendChild(option.cloneNode(true));
      });
    })
    .catch((error) => {
      console.error(messages.SERVER_ERROR, error);
    });
});

const update = (word, definition, word_language, definition_language) => {
  console.log("update");
  fetch("http://localhost:3000/update", {
    method: "PATCH",
    body: JSON.stringify({
      word: word,
      definition: definition,
      word_language: word_language,
      definition_language: definition_language,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      document.getElementById("postres").innerHTML =
        data.msg +
        ". Total entries: " +
        data.total +
        ", " +
        "Word: " +
        data.entry.word +
        ", " +
        "Definition: " +
        data.entry.definition;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
