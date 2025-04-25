const baseUrl = 'https://pokeapi.co/api/v2/pokemon';
async function apiFetch(endpoint) {
  const res = await fetch(baseUrl + endpoint);
  const data = await res.json();
  return data;
}

async function fetchPokemonById(id) {
  const res = await apiFetch('/' + id);
  return res;
}

function getPokemonStat(pokemon, stat) {
  return pokemon.stats.find(s => s.stat.name === stat).base_stat
}

async function renderPokemonCard(pokemon, parent) {
  const container = document.createElement('div');
  container.classList.add('pokemon-card');

  const pokemonNameItem = document.createElement('h3');
  const pokemonAttack = document.createElement('h4');
  const pokemonHp = document.createElement('h4');
  const pokemonImage = document.createElement('img');
  const attack = getPokemonStat(pokemon, 'attack');
  const hp = getPokemonStat(pokemon, 'hp');
  const imageUrl = pokemon.sprites.front_default;

  pokemonNameItem.innerText = pokemon.name.toUpperCase();
  pokemonAttack.innerText = 'Attack: ' + attack;
  pokemonHp.innerText = 'HP: ' + hp;
  pokemonImage.src = imageUrl;

  container.appendChild(pokemonImage)
  container.appendChild(pokemonNameItem)
  container.appendChild(pokemonAttack)
  container.appendChild(pokemonHp)
  parent.appendChild(container);
}

async function main() {
  
  const pokemon1 = await fetchPokemonById(10);
  const pokemon2 = await fetchPokemonById(120);
  const container = document.getElementById('container')
  console.log(pokemon1)
  renderPokemonCard(pokemon1, container)
  renderPokemonCard(pokemon2, container)
}

main()