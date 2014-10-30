var deckCount = 4; //this will be set by user when implemented later

//this will return a deck object with all methods of a deck.  inside the deck object is a card object
var multiDeck = (function() {

    //card constructor
    function Card(cardId, suit) { //card constructor 0=2, 12=Ace. suit: 0=diamond, 1=club, 2=heart, 3=spade.
        //cardId and suit will be used to assign images to cards
        //convert cardId into blackjack value.
        var nonAceCards = (cardId < 8) ? cardId + 2 : 10;
        this.value = (cardId === 12) ? 11 : nonAceCards;
        this.cardImgSrc = ""; //this will direct to the associated card image

        //makes the cardId and suit into an easier to use format
        var fixCardNames = function () {

            switch(cardId) {
                case 9:
                    cardId = "jack";
                    break;
                case 10:
                    cardId = "queen";
                    break;
                case 11:
                    cardId = "king";
                    break;
                case 12:
                    cardId = "ace";
                    break;
            }

            if (cardId < 9) {
                cardId += 2; //makes a two (which had value of 0 previously) into a two and so on
            }

            switch(suit) {
                case 0:
                    suit = "diamonds";
                    break;
                case 1:
                    suit = "clubs";
                    break;
                case 2:
                    suit = "hearts";
                    break;
                case 3:
                    suit = "spades";
                    break;
            }
        };
        fixCardNames();
        //creates the img src
        this.cardImgSrc = "img/" + cardId + "_of_" + suit + ".png";
    }


    //Create a 1D single/multiple deck array which is a collection of card objects 52 per deckCount
    var oneDeck = (function createDeck() {
        var theDeck = [];
        for (var i =0; i < deckCount; i++) { //if more than one deck this loop will iterate and create x decks
            for (var j = 0; j < 13; j++) { //creates one deck of 52 cards
                for (var k = 0; k < 4; k++) {
                    theDeck[theDeck.length] = new Card(j, k);
                }
            }
        }
        return theDeck;
    })();

    //SuperDeck constructor.  +Should hold decks as a 1D array. +Shuffle deck. +Count remaining cards.
    // +Remove cards from deck to discard array. +Deal. +Add discard cards to original deck when down to a certain
    //number of cards. +Reshuffle deck (don't need to repeat this method).
    function SuperDeck(masterDeck){ //masterDeck is the cards in the deck
        //generates dealer card supply
        var discardPile = []; //empty array for dealt cards

        //shuffles the masterDeck
        var shuffleCards = function() {
            masterDeck.sort(function(a, b){ return 0.5-Math.random(); }); //randomizes the sort
        };
        shuffleCards(); //shuffles cards when deck is constructed

        //this function removes x cards from masterDeck and returns them.  It also updates the discardPile and will
        //add the discardPile back to the masterDeck
        this.dealt = function dealt(numCards){
            var dealtCards = []; //will reset dealtCards each time dealt is called.  these are cards to be dealt this turn
            var poppedCards = ""; //string that holds one popped cards and is then reset on every for loop iteration

            //places cards in dealtCards and returns them. Also keeps track of discard pile and if the masterDeck0 is
                //more than 75% finished, it adds discardPile back in and reshuffles
            for (var i=0; i < numCards; i++) {
                poppedCards = masterDeck.pop();
                dealtCards[dealtCards.length] = poppedCards; //adds to dealt cards pile
                discardPile[discardPile.length] = poppedCards; //adds to discard pile to keep track of dealt
                poppedCards = ""; //resets poppedCards
            }
            //if deck is below 25% of initial cards we need to reshuffle old cards into masterDeck
            if (masterDeck.length / (masterDeck.length + discardPile.length) <= 0.25) {
                masterDeck = masterDeck.concat(discardPile); //makes new deck
                shuffleCards(); //now new deck is shuffled and ready to go
            }

            return dealtCards; //gives someone x cards in an array
        };
    }

    return new SuperDeck(oneDeck); //returns the deck object
})();

