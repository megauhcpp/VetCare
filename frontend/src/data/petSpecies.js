// Definir las opciones de especies y sus razas
export const especies = {
  perro: [
    'Labrador Retriever',
    'Pastor Alemán',
    'Golden Retriever',
    'Bulldog',
    'Beagle',
    'Poodle',
    'Rottweiler',
    'Yorkshire Terrier',
    'Boxer',
    'Dachshund',
    'Chihuahua',
    'Shih Tzu',
    'Otro'
  ],
  gato: [
    'Siamés',
    'Persa',
    'Maine Coon',
    'Ragdoll',
    'Bengalí',
    'Sphynx',
    'Abisinio',
    'Británico de Pelo Corto',
    'Otro'
  ],
  conejo: [
    'Holandés Enano',
    'Angora',
    'Rex',
    'Belier',
    'Cabeza de León',
    'Otro'
  ],
  hamster: [
    'Dorado',
    'Ruso',
    'Roborovski',
    'Chino',
    'Otro'
  ],
  cobaya: [
    'Americana',
    'Abisinia',
    'Peruana',
    'Coronet',
    'Otro'
  ],
  huron: [
    'Hurón Doméstico',
    'Otro'
  ],
  chinchilla: [
    'Chinchilla Doméstica',
    'Otro'
  ],
  rata: [
    'Rata Doméstica',
    'Otro'
  ],
  raton: [
    'Ratón Doméstico',
    'Otro'
  ],
  erizo: [
    'Erizo Pigmeo Africano',
    'Otro'
  ],
  periquito: [
    'Australiano',
    'Inglés',
    'Otro'
  ],
  canario: [
    'Canario Doméstico',
    'Otro'
  ],
  agapornis: [
    'Agapornis (Inseparable)',
    'Otro'
  ],
  loro: [
    'Gris Africano',
    'Amazonas',
    'Guacamayo',
    'Otro'
  ],
  cacatua: [
    'Cacatúa',
    'Otro'
  ],
  ninfa: [
    'Ninfa (Carolina)',
    'Otro'
  ],
  gallina: [
    'Gallina Doméstica',
    'Otro'
  ],
  pato: [
    'Pato Doméstico',
    'Otro'
  ],
  pez_dorado: [
    'Goldfish',
    'Otro'
  ],
  betta: [
    'Pez Betta',
    'Otro'
  ],
  guppy: [
    'Guppy',
    'Otro'
  ],
  molly: [
    'Molly',
    'Otro'
  ],
  tetra: [
    'Tetra Neón',
    'Otro'
  ],
  disco: [
    'Pez Disco',
    'Otro'
  ],
  tortuga: [
    'Tortuga de Orejas Rojas',
    'Tortuga de Tierra',
    'Otro'
  ],
  iguana: [
    'Iguana Verde',
    'Otro'
  ],
  gecko: [
    'Gecko Leopardo',
    'Otro'
  ],
  serpiente: [
    'Serpiente del Maíz',
    'Pitón Bola',
    'Otro'
  ],
  dragon: [
    'Dragón Barbudo',
    'Otro'
  ],
  ajolote: [
    'Ajolote',
    'Otro'
  ],
  rana: [
    'Rana Africana Enana',
    'Rana Pacman',
    'Otro'
  ]
};

// Agrupar especies por categoría para mostrar en el select
export const categoriasEspecies = {
  'Mamíferos domésticos': ['perro', 'gato', 'conejo', 'hamster', 'cobaya', 'huron', 'chinchilla', 'rata', 'raton', 'erizo'],
  'Aves domésticas': ['periquito', 'canario', 'agapornis', 'loro', 'cacatua', 'ninfa', 'gallina', 'pato'],
  'Peces ornamentales': ['pez_dorado', 'betta', 'guppy', 'molly', 'tetra', 'disco'],
  'Reptiles domésticos': ['tortuga', 'iguana', 'gecko', 'serpiente', 'dragon'],
  'Anfibios domésticos': ['ajolote', 'rana']
};

// Opciones de sexo
export const sexos = ['macho', 'hembra']; 