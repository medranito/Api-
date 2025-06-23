const carousel = document.getElementById('carousel');
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

// Mostrar pokémon en la lista
function displayPokemon(pokemonArray) {
pokemonList.innerHTML = '';
pokemonArray.forEach(pokemon => {
const card = document.createElement('div');
card.className = 'pokemon-card';

const types = pokemon.types.map(t => t.type.name).join(', ');

card.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
    <h3><a href="https://www.pokemon.com/el/pokedex/${pokemon.name}" target="_blank">
    #${pokemon.id} ${capitalize(pokemon.name)}
    </a></h3>
    <p><strong>Tipo:</strong> ${types}</p>
    <p><strong>Peso:</strong> ${pokemon.weight}</p>
    <div class="details"></div>
`;

// Manejar expansión animada
card.addEventListener('click', async () => {
    const detailsDiv = card.querySelector('.details');
    if (!detailsDiv.classList.contains('open')) {
    const details = await getPokemonDetails(pokemon);
    detailsDiv.innerHTML = details;
    detailsDiv.classList.add('open');
    card.classList.add('expanded');

    // Ocultar título y datos, pero NO la imagen
    [...card.children].forEach(child => {
        if (!child.classList.contains('details') && child.tagName !== 'IMG') {
        child.style.display = 'none';
        }
    });

    } else {
    detailsDiv.classList.remove('open');
    card.classList.remove('expanded');
    detailsDiv.innerHTML = '';

    // Restaurar todo menos detalles
    [...card.children].forEach(child => {
        if (!child.classList.contains('details')) {
        child.style.display = '';
        }
    });
    }
});

pokemonList.appendChild(card);
});
}

async function getPokemonDetails(pokemon) {
const speciesRes = await fetch(pokemon.species.url);
const speciesData = await speciesRes.json();
const evoRes = await fetch(speciesData.evolution_chain.url);
const evoData = await evoRes.json();

const evolutions = [];
let evoChain = evoData.chain;

do {
evolutions.push(evoChain.species.name);
evoChain = evoChain.evolves_to[0];
} while (evoChain && evoChain.hasOwnProperty('evolves_to'));

// Obtener imágenes de evoluciones
const evoPromises = evolutions.map(name => 
fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(res => res.json())
);

const evoDataArray = await Promise.all(evoPromises);

const evolutionHTML = evoDataArray.map(evo => `
<div class="evolution">
    <img src="${evo.sprites.front_default}" alt="${evo.name}" />
    <p>${capitalize(evo.name)}</p>
</div>
`).join('');

return `
<p><strong>Altura:</strong> ${pokemon.height}</p>
<p><strong>Habilidades:</strong> ${pokemon.abilities.map(a => a.ability.name).join(', ')}</p>
<p><strong>Evoluciones:</strong></p>
<div class="evolution-chain">
    ${evolutionHTML}
</div>
`;
}

// Cargar todos los Pokémon para filtros y listado
async function loadAllPokemon() {
const promises = [];
for(let i = 1; i <= 1024; i++) {
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

// Aplicar filtros de tipo, peso y nombre/número
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

// Filtro por nombre o número
const nameVal = nameFilter.value.toLowerCase().trim();
if(nameVal) {
filtered = filtered.filter(p => 
    p.name.includes(nameVal) || p.id.toString() === nameVal
);
}

displayPokemon(filtered);
}

function capitalize(str) {
return str.charAt(0).toUpperCase() + str.slice(1);
}

// Event listeners
typeFilter.addEventListener('change', applyFilters);
weightFilter.addEventListener('change', applyFilters);
nameFilter.addEventListener('input', applyFilters);

// Inicio
loadFeatured();
loadAllPokemon();