//this will control both the dealer and the player
function Players() {

    //isActive will be set to false when: a. total is >= 21  b. stand or doubledown pressed  c.start of new session
    var isActive = false;
    var playerCards = [], dealerCards = []; //holds player/dealer cards for current turn

    //dealerCardElement and playerCardElement are the divs that hold the card images
    var dealerCardElement = document.getElementById("dealer_card_images");
    var playerCardElement = document.getElementById("player_card_images");

    var actionButtons = document.getElementsByClassName("action_buttons"); //buttons user can press on turn
    var hideButtons = function() { //hides buttons that player can interact with during turn
        for (var i = 0; i < actionButtons.length; i++) {
        actionButtons[i].style.visibility = "hidden";
        }
    };

    var showButtons = function() { //shows buttons that player can interact with during turn
        for (var i = 0; i < actionButtons.length; i++) {
        actionButtons[i].style.visibility = "visible";
        }
        if (playerCards[0].value !== playerCards[1].value){
            actionButtons[3].style.visibility = "hidden";
        }
    };

    //this moves the cards to the left if the card is not the first card dealt
    function moveLeft(cardElement){
        if (cardElement.parentNode.childNodes[0] !== cardElement) {
            cardElement.style.marginLeft = "-55px";
        }
    }

    //displays the card except if bool is passed in as true in which case it displays the backCard
    function addDealerCardImg(card, bool){
        var img = document.createElement("img");
        if (bool) {
            img.src = "img/cardBack.jpg";
        }
        else {
            img.src = card.cardImgSrc;
        }
        img.style.height = "120px";
        dealerCardElement.appendChild(img);
        moveLeft(img);
    }

    function addPlayerCardImg(card){
        var img = document.createElement("img");
        img.src = card.cardImgSrc;
        img.style.height = "120px";
        playerCardElement.appendChild(img);
        moveLeft(img);
    }

    function uncoverDealerCard(){
        //removes second
        dealerCardElement.removeChild(dealerCardElement.lastChild);
        addDealerCardImg(dealerCards[1]);
    }

    //returns the number of aces in the handArray
    var aceCount = function(deckArray){
        var aces = 0;//number of aces, value to be returned
        for (var i = 0; i < deckArray.length; i++) {
            if (deckArray[i].value === 11) {
                aces += 1;
            }
        }
        return aces;
    };

    var myCount = function (playerNameCards) { //card score counting function
        var score = 0;
        //check every card in playerNameCards
        for (var i = 0; i < playerNameCards.length; i++){
            score += playerNameCards[i].value; //playerNameCards must be a 1D array for this to work
        }
        // this block will properly adjust score to account for aces which can have a 1 or 11 value
        if (score > 21 && aceCount(playerNameCards) > 0) {
            score = score - ((aceCount(playerNameCards) - 1) * 10); //makes all but one ace's value === 1
            if (score > 21) { //if the score is still greater than 21, change last ace's value from 11 to 1
                score = score - 10;
            }
        }
        return score;
    };

    //takes an array from multiDeck() and returns just the card object
    var giveOneCard = function() {
        return multiDeck.dealt(1)[0];
    };


    //gives player cards that are in the form of an array and adds card imgs to browser
    //if only two parameters used then use dealer and only display first card
    var giveHand = function(userEmptyHand, newCardsArray, user) {
        for (var i = 0; i < newCardsArray.length; i++) {
            userEmptyHand.push(newCardsArray[i]);
            if (user === "player") {
                addPlayerCardImg(newCardsArray[i]);
            }
            else {
                addDealerCardImg(newCardsArray[0]);
                addDealerCardImg(newCardsArray[1], true); //will show back of card
                userEmptyHand.push(newCardsArray[1]); // required because loop will not iterate again
                break;
            }
        }

    };

    //these functions will update the webpage to show result of user interaction in game
    //change what is displayed in the textboxes
    var updatePlayerScore = function() {
        document.getElementById("user_score").value = myCount(playerCards);
    };
    var updateDealerScore = function() {
        document.getElementById("dealer_score").value = myCount(dealerCards);
    };

    //change #user_result based on win, tie, loss scenarios
    var updatePlayerWin = function() {
        document.getElementById("user_result").style.background = "green";
        document.getElementById("user_result").value = "You Win ";
    };
    var updatePlayerLoss = function() {
        document.getElementById("user_result").style.background = "red";
        document.getElementById("user_result").value = "You Lose";
    };
    var updatePlayerPush = function() {
        document.getElementById("user_result").style.background = "lightgrey";
        document.getElementById("user_result").value = "Push. Wager Returned.";
    };
    var updatePlayerBlackjack = function() {
        document.getElementById("user_result").style.background = "green";
        document.getElementById("user_result").value = "You Win: BlackJack";
    };

    //compares the dealer/player scores and determines the winner
    var scoreAnalyzer = function () {
        //if player has busted the dealer wins
        if (myCount(playerCards) > 21) {
            updatePlayerLoss();
        }
        else if (myCount(dealerCards) > 21) {
            updatePlayerWin();
        }
        else if (myCount(dealerCards) === myCount(playerCards)) {
            updatePlayerPush();
        }
        else if (myCount(dealerCards) < myCount(playerCards)) {
            updatePlayerWin();
        }
        else {
            updatePlayerLoss();
        }
    };


    //at the start of each new hand, function will deal two cards to both the player and the dealer and display these
    //card values.  After it will check the player then dealer for blackjack.  Finally it shows the buttons such as
    //"hit", "stand", etc. and determines if split should be visible
    this.dealGame = function() {

        //hide start button
        document.getElementById("start_button").style.visibility = "hidden";

        //un-color player text box + reset result text box
        document.getElementById("user_result").style.background = "white";
        document.getElementById("user_result").value = "";

        //delete previously dealt cards until div is empty
        while (dealerCardElement.childNodes.length > 0) {
            dealerCardElement.removeChild(dealerCardElement.childNodes[0]);
        }
        while (playerCardElement.childNodes.length > 0) {
            playerCardElement.removeChild(playerCardElement.childNodes[0]);
        }

        //accept wager

        //deal first two cards
        var playerFirstCards = multiDeck.dealt(2);
        var dealerFirstCards = multiDeck.dealt(2);

        //add the two initial card arrays to playerCards/dealerCards as two seperate card objs to each person
        giveHand(playerCards, playerFirstCards, "player");
        giveHand(dealerCards, dealerFirstCards);

        //show player/dealer scores
        var playerScore = myCount(playerCards);
        var dealerScore = myCount(dealerCards);
        updatePlayerScore(); //enters the player's score into the browser
        document.getElementById("dealer_score").value = dealerCards[0].value;//only shows first card value until dealer's turn

        //player blackjack checker ***need to figure a way to make this skip everything to end***
        if (playerScore !== 21) {
            isActive = true;
        }
        else {
            runDealer(); //defined below current function
        }

        //dealer blackjack checker (skips if player gets blackjack)
        if (dealerScore === 21 && playerScore !== 21) {
            document.getElementById("dealer_score").value = myCount(dealerCards);
            isActive = false;
            runDealer();
        }

        //show buttons if neither the player or dealer have blackjack
        if (dealerScore !== 21 && playerScore !== 21) {
            //show user buttons if game active
            showButtons();
        }
    };

    var runDealer = function(){  //this is the dealer's turn
        //hide all the unusable buttons
        hideButtons();

        //show hidden dealer card
        uncoverDealerCard();

        //condition checks if the player has blackjack
        if(myCount(playerCards) !== 21 || playerCards.length > 2){
            updateDealerScore();
            //checks if player has busted already
            if (myCount(playerCards) <= 21) {
                //add cards until dealer has 17 or greater (probably want to add a delay/animation here
                while (myCount(dealerCards) < 17) {
                    var dealtCard = giveOneCard();
                    dealerCards.push(dealtCard);
                    addDealerCardImg(dealtCard);
                    updateDealerScore();
                }
            }
            //score keeper
            scoreAnalyzer();
        }
        else { //this will only run when the player hits blackjack
            updatePlayerBlackjack();
        }

        //reset player/dealer cards
        dealerCards = [];
        playerCards = [];
        document.getElementById("start_button").style.visibility = "visible";

    };


    //adds one card and determines if the player has busted/got 21/can still hit
    this.hit = function () {
        if(isActive){
            var dealtCard = giveOneCard();
            playerCards.push(dealtCard);
            updatePlayerScore();
            addPlayerCardImg(dealtCard);
        }
        if (myCount(playerCards) >= 21) { //if have score of 21 or greater after the dealt card
            isActive = false; //disables player from receiving more cards
            runDealer();
        }
    };
    //similar to hit function except that the player can only recieve one card and then it's the dealer's turn
    this.doubleDown = function () {
        if(isActive){
            var dealtCard = giveOneCard();
            playerCards.push(dealtCard);
            updatePlayerScore();
            addPlayerCardImg(dealtCard);
            isActive = false; //disables player from receiving more cards
            runDealer();
        }
    };

    //assign this to a stand button
    this.stand = function () {
        isActive = false; //deactivate player
        runDealer();
    };
}

/create the dealer + player object
var players1 = new Players();


//***future implementations

//***start screen***
//  should also allow the user to choose how many decks they want (min 2, max 8)

//***general gameplay***
//  slidebar to count user bet per hand
//  display showing hard and soft score (when have an ace)



//***after hand***
//show button that asks if user would like to bet again (allow checkbox to auto-deal)


//***other ideas***
//betting implementation, splitting
//leaderboards
//card-counting helper


