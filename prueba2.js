89 % de almacenamiento usado … Si te quedas sin espacio, no podrás guardar archivos en Drive ni usar Gmail. Disfruta de 100 GB de almacenamiento por US$ 1,99 US$ 0,99 durante 1 mes.
const carousel = document.getElementById('carousel');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const pokemonList = document.getElementById('pokemonList');
const typeFilter = document.getElementById('typeFilter');
const weightFilter = document.getElementById('weightFilter');
const nameFilter = document.getElementById('nameFilter');

let allPokemon = []; // Guardaremos aquí todos los pokémon cargados

// Pokémons destacados para el carrusel
const featuredPokemon = ['bulbasaur', 'charmander', 'squirtle', 'pikachu', 'eevee', 'mewtwo'];

// Cargar datos y mostrar carrusel
async function loadFeatured() {
  for (const name of featuredPokemon) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const data = await res.json();
    const img = document.createElement('img');
    img.src = data.sprites.front_default;
    img.alt = data.name;
    carousel.appendChild(img);
  }
}

// Buscar pokémon por nombre o número
async function searchPokemon() {
  const query = searchInput.value.toLowerCase().trim();
  if (!query) return alert('Ingresa un nombre o número válido.');

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
    if (!res.ok) throw new Error('Pokémon no encontrado');
    const data = await res.json();
    displayPokemon([data]);
  } catch (error) {
    alert(error.message);
  }
}

// Mostrar pokémon en la lista
function displayPokemon(pokemonArray) {
  pokemonList.innerHTML = '';
  pokemonArray.forEach(pokemon => {
    const card = document.createElement('div');
    card.className = 'pokemon-card';

    const types = pokemon.types.map(t => t.type.name).join(', ');

    card.innerHTML = `
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
      <h3>#${pokemon.id} ${capitalize(pokemon.name)}</h3>
      <p><strong>Tipo:</strong> ${types}</p>
      <p><strong>Peso:</strong> ${pokemon.weight}</p>
    `;
    pokemonList.appendChild(card);
  });
}

// Cargar primeros 150 pokémon para filtros y listado
async function loadAllPokemon() {
  const promises = [];
  for(let i = 1; i <= 150; i++) {
    promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}`).then(res => res.json()));
  }
  allPokemon = await Promise.all(promises);
  populateTypeFilter();
  displayPokemon(allPokemon);
}

// Poner opciones de tipos en el filtro
function populateTypeFilter() {
  const typesSet = new Set();
  allPokemon.forEach(p => {
    p.types.forEach(t => typesSet.add(t.type.name));
  });

  typesSet.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = capitalize(type);
    typeFilter.appendChild(option);
  });
}

// Aplicar filtros de tipo, peso y nombre
function applyFilters() {
  let filtered = allPokemon;

  // Filtro tipo
  const selectedType = typeFilter.value;
  if(selectedType) {
    filtered = filtered.filter(p => p.types.some(t => t.type.name === selectedType));
  }

  // Filtro peso
  const selectedWeight = weightFilter.value;
  if(selectedWeight) {
    if(selectedWeight === 'light') filtered = filtered.filter(p => p.weight < 50);
    if(selectedWeight === 'medium') filtered = filtered.filter(p => p.weight >= 50 && p.weight <= 150);
    if(selectedWeight === 'heavy') filtered = filtered.filter(p => p.weight > 150);
  }

  // Filtro nombre
  const nameVal = nameFilter.value.toLowerCase().trim();
  if(nameVal) {
    filtered = filtered.filter(p => p.name.includes(nameVal));
  }

  displayPokemon(filtered);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Event listeners
searchBtn.addEventListener('click', searchPokemon);
typeFilter.addEventListener('change', applyFilters);
weightFilter.addEventListener('change', applyFilters);
nameFilter.addEventListener('input', applyFilters);

// Inicio
loadFeatured();
loadAllPokemon();
