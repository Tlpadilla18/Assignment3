$(document).ready(() => {
  const apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=1500';
  let allPokemon = [];
  let selectedPokemon = [];
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let matches = 0;
  let totalPairs = 0;
  let clicks = 0;
  let timer;
  let timeLeft = 0;
  let powerUpUses = 3;

  // Fetch all Pokémon names and URLs
  $.get(apiUrl, (data) => {
    allPokemon = data.results;
  });

  $('#start-btn').click(() => {
    const difficulty = $('#difficulty').val();
    setupGame(difficulty);
  });

  $('#reset-btn').click(() => {
    clearInterval(timer);
    $('#game-grid').empty();
    resetStatus();

    // Reset Power-Up
    powerUpUses = 3;
    $('#powerup-btn').text('Power-Up (3 left)');

    hideWinPopup();
  });

  $('#theme').change(() => {
    const theme = $('#theme').val();
    $('body').toggleClass('dark', theme === 'dark');
  });

  $('#powerup-btn').click(() => {
    if (powerUpUses <= 0) {
      alert("No more Power-Ups left!");
      return;
    }

    powerUpUses--;
    $('#powerup-btn').text(`Power-Up (${powerUpUses} left)`);

    $('.card').addClass('flip');
    setTimeout(() => {
      $('.card').removeClass('flip');
    }, 1000);
  });

  $('#close-popup').click(() => {
    hideWinPopup();
  });

  function setupGame(difficulty) {
    clearInterval(timer);
    $('#game-grid').empty();
    resetStatus();

    let pairCount;
    let timeLimit;

    switch (difficulty) {
      case 'easy':
        pairCount = 3;
        timeLimit = 60;
        break;
      case 'medium':
        pairCount = 6;
        timeLimit = 90;
        break;
      case 'hard':
        pairCount = 9;
        timeLimit = 120;
        break;
    }

    totalPairs = pairCount;
    $('#total-pairs').text(`Total Pairs: ${totalPairs}`);
    $('#pairs-left').text(`Pairs Left: ${totalPairs}`);
    timeLeft = timeLimit;
    $('#timer').text(`Time: ${timeLeft}s`);

    // Pick random Pokémon
    selectedPokemon = [];
    const usedIndices = new Set();
    while (selectedPokemon.length < pairCount) {
      const index = Math.floor(Math.random() * allPokemon.length);
      if (!usedIndices.has(index)) {
        usedIndices.add(index);
        selectedPokemon.push(allPokemon[index]);
      }
    }

    // Duplicate and shuffle
    const cards = [];
    selectedPokemon.forEach((pokemon) => {
      cards.push({ ...pokemon });
      cards.push({ ...pokemon });
    });
    shuffle(cards);

    // Create cards
    cards.forEach((pokemon) => {
      const card = $(`
        <div class="card" data-name="${pokemon.name}">
          <div class="card-inner">
            <div class="card-front">
              <img src="" alt="${pokemon.name}" />
            </div>
            <div class="card-back">
              <img src="back.webp" alt="Card Back" />
            </div>
          </div>
        </div>
      `);
      $('#game-grid').append(card);
      $.get(pokemon.url, (data) => {
        card.find('.card-front img').attr('src', data.sprites.other['official-artwork'].front_default);
      });
    });

    // Card click logic
    $('.card').click(function () {
      if (lockBoard || $(this).hasClass('flip')) return;
      $(this).addClass('flip');
      clicks++;
      $('#clicks').text(`Clicks: ${clicks}`);

      if (!firstCard) {
        firstCard = $(this);
        return;
      }

      secondCard = $(this);
      lockBoard = true;

      const isMatch = firstCard.data('name') === secondCard.data('name');
      if (isMatch) {
        matches++;
        $('#pairs-matched').text(`Pairs Matched: ${matches}`);
        $('#pairs-left').text(`Pairs Left: ${totalPairs - matches}`);
        firstCard.off('click');
        secondCard.off('click');
        resetBoard();
        if (matches === totalPairs) {
          clearInterval(timer);
          showWinPopup();
        }
      } else {
        setTimeout(() => {
          firstCard.removeClass('flip');
          secondCard.removeClass('flip');
          resetBoard();
        }, 1000);
      }
    });

    // Start timer
    timer = setInterval(() => {
      timeLeft--;
      $('#timer').text(`Time: ${timeLeft}s`);
      if (timeLeft <= 0) {
        clearInterval(timer);
        $('#lose-popup').addClass('show');
        $('.card').off('click');
      }
    }, 1000);
  }

  function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
  }

  function resetStatus() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
    matches = 0;
    totalPairs = 0;
    clicks = 0;
    $('#clicks').text('Clicks: 0');
    $('#pairs-left').text('Pairs Left: 0');
    $('#pairs-matched').text('Pairs Matched: 0');
    $('#total-pairs').text('Total Pairs: 0');
    $('#timer').text('Time: 0s');
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function showWinPopup() {
    $('#win-popup').addClass('show');
  }

  function hideWinPopup() {
    $('#win-popup').removeClass('show');
  }

  $('#close-lose-popup').click(() => {
    $('#lose-popup').removeClass('show');
  });

});
