// ===== 1. Estado global =====

const pokemons = {
  pokemon1: null,
  pokemon2: null,
};

// UI components
const idInput1 = document.getElementById("pokemon-id-1");
const searchButton1 = document.getElementById("search-button-1");
const errorMessage1 = document.getElementById("error-1");
const cardContainer1 = document.getElementById("card-container-1");
const pokemonSection1 = document.getElementById("pokemon-section-1");

const idInput2 = document.getElementById("pokemon-id-2");
const searchButton2 = document.getElementById("search-button-2");
const errorMessage2 = document.getElementById("error-2");
const cardContainer2 = document.getElementById("card-container-2");
const pokemonSection2 = document.getElementById("pokemon-section-2");

const battleButton = document.getElementById("battle-button");
const battleResult = document.getElementById("battle-result");


// ===== 2. Utilidades =====
function capitalizeFirstLetter(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

// ===== 3. Renderizado de UI =====

// Renderiza la card con los datos del pokemon, datos que saca del state
function renderPokemonCard(position) {
  let pokemon;
  let container;
  if (position === 1) {
    container = cardContainer1;
    pokemon = pokemons.pokemon1;
  } else {
    container = cardContainer2;
    pokemon = pokemons.pokemon2;
  }


  container.innerHTML = `
    <div class="pokemon-card">
      <div class="pokemon-image-container">
        <img src="${pokemon.image}" alt="${pokemon.name}" class="pokemon-image">
      </div>
      <h2 class="pokemon-name">${pokemon.name}</h2>
      <div class="pokemon-stat">
        <span class="stat-label">type: </span>
        <span class="pokemon-type type-${pokemon.type}">${pokemon.type}</span>
      </div>
      <div class="pokemon-stat">
        <span class="stat-label">attack: </span>
        <span class="stat-value">${pokemon.attack}</span>
      </div>
      <div class="pokemon-stat">
        <span class="stat-label">hp: </span>
        <span class="stat-value">${pokemon.hp}</span>
      </div>
    </div>
  `;
}


// Muestra un mensaje abajo del boton de pelea
function renderBattleResult(winner, pokemonName) {
  battleResult.style.display = "block";

  // Empate
  if (winner === 0) {
    battleResult.textContent = "¡Es un empate! Ambos Pokémon tienen el mismo ataque.";
  } else {
    battleResult.textContent = `¡El Pokémon ${pokemonName} gana la batalla con mayor ataque!`;
  }
}

// Hace el background del ganador verdecito
function updateWinnerBg(winner) {
  pokemonSection1.classList.toggle("winner", winner === 1);
  pokemonSection2.classList.toggle("winner", winner === 2);
}

// Reseteas la UI a un estado "cero"
function resetUI() {
  pokemonSection1.classList.remove("winner");
  pokemonSection2.classList.remove("winner");
  battleResult.style.display = "none";
}


// Muestra mensaje de error en la posición correspondiente
function setError(position, errorMessage) {
  const emptyCardTemplate = `
  <div class="pokemon-card empty">
    <p>Ingresa un ID para buscar un Pokémon</p>
  </div>
`;
  if (position === 1) {
    errorMessage1.textContent = errorMessage;
    idInput1.classList.toggle("input-error", !!errorMessage);
    cardContainer1.innerHTML = emptyCardTemplate;
  } else {
    errorMessage2.textContent = errorMessage;
    idInput2.classList.toggle("input-error", !!errorMessage);
    cardContainer2.innerHTML = emptyCardTemplate;
  }
}

// Muestra los spinners mientras busca los datos
function setLoading(position) {
  const loader = '<div class="loader"></div>';
  const cardLoader = `
     <div class="pokemon-card empty">
        <div class="loader"></div>
      </div>
    `;
  if (position === 1) {
    cardContainer1.innerHTML = cardLoader;
    searchButton1.innerHTML = loader;
    searchButton1.disabled = true;
  } else {
    cardContainer2.innerHTML = cardLoader;
    searchButton2.innerHTML = loader;
    searchButton2.disabled = true;
  }
}

function clearWinner() {
  pokemonSection1.classList.remove('winner');
  pokemonSection2.classList.remove('winner');

  battleResult.innerText = '';
}

function clearLoading(position) {
  if (position === 1) {
    searchButton1.textContent = "Buscar";
    searchButton1.disabled = false;
    return;
  }
  searchButton2.textContent = "Buscar";
  searchButton2.disabled = false;
}


// ===== 4. Validaciones y lógica de batalla =====

/**
 * Si el user aún no ha cargado los dos pokemones, 
 * mostras un mensaje de error en el input que corresponda
*/
function arePokemonsSearched() {
  if (!pokemons.pokemon1 && !pokemons.pokemon2) {
    setError(1, "Por favor ingresa un ID");
    setError(2, "Por favor ingresa un ID");
    return false;
  }
  if (!pokemons.pokemon1) {
    setError(1, "Por favor ingresa un ID");
    return false;
  }
  if (!pokemons.pokemon2) {
    setError(2, "Por favor ingresa un ID");
    return false;
  }
  return true;
}

function clearPokemonState(position) {
  if(position === 1) {
    pokemons.pokemon1 = null;
  } else {
    pokemons.pokemon2 = null
  }
}

function handleBattle() {
  // Si hay un error no seguís con la ejecución  
  if (!arePokemonsSearched()) return;

  clearWinner()
  
  // Obtenes el ganador
  let winner;
  let pokemonWinnerName;
  if (pokemons.pokemon1.attack > pokemons.pokemon2.attack) {
    winner = 1;
    pokemonWinnerName = pokemons.pokemon1.name;
  } else if (pokemons.pokemon2.attack > pokemons.pokemon1.attack) {
    pokemonWinnerName = pokemons.pokemon2.name;
    winner = 2;
  } else {
    winner = 0; // Empate
  }
  pokemonWinnerName = capitalizeFirstLetter(pokemonWinnerName);
  renderBattleResult(winner, pokemonWinnerName);
  updateWinnerBg(winner);
}

// ===== 5. Adaptador y petición HTTP =====

// Adapta la respuesta a una interfaz más manejable
function pokemonAdapter(pokemon) {
  return {
    id: pokemon.id,
    name: pokemon.name,
    image:
      pokemon.sprites.other["official-artwork"].front_default ||
      pokemon.sprites.front_default,
    type: pokemon.types[0].type.name,
    attack:
      pokemon.stats.find((stat) => stat.stat.name === "attack")?.base_stat || 0,
    hp: pokemon.stats.find((stat) => stat.stat.name === "hp")?.base_stat || 0,
  };
}



// Busca el pokemon con el input del usuario
async function fetchPokemon(id, position) {
  // Si no puso nada en el input, mostras el mensaje de error y no continuas con la ejecución
  if (!id.trim()) {
    setError(position, "Por favor ingresa un ID");
    return;
  }

  try {
    // Limpias el error (si es que hay) y el ganador cada vez que buscas a un nuevo pokemon
    setError(position, "");
    clearWinner()

    setLoading(position);

    // Delay de 1 segundo para que se vea el loader (efecto visual)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);

    // 404 es el status "not-found"
    if (res.status === 404) {
      throw new Error(`Pokemon ${id} no encontrado`);
    }

    const pokemonRaw = await res.json();
    const pokemon = pokemonAdapter(pokemonRaw); // Adaptamos la respuesta de la API

    // Seteamos el pokemon al input que se este 
    if (position === 1) {
      pokemons.pokemon1 = pokemon;
    } else {
      pokemons.pokemon2 = pokemon;
    }

    renderPokemonCard(position);
  } catch (er) {
    console.error(er);
    clearPokemonState(position)
    setError(position, `Error: ${er.message}`);
  } finally {
    // Quitas el spinner cuando ya se realizo el fetch, ya sea que salio bien o no
    clearLoading(position);
  }
}


// ===== 6. Eventos del DOM =====

searchButton1.addEventListener("click", function () {
  fetchPokemon(idInput1.value, 1);
});

searchButton2.addEventListener("click", () => {
  fetchPokemon(idInput2.value, 2);
});

battleButton.addEventListener("click", handleBattle);
