/*
 * Author: Alex P
 * Project Name: Week-4-Game javascript
 * Version: 1
 * Date: 08.06.17
 * URL:
 */

// Global variables
$(document).ready(function () {

    // characters
    let characters = {
        'wizard': {
            name: 'wizard',
            health: 120,
            attack: 8,
            imageUrl: "assets/img/sprites_Wizard_1.png",
            imageDead: "assets/img/sprites_Wizard_2.png",
            enemyAttackBack: 15,
        },

        'knight': {
            name: 'knight',
            health: 100,
            attack: 14,
            imageUrl: "assets/img/sprites_Knight_1.png",
            imageDead: "assets/img/sprites_Knight_2.png",
            enemyAttackBack: 5,
        },

        'cyclops': {
            name: 'cyclops',
            health: 150,
            attack: 8,
            imageUrl: "assets/img/sprites_Cyclops_1.png",
            imageDead: "assets/img/sprites_Cyclops_2.png",
            enemyAttackBack: 20,
        },

        'dragon': {
            name: 'dragon',
            health: 180,
            attack: 7,
            imageUrl: "assets/img/sprites_Dragon_1.png",
            imageDead: "assets/img/sprites_Dragon_2.png",
            enemyAttackBack: 20,
        }
    };

    // master variables
    var currSelectedCharacter;
    var currDefender;
    var combatants = [];
    var indexofSelChar;
    var attackResult;
    var turnCounter = 1;
    var killCount = 0;
    var restart = $('<button class="btn">Restart</button>').click(function () {
        location.reload();
    });

    // character display area
    var renderOne = function (character, renderArea, makeChar) {
        //character: obj, renderArea: class/id, makeChar: string
        var charDiv = $("<div class='character' data-name='" + character.name + "'>");
        var charName = $("<div class='character-name'>").text(character.name);
        var charImage = $("<img alt='image' class='character-image'>").attr("src", character.imageUrl);
        var charDead = $("<img alt='image' class='character-image'>").attr("src", character.imageDead);
        var charHealth = $("<div class='character-health'>").text(character.health);
        charDiv.append(charName).append(charImage).append(charHealth);
        $(renderArea).append(charDiv);

        // conditional display
        if (makeChar == 'enemy') {
            $(charDiv).addClass('enemy');
        } else if (makeChar == 'defender') {
            currDefender = character;
            $(charDiv).addClass('target-enemy');
        }
    };

    // game messaging to DOM
    var renderMessage = function (message) {
        var gameMesageSet = $("#gameMessage");
        var newMessage = $("<div>").text(message);
        gameMesageSet.append(newMessage);

        if (message == 'clearMessage') {
            gameMesageSet.text('');
        }
    };

    var renderCharacters = function (charObj, areaRender) {
        //display all characters
        if (areaRender == '#characters-section') {
            $(areaRender).empty();
            for (var key in charObj) {
                if (charObj.hasOwnProperty(key)) {
                    renderOne(charObj[key], areaRender, '');
                }
            }
        }

        // display character
        if (areaRender == '#selected-character') {
            $('#selected-character').prepend("Your Character");
            renderOne(charObj, areaRender, '');
            $('#attack-button').css('visibility', 'visible');
            $('#restart-button').css('visibility', 'visible');
        }

        // display both combatants
        if (areaRender == '#available-to-attack-section') {
            $('#available-to-attack-section').prepend("Choose Your Next Opponent");
            for (var i = 0; i < charObj.length; i++) {

                renderOne(charObj[i], areaRender, 'enemy');
            }

            // display defender area
            $(document).on('click', '.enemy', function () {
                //select an combatant to fight
                name = ($(this).data('name'));
                //if defernder area is empty
                if ($('#defender').children().length === 0) {
                    renderCharacters(name, '#defender');
                    $(this).hide();
                    renderMessage("clearMessage");
                }
            });
        }

        // display defender
        if (areaRender == '#defender') {
            $(areaRender).empty();
            for (var i = 0; i < combatants.length; i++) {
                // move defender to defender area
                if (combatants[i].name == charObj) {
                    $('#defender').append("Your selected opponent")
                    renderOne(combatants[i], areaRender, 'defender');
                }
            }
        }

        // display defender with new hit-points
        if (areaRender == 'playerDamage') {
            $('#defender').empty();
            $('#defender').append("Your selected opponent")
            renderOne(charObj, '#defender', 'defender');
        }

        // display character with new hit-points
        if (areaRender == 'enemyDamage') {
            $('#selected-character').empty();
            renderOne(charObj, '#selected-character', '');
        }

        // display dead enemy
        if (areaRender == 'enemyDefeated') {
            $('#defender').empty();
            renderOne(charDead, '#defender');
            var gameStateMessage = "You have defeated " + charObj.name + ", you can choose to fight another enemy.";
            renderMessage(gameStateMessage);
        }
    };

    // display characters for selection
    renderCharacters(characters, '#characters-section');
    $(document).on('click', '.character', function () {
        name = $(this).data('name');
        if (!currSelectedCharacter) {
            currSelectedCharacter = characters[name];
            for (var key in characters) {
                if (key != name) {
                    combatants.push(characters[key]);
                }
            }
            $("#characters-section").hide();
            renderCharacters(currSelectedCharacter, '#selected-character');
            // display choice for defender selection
            renderCharacters(combatants, '#available-to-attack-section');
        }
    });


    // create functions to enable actions between objects
    $("#attack-button").on("click", function () {
        //if defernder area has enemy
        if ($('#defender').children().length !== 0) {
            //defender state change
            var attackMessage = "You attacked " + currDefender.name + " for " + (currSelectedCharacter.attack * turnCounter) + " damage.";
            renderMessage("clearMessage");
            // combat
            currDefender.health = currDefender.health - (currSelectedCharacter.attack * turnCounter);

            // win condition
            if (currDefender.health > 0) {
                // enemy not dead keep playing
                renderCharacters(currDefender, 'playerDamage');
                // player state change
                var counterAttackMessage = currDefender.name + " attacked you back for " + currDefender.enemyAttackBack + " damage.";
                renderMessage(attackMessage);
                renderMessage(counterAttackMessage);

                currSelectedCharacter.health = currSelectedCharacter.health - currDefender.enemyAttackBack;
                renderCharacters(currSelectedCharacter, 'enemyDamage');
                if (currSelectedCharacter.health <= 0) {
                    renderMessage("clearMessage");
                    restartGame("You have been defeated...GAME OVER!");
                    force.play();
                    $("#attack-button").unbind("click");
                }
            } else {
                renderCharacters(currDefender, 'enemyDefeated');
                killCount++;
                if (killCount >= 3) {
                    renderMessage("clearMessage");
                    restartGame("You Win! GAME OVER!");
                }
            }
            turnCounter++;
        } else {
            renderMessage("clearMessage");
            renderMessage("No enemy here.");
        }
    });

    //Restarts the game - renders a reset button
    var restartGame = function (inputEndGame) {
        //When 'Restart' button is clicked, reload the page.
        var restart = $('<button class="btn">Restart</button>').click(function () {
            location.reload();
        });
        var gameState = $("<div>").text(inputEndGame);
        $("#gameMessage").append(gameState);
        $("#gameMessage").append(restart);
    };

})