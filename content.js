// Function to create and insert buttons
function addButtons() {
    document.querySelectorAll('.FrEx').forEach((span, index) => {
        const button = document.createElement('button');
        button.textContent = '📌';
        button.style.marginLeft = '10px';
        button.style.cursor = 'pointer';

        const translationRow = span.closest('tr').nextElementSibling;
        const translation = translationRow && translationRow.querySelector('.ToEx') ? translationRow.querySelector('.ToEx') : null;

        button.addEventListener('click', () => {
            window.showPopup(span, translation);
        });

        // Insert button at the end of the Spanish example row
        span.parentElement.appendChild(button);
    });
}

function showPopup(frText, toText) {
    // Remove existing popup if present
    const existingPopup = document.getElementById('ankiPopup');
    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement('div');
    popup.id = 'ankiPopup';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.background = 'white';
    popup.style.padding = '15px';
    popup.style.border = '1px solid black';
    popup.style.boxShadow = '2px 2px 10px rgba(0,0,0,0.2)';
    popup.style.zIndex = '1000';

    const frInput = document.createElement('textarea');
    frInput.value = frText.innerText.trim();
    frInput.style.width = '300px';
    frInput.style.height = '50px';

    const toInput = document.createElement('textarea');
    toInput.value = toText ? toText.innerText.trim() : '';
    toInput.style.width = '300px';
    toInput.style.height = '50px';

    const deckSelect = document.createElement('select');
    deckSelect.id = 'deckSelect';
    deckSelect.style.display = 'block';
    deckSelect.style.marginTop = '10px';
    deckSelect.style.width = '300px'; // Reduce the size of the deck selection element

    // Retrieve favorite decks from localStorage
    const favoriteDecks = JSON.parse(localStorage.getItem('favoriteDecks')) || [];

    fetch('http://localhost:8765', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "action": "deckNames",
            "version": 6
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error fetching decks:', data.error);
        } else {
            // Add favorite decks to the top of the dropdown
            favoriteDecks.forEach(deck => {
                const option = document.createElement('option');
                option.value = deck;
                option.textContent = deck;
                deckSelect.appendChild(option);
            });

            // Add the rest of the decks
            data.result.forEach(deck => {
                if (!favoriteDecks.includes(deck)) {
                    const option = document.createElement('option');
                    option.value = deck;
                    option.textContent = deck;
                    deckSelect.appendChild(option);
                }
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });

    const cardTypeSelect = document.createElement('select');
    cardTypeSelect.id = 'cardTypeSelect';
    cardTypeSelect.style.display = 'block';
    cardTypeSelect.style.marginTop = '10px';
    cardTypeSelect.style.width = '300px';

    // Retrieve favorite card types from localStorage
    const favoriteCardTypes = JSON.parse(localStorage.getItem('favoriteCardTypes')) || [];
    const cardTypes = ["Basic", "Basic (and reverse)", "Cloze"];

    // Add favorite card types to the top of the dropdown
    favoriteCardTypes.forEach(cardType => {
        const option = document.createElement('option');
        option.value = cardType;
        option.textContent = cardType;
        cardTypeSelect.appendChild(option);
    });

    // Add the rest of the card types
    cardTypes.forEach(cardType => {
        if (!favoriteCardTypes.includes(cardType)) {
            const option = document.createElement('option');
            option.value = cardType;
            option.textContent = cardType;
            cardTypeSelect.appendChild(option);
        }
    });

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Create Card';
    saveButton.style.display = 'block';
    saveButton.style.marginTop = '10px';
    saveButton.addEventListener('click', () => {
        const selectedDeck = deckSelect.value;
        const selectedCardType = cardTypeSelect.value;
        createAnkiCard(frInput.value, toInput.value, selectedDeck, selectedCardType);

        // Save the selected deck to localStorage
        if (!favoriteDecks.includes(selectedDeck)) {
            favoriteDecks.push(selectedDeck);
            localStorage.setItem('favoriteDecks', JSON.stringify(favoriteDecks));
        }

        // Save the selected card type to localStorage
        if (!favoriteCardTypes.includes(selectedCardType)) {
            favoriteCardTypes.push(selectedCardType);
            localStorage.setItem('favoriteCardTypes', JSON.stringify(favoriteCardTypes));
        }
    });

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '5px';
    closeButton.addEventListener('click', () => {
        popup.remove();
    });

    popup.appendChild(document.createTextNode('Front:'));
    popup.appendChild(frInput);
    popup.appendChild(document.createElement('br'));
    popup.appendChild(document.createTextNode('Back:'));
    popup.appendChild(toInput);
    popup.appendChild(document.createElement('br'));
    popup.appendChild(document.createTextNode('Deck:'));
    popup.appendChild(deckSelect);
    popup.appendChild(document.createElement('br'));
    popup.appendChild(document.createTextNode('Card Type:'));
    popup.appendChild(cardTypeSelect);
    popup.appendChild(document.createElement('br'));
    popup.appendChild(saveButton);
    popup.appendChild(closeButton);

    document.body.appendChild(popup);
}

function createAnkiCard(frText, toText, deckName, cardType) {
    const note = {
        "deckName": deckName,
        "modelName": cardType,
        "fields": {
            "Front": frText,
            "Back": toText
        },
        "tags": ["WordReference"],
        "options": {
            "allowDuplicate": false
        }
    };

    fetch('http://localhost:8765', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "action": "addNote",
            "version": 6,
            "params": {
                "note": note
            }
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("Error: " + data.error);
        } else {
            const message = document.createElement('div');
            message.textContent = "Card added successfully!";
            message.style.position = 'fixed';
            message.style.bottom = '10px';
            message.style.right = '10px';
            message.style.background = 'green';
            message.style.color = 'white';
            message.style.padding = '10px';
            message.style.borderRadius = '5px';
            document.body.appendChild(message);

            setTimeout(() => {
                message.remove();
            }, 3000);
        }
    })
    .catch(error => {
        console.error('Failed to add Anki card:', error);
    });
}

// Run the function when the page loads
function main() {
    addButtons();
}
main();