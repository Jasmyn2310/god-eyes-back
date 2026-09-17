import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { v4 as uuidv4 } from 'uuid';
import {
  alerts,
  categories,
  devices,
  geofences,
  locations,
  plans,
  products,
  promotions,
  sales,
  users,
} from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is missing in .env');
}

const sql = postgres(connectionString, { max: 1, ssl: 'require' });
const db = drizzle(sql);

interface SeedVendorProduct {
  name: string;
  categoryName: string;
  description: string;
  price: string;
  imageUrl: string;
}

interface SeedVendorPromotion {
  title: string;
  description: string;
  discountPercent: string;
  promoPrice: string;
}

interface SeedVendorData {
  name: string;
  vendorType: string;
  priceRange: string;
  phone: string;
  description: string;
  fixedAddress: string;
  lat: number;
  lng: number;
  products: SeedVendorProduct[];
  promotions: SeedVendorPromotion[];
}

const AYACUCHO_VENDORS: SeedVendorData[] = [
  {
    name: 'Doña Flor - Caldos & Humitas',
    vendorType: 'Desayuno',
    priceRange: 'S/ 3 - S/ 10',
    phone: '+51 966 112 233',
    description: 'Tradición huamanguina: Caldo de mote caliente, humitas dulces y saladas recién hechas a la leña.',
    fixedAddress: 'Jr. 28 de Julio 145, a 1 cdra de Plaza Mayor, Huamanga',
    lat: -13.1618,
    lng: -74.2248,
    products: [
      {
        name: 'Caldo de Mote con Carne',
        categoryName: 'Caldos Tradicionales',
        description: 'Generoso tazón de caldo de res con mote tierno, hierbabuena y rocoto molido.',
        price: '8.00',
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Humitas Caseras al Vapor (2 uds)',
        categoryName: 'Desayunos & Entradas',
        description: 'Humitas de choclo criollo con pasas y canela o saladas con queso paria.',
        price: '4.00',
        imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Ponche de Habas Caliente',
        categoryName: 'Bebidas Calientes',
        description: 'Vaso de ponche caliente de habas tostadas con leche fresca y canela.',
        price: '2.50',
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: 'Combo Desayuno Huamanguino',
        description: '1 Caldo de Mote + 1 Humita dulce + 1 Ponche caliente por solo S/ 12.00',
        discountPercent: '15.00',
        promoPrice: '12.00',
      },
    ],
  },
  {
    name: 'Don Teófilo - Pan Chapla & Queso',
    vendorType: 'Desayuno',
    priceRange: 'S/ 2 - S/ 8',
    phone: '+51 966 223 344',
    description: 'El auténtico pan chapla huamanguino en horno artesanal, acompañado de quesos andinos de Cangallo.',
    fixedAddress: 'Portal Unión 18, Plaza Mayor de Huamanga',
    lat: -13.1604,
    lng: -74.2256,
    products: [
      {
        name: 'Bolsa de Pan Chapla (6 uds)',
        categoryName: 'Panes Tradicionales',
        description: 'Pan chapla tradicional caliente, suave y esponjoso horneado esta mañana.',
        price: '3.00',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Porción de Queso Paria Artesanal',
        categoryName: 'Lácteos & Acompañamientos',
        description: 'Queso fresco andino elaborado con leche pura de vaca.',
        price: '5.00',
        imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Café Pasado de la Selva Ayacuchana',
        categoryName: 'Bebidas Calientes',
        description: 'Café de grano recién pasado, aromático y reconfortante.',
        price: '3.00',
        imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: 'Desayuno Andino al Paso',
        description: '4 panes chapla + porción generosa de queso paria + café pasado',
        discountPercent: '10.00',
        promoPrice: '9.00',
      },
    ],
  },
  {
    name: 'Sánguches El Ayacuchano',
    vendorType: 'Snack',
    priceRange: 'S/ 5 - S/ 12',
    phone: '+51 966 334 455',
    description: 'Sánguches al paso de jamón ayacuchano artesanal y lechón al horno crujiente.',
    fixedAddress: 'Jr. Bellido 230, frente a Plazoleta María Parado de Bellido, Huamanga',
    lat: -13.1585,
    lng: -74.2242,
    products: [
      {
        name: 'Sánguche de Jamón del País Ayacuchano',
        categoryName: 'Sánguches Especiales',
        description: 'Pan artesanal con jamón ahumado criollo, sarsa criolla con hierbabuena y lechuga.',
        price: '7.50',
        imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Pan con Lechón Crocante',
        categoryName: 'Sánguches Especiales',
        description: 'Crujiente lechón dorado al horno con camote frito y ají huacatay.',
        price: '9.00',
        imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Chicha Morada Botellita 500ml',
        categoryName: 'Bebidas Refrescantes',
        description: 'Elaborada con maíz morado culli, piña, membrillo, manzana y limón.',
        price: '2.50',
        imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: 'Combo Lechón + Chicha',
        description: 'Sánguche de lechón crocante con chicha morada natural bien helada',
        discountPercent: '12.00',
        promoPrice: '10.00',
      },
    ],
  },
  {
    name: 'Anticuchos Mamá Julia',
    vendorType: 'Almuerzo',
    priceRange: 'S/ 8 - S/ 16',
    phone: '+51 966 445 566',
    description: 'Los mejores anticuchos de corazón a la parrilla en el tradicional barrio de los artesanos.',
    fixedAddress: 'Plazoleta de Santa Ana 102, Barrio Santa Ana, Huamanga',
    lat: -13.1652,
    lng: -74.2173,
    products: [
      {
        name: 'Porción de Anticuchos (2 palos)',
        categoryName: 'Parrillas & Brasas',
        description: 'Corazón macerado en ají panca, ajo y comino con papas doradas nativas y choclo.',
        price: '12.00',
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Combinado Rachi & Anticucho',
        categoryName: 'Parrillas & Brasas',
        description: '1 palo de anticucho de corazón acompañado de rachi tierno y crocante.',
        price: '14.00',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Chicha de Jora Artesanal 500ml',
        categoryName: 'Bebidas Ancestrales',
        description: 'Tradicional chicha de jora fermentada en cántaros de barro.',
        price: '3.00',
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: 'Promo Nocturna Huamanga',
        description: '2 porciones de anticuchos + 2 vasos de chicha de jora por S/ 25.00',
        discountPercent: '16.00',
        promoPrice: '25.00',
      },
    ],
  },
  {
    name: 'Jugos & Extractos La Huamanguina',
    vendorType: 'Bebidas',
    priceRange: 'S/ 4 - S/ 8',
    phone: '+51 966 556 677',
    description: 'Puesto emblemático dentro del Mercado Central: jugos energéticos, especiales con malta y frutas frescas.',
    fixedAddress: 'Jr. Carlos F. Vivanco 230, Puesto 45 Mercado Central, Huamanga',
    lat: -13.1628,
    lng: -74.2235,
    products: [
      {
        name: 'Jugo Especial Completo',
        categoryName: 'Jugos Especiales',
        description: 'Papaya, plátano, manzana, leche fresca, huevo, algarrobina y cerveza negra.',
        price: '6.50',
        imageUrl: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Extracto 3 Raíces Energético',
        categoryName: 'Extractos Medicinales',
        description: 'Zanahoria, betarraga, manzana verde, maca andina y miel pura de abeja.',
        price: '5.00',
        imageUrl: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Surtido Clásico de Frutas',
        categoryName: 'Jugos Naturales',
        description: 'Papaya, piña y plátano batidos con hielo frappé.',
        price: '4.50',
        imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31d9b?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: 'Recarga Matutina Mercado',
        description: 'Jugo especial + sánguche mixto de queso y palta por S/ 8.50',
        discountPercent: '15.00',
        promoPrice: '8.50',
      },
    ],
  },
  {
    name: 'Puyas & Tradición - Puca Picante',
    vendorType: 'Almuerzo',
    priceRange: 'S/ 12 - S/ 25',
    phone: '+51 966 667 788',
    description: 'Almuerzos típicos de fiesta: Puca picante con chicharrón dorado y cuy chactado al estilo huamanguino.',
    fixedAddress: 'Jr. Asamblea 380, Centro Histórico, Huamanga',
    lat: -13.1592,
    lng: -74.2231,
    products: [
      {
        name: 'Puca Picante con Chicharrón de Cerdo',
        categoryName: 'Platos Criollos',
        description: 'Guiso tradicional de papa menuda con maní tostado y ají panca, acompañado de chicharrón crocante y arroz.',
        price: '14.00',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Medio Cuy Chactado con Papas Doradas',
        categoryName: 'Platos Típicos Festivos',
        description: 'Cuy entero frito a la piedra bien crocante con ensalada criolla y papas nativas.',
        price: '28.00',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: 'Almuerzo Dominical Huamanga',
        description: 'Plato de Puca Picante + Vaso de Chicha de Jora por S/ 15.00',
        discountPercent: '12.00',
        promoPrice: '15.00',
      },
    ],
  },
  {
    name: 'El Rey del Salchipapa San Juan',
    vendorType: 'Snack',
    priceRange: 'S/ 6 - S/ 14',
    phone: '+51 966 778 899',
    description: 'Frente al Mercado Magdalena: salchipapas contundentes con papas amarillas huamanguinas y cremas caseras.',
    fixedAddress: 'Av. Mariscal Cáceres 890, Mercado Magdalena, San Juan Bautista, Huamanga',
    lat: -13.1672,
    lng: -74.2201,
    products: [
      {
        name: 'Salchipapa Clásica Huamanguina',
        categoryName: 'Comida Rápida',
        description: 'Papas nativas amarillas fritas en punto exacto, salchicha ahumada y todas las cremas.',
        price: '8.00',
        imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Pollo Broaster con Papas Fritas',
        categoryName: 'Comida Rápida',
        description: 'Presa de pollo crocante con cobertura especial y papas fritas abundantes.',
        price: '10.00',
        imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: 'Promo Amigos Salchipapa',
        description: '2 Salchipapas Especiales con huevo y queso por S/ 18.00',
        discountPercent: '18.00',
        promoPrice: '18.00',
      },
    ],
  },
  {
    name: 'Picarones & Mazamorras Doña Carmen',
    vendorType: 'Postres',
    priceRange: 'S/ 3 - S/ 6',
    phone: '+51 966 889 900',
    description: 'Fritura al instante: picarones bañados en miel de higos y mazamorra de calabaza de la Alameda.',
    fixedAddress: 'Alameda Valdelirios, Arco del Triunfo, Huamanga',
    lat: -13.1638,
    lng: -74.2263,
    products: [
      {
        name: 'Porción de Picarones Calientitos (4 uds)',
        categoryName: 'Dulces Típicos',
        description: 'Rosquillas de zapallo macre y camote bañadas en miel de chancaca con canela y clavo.',
        price: '5.00',
        imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Mazamorra de Calabaza Andina',
        categoryName: 'Dulces Típicos',
        description: 'Postre tradicional huamanguino de calabaza con leche fresca y canela molida.',
        price: '3.50',
        imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: 'Tarde Dulce en la Alameda',
        description: '1 porción de picarones + 1 vasito de mazamorra de calabaza por S/ 7.50',
        discountPercent: '12.00',
        promoPrice: '7.50',
      },
    ],
  },
  {
    name: 'Cevichería Al Paso El Puerto Andino',
    vendorType: 'Almuerzo',
    priceRange: 'S/ 10 - S/ 18',
    phone: '+51 966 990 011',
    description: 'Ceviche fresco de trucha serrana recién pescada y chicharrón de trucha crocante.',
    fixedAddress: 'Jr. Manco Cápac 310, Mercado Nery García Zárate, Huamanga',
    lat: -13.155,
    lng: -74.2215,
    products: [
      {
        name: 'Ceviche de Trucha Serrana',
        categoryName: 'Mariscos & Pescados',
        description: 'Trozos frescos de trucha andina marinada en limón norteño, choclo, camote y canchita.',
        price: '13.00',
        imageUrl: 'https://images.unsplash.com/photo-1535400255456-984241443b29?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Chicharrón de Trucha con Yuca',
        categoryName: 'Mariscos & Pescados',
        description: 'Chicharrón crocante de trucha con yucas fritas y sarsa criolla.',
        price: '15.00',
        imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: 'Dúo Marino Andino',
        description: 'Medio ceviche de trucha + medio chicharrón con chilcano de cortesía',
        discountPercent: '15.00',
        promoPrice: '18.00',
      },
    ],
  },
  {
    name: 'Helados Artesanales Muyuchi Doña Rosa',
    vendorType: 'Postres',
    priceRange: 'S/ 3 - S/ 7',
    phone: '+51 966 001 122',
    description: 'El helado tradicional de Ayacucho batido a mano en pailas de bronce sobre hielo y sal marina.',
    fixedAddress: 'Portal Constitución 22, Plaza Mayor de Huamanga',
    lat: -13.1608,
    lng: -74.226,
    products: [
      {
        name: 'Muyuchi Tradicional Huamanguino',
        categoryName: 'Helados Típicos',
        description: 'Helado batido a mano a base de leche, ajonjolí y canela, bañado con dulce de airampo.',
        price: '4.00',
        imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Copa Especial Muyuchi Doble Sabor',
        categoryName: 'Helados Típicos',
        description: 'Doble porción con miel de frutas nativas y barquillo artesanal.',
        price: '6.50',
        imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: '2x1 en Muyuchi los Viernes',
        description: 'Pide 1 vasito de muyuchi tradicional y llévate el segundo a mitad de precio',
        discountPercent: '25.00',
        promoPrice: '6.00',
      },
    ],
  },
  {
    name: 'Café & Empanadas Acuchimay',
    vendorType: 'Snack',
    priceRange: 'S/ 3 - S/ 8',
    phone: '+51 966 113 355',
    description: 'Puesto con vista panorámica de toda la ciudad de Huamanga: empanadas horneadas y café de altura.',
    fixedAddress: 'Mirador de Acuchimay, Carmen Alto, Huamanga',
    lat: -13.1725,
    lng: -74.223,
    products: [
      {
        name: 'Empanada de Carne Picada al Horno',
        categoryName: 'Empanadas Artesanales',
        description: 'Masa fina con relleno jugoso de lomo picado, huevo duro, aceituna y pasas.',
        price: '4.00',
        imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Café Pasado de Vilcabamba',
        categoryName: 'Cafetería Andina',
        description: 'Café orgánico de altura con notas achocolatadas servido bien caliente.',
        price: '3.50',
        imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: 'Tarde en el Mirador',
        description: '2 empanadas de carne + 2 cafés pasados para disfrutar la vista por S/ 13.00',
        discountPercent: '15.00',
        promoPrice: '13.00',
      },
    ],
  },
  {
    name: 'Desayunos Universitarios El Tío UNSCH',
    vendorType: 'Desayuno',
    priceRange: 'S/ 2 - S/ 6',
    phone: '+51 966 224 466',
    description: 'El favorito de los estudiantes: panes con palta huamanguina, huevo frito y quinua caliente.',
    fixedAddress: 'Av. Independencia 420, Puerta Principal UNSCH, Huamanga',
    lat: -13.1448,
    lng: -74.2182,
    products: [
      {
        name: 'Pan con Palta y Huevo Frito',
        categoryName: 'Panes & Sánguches',
        description: 'Pan chapla crujiente con palta fuerte recién molida y huevo frito al gusto.',
        price: '2.50',
        imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Vaso de Quinua con Manzana Caliente',
        categoryName: 'Bebidas Nutritivas',
        description: 'Quinua perlada andina cocida con trozos de manzana y canela aromática.',
        price: '1.50',
        imageUrl: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: 'Combo Estudiantil San Cristóbal',
        description: '2 panes con palta + vaso grande de quinua con leche por solo S/ 5.00',
        discountPercent: '20.00',
        promoPrice: '5.00',
      },
    ],
  },
  {
    name: 'Tamales Tradicionales Abuela Elena',
    vendorType: 'Desayuno',
    priceRange: 'S/ 3 - S/ 7',
    phone: '+51 966 335 577',
    description: 'Receta secreta de 3 generaciones: tamales huamanguinos envueltos en hoja de plátano con ají molido.',
    fixedAddress: 'Jr. Cusco con Jr. 9 de Diciembre 105, Huamanga',
    lat: -13.161,
    lng: -74.2222,
    products: [
      {
        name: 'Tamal Huamanguino de Cerdo Criollo',
        categoryName: 'Tamales Caseros',
        description: 'Masa suave de maíz blanco con trozo de cerdo tierno, huevo, aceituna y sarsa criolla.',
        price: '3.50',
        imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Tamal de Pollo con Aceitunas Botija',
        categoryName: 'Tamales Caseros',
        description: 'Tamal ligero de maíz seleccionado con pechuga de pollo deshilachada.',
        price: '3.00',
        imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: 'Desayuno Familiar de Tamales',
        description: '4 tamales surtidos + café pasado grande para llevar por S/ 14.00',
        discountPercent: '12.00',
        promoPrice: '14.00',
      },
    ],
  },
  {
    name: 'Comedor Criollo Doña Julia - Terminal',
    vendorType: 'Almuerzo',
    priceRange: 'S/ 8 - S/ 15',
    phone: '+51 966 446 688',
    description: 'Comida criolla casera para viajeros y transportistas: caldo de gallina y mondongo a la huamanguina.',
    fixedAddress: 'Av. Javier Pérez de Cuéllar 550, Terminal Terrestre Los Libertadores, Huamanga',
    lat: -13.1738,
    lng: -74.2125,
    products: [
      {
        name: 'Caldo de Gallina de Chacra',
        categoryName: 'Caldos Reparadores',
        description: 'Presa tierna de gallina de corral con fideos, papa amarilla, huevo duro y cebolla china.',
        price: '11.00',
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Mondonguito a la Huamanguina',
        categoryName: 'Platos Criollos',
        description: 'Mondongo en tiritas salteado con papas fritas, cebolla, tomate y ají amarillo con arroz.',
        price: '10.00',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: 'Menú Viajero Reparador',
        description: 'Caldo de Gallina + Refresco de cebada tostada por S/ 12.00',
        discountPercent: '10.00',
        promoPrice: '12.00',
      },
    ],
  },
  {
    name: 'Choclo con Queso Tía Meche',
    vendorType: 'Snack',
    priceRange: 'S/ 3 - S/ 7',
    phone: '+51 966 557 799',
    description: 'Choclo cusqueño gigante bien tierno servido al vapor con generosa tajada de queso paria andino.',
    fixedAddress: 'Plazoleta San Francisco de Paula, Jr. 28 de Julio con Jr. Vivanco, Huamanga',
    lat: -13.1622,
    lng: -74.2245,
    products: [
      {
        name: 'Choclo Entero con Tajada de Queso Paria',
        categoryName: 'Snacks Andinos',
        description: 'Choclo tierno recién hervido con anís dulce y una porción de queso fresco de vaca.',
        price: '5.00',
        imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Habas Tostadas con Canchita',
        categoryName: 'Snacks Andinos',
        description: 'Bolsa crocante de habas andinas tostadas al fogón con sal marina.',
        price: '2.50',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: 'Antojo de Tarde',
        description: '2 Choclos con queso + infusión de muña digestiva por S/ 10.00',
        discountPercent: '15.00',
        promoPrice: '10.00',
      },
    ],
  },
  {
    name: 'Emolientes & Infusiones Don Saturnino',
    vendorType: 'Bebidas',
    priceRange: 'S/ 2 - S/ 5',
    phone: '+51 966 668 811',
    description: 'Emoliente tradicional medicinal con linaza, boldo, uña de gato, sábila y gotas de alfalfa fresca.',
    fixedAddress: 'Jr. Callao 180, a pasos de la Plaza Mayor, Huamanga',
    lat: -13.16,
    lng: -74.225,
    products: [
      {
        name: 'Emoliente Especial con Sábila y Maca',
        categoryName: 'Bebidas Medicinales',
        description: 'Infusión caliente de hierbas medicinales andinas con linaza densa, jugo de limón y miel.',
        price: '2.50',
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Infusión Digestiva de Muña y Cedrón',
        categoryName: 'Bebidas Medicinales',
        description: 'Taza humeante de hierbas aromáticas recién cosechadas del valle de Huamanga.',
        price: '2.00',
        imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: 'Noche Abrigadora Huamanga',
        description: '2 Emolientes especiales con doble limón por S/ 4.00',
        discountPercent: '20.00',
        promoPrice: '4.00',
      },
    ],
  },
  {
    name: 'Broaster & Alitas El Triunfo',
    vendorType: 'Snack',
    priceRange: 'S/ 7 - S/ 15',
    phone: '+51 966 779 922',
    description: 'Pollo broaster crocante y alitas barbecue con papas nativas de la sierra.',
    fixedAddress: 'Jr. Tres Máscaras 140, Huamanga Centro',
    lat: -13.162,
    lng: -74.2265,
    products: [
      {
        name: '1/4 de Pollo Broaster Crocante',
        categoryName: 'Pollo Broaster',
        description: 'Pierna o pecho frito crocante con papas fritas y ensalada fresca.',
        price: '9.00',
        imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Porción de Alitas BBQ (4 uds)',
        categoryName: 'Alitas & Piques',
        description: 'Alitas bañadas en salsa barbacoa agridulce con papas doradas.',
        price: '10.50',
        imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: 'Promo Broaster Nocturno',
        description: '2 cuartos de broaster + gaseosa personal de 500ml por S/ 18.00',
        discountPercent: '15.00',
        promoPrice: '18.00',
      },
    ],
  },
  {
    name: 'Picantería Huamanguina La Tía Vicky',
    vendorType: 'Almuerzo',
    priceRange: 'S/ 10 - S/ 20',
    phone: '+51 966 880 033',
    description: 'Chicharrón de cerdo dorado en su propia manteca y picante de quinua tradicional.',
    fixedAddress: 'Jr. San Martín 260, Barrio La Magdalena, Huamanga',
    lat: -13.166,
    lng: -74.221,
    products: [
      {
        name: 'Chicharrón de Cerdo Criollo',
        categoryName: 'Chicharronería',
        description: 'Porción de trozos de cerdo tiernos y crocantes servidos con mote y sarsa criolla.',
        price: '15.00',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Picante de Quinua con Huevo Frito',
        categoryName: 'Platos Vegetarianos Andinos',
        description: 'Guiso cremoso de quinua perlada con queso fresco, leche y papas amarillas.',
        price: '10.00',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: 'Banquetazo Criollo',
        description: 'Plato de chicharrón + porción de picante de quinua por S/ 22.00',
        discountPercent: '12.00',
        promoPrice: '22.00',
      },
    ],
  },
  {
    name: 'Frutas & Ensaladas Doña Bertha',
    vendorType: 'Postres',
    priceRange: 'S/ 3 - S/ 7',
    phone: '+51 966 991 144',
    description: 'Ensaladas de frutas frescas cortadas al momento con miel de abeja y algarrobina.',
    fixedAddress: 'Av. Mariscal Cáceres 450, San Juan Bautista, Huamanga',
    lat: -13.1685,
    lng: -74.2195,
    products: [
      {
        name: 'Ensalada de Frutas Especial',
        categoryName: 'Frutas Frescas',
        description: 'Papaya, plátano, manzana, melón, fresas, yogurt natural y miel de abeja.',
        price: '5.50',
        imageUrl: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Vaso de Fresas con Crema Chantilly',
        categoryName: 'Postres Frescos',
        description: 'Fresas seleccionadas de la campiña ayacuchana con crema chantilly artesanal.',
        price: '4.50',
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: 'Combo Saludable Frutal',
        description: '2 ensaladas de frutas completas por solo S/ 9.00',
        discountPercent: '18.00',
        promoPrice: '9.00',
      },
    ],
  },
  {
    name: 'Papas Rellenas & Croquetas Don Manuel',
    vendorType: 'Snack',
    priceRange: 'S/ 3 - S/ 6',
    phone: '+51 966 002 255',
    description: 'Papas rellenas doradas y crocantes rellenas de carne molida sazonada y huevo duro.',
    fixedAddress: 'Jr. Chorro 120, Carmen Alto, Huamanga',
    lat: -13.171,
    lng: -74.222,
    products: [
      {
        name: 'Papa Rellena Criolla al Paso',
        categoryName: 'Frituras Tradicionales',
        description: 'Puré de papa amarilla relleno de carne picada, cebolla, pasas y aceituna con sarsa de cebolla.',
        price: '3.50',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Yuca Rellena con Queso Paria',
        categoryName: 'Frituras Tradicionales',
        description: 'Masa de yuca frita rellena de queso andino derretido con ají de pollería.',
        price: '3.50',
        imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&auto=format&fit=crop&q=60',
      },
    ],
    promotions: [
      {
        title: 'Dúo Relleno Huamanguino',
        description: '1 Papa rellena + 1 Yuca rellena con vaso de chicha morada por S/ 8.00',
        discountPercent: '15.00',
        promoPrice: '8.00',
      },
    ],
  },
];

const SEED_PLANS = [
  {
    id: 'plan-vendedor-basico',
    name: 'Vendedor Básico',
    price: '15.00',
    description: 'Aparece en el mapa en vivo, perfil comercial y catálogo de hasta 10 productos.',
    isPopular: false,
    targetRole: 'vendor',
    durationDays: 30,
  },
  {
    id: 'plan-vendedor-pro',
    name: 'Vendedor Pro',
    price: '39.00',
    description: 'Seguimiento GPS en tiempo real, catálogo ilimitado, promociones destacadas y reporte de ventas.',
    isPopular: true,
    targetRole: 'vendor',
    durationDays: 30,
  },
  {
    id: 'plan-cliente-plus',
    name: 'Usuario Explorador',
    price: '9.90',
    description: 'Alertas de llegada de comerciantes favoritos, ofertas exclusivas y navegación sin anuncios.',
    isPopular: false,
    targetRole: 'client',
    durationDays: 30,
  },
  {
    id: 'plan-cliente-vip',
    name: 'Usuario VIP GodEyes',
    price: '19.90',
    description: 'Acceso anticipado a promociones, cupones de descuento y geocercas personalizadas.',
    isPopular: true,
    targetRole: 'client',
    durationDays: 30,
  },
];

async function seed(): Promise<void> {
  console.log('Iniciando seed de datos para Ayacucho - Huamanga...');
  try {
    await db.delete(alerts);
    await db.delete(locations);
    await db.delete(geofences);
    await db.delete(devices);
    await db.delete(sales);
    await db.delete(promotions);
    await db.delete(products);
    await db.delete(categories);
    await db.delete(users);
    await db.delete(plans);

    for (const plan of SEED_PLANS) {
      await db.insert(plans).values(plan);
    }
    console.log('Planes registrados.');

    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await db.insert(users).values({
      id: uuidv4(),
      email: 'admin@godeyes.com',
      passwordHash: adminPasswordHash,
      name: 'Administrador GodEyes',
      photoUrl: 'https://ui-avatars.com/api/?name=Admin+GodEyes&background=0D8ABC&color=fff&size=150',
      role: 'ADMIN',
    });
    console.log('Admin creado (admin@godeyes.com).');

    const clientPasswordHash = await bcrypt.hash('cliente123', 10);
    await db.insert(users).values({
      id: uuidv4(),
      email: 'cliente@godeyes.com',
      passwordHash: clientPasswordHash,
      name: 'Cliente GodEyes',
      photoUrl: 'https://ui-avatars.com/api/?name=Cliente+GodEyes&background=10B981&color=fff&size=150',
      role: 'client',
    });
    console.log('Cliente creado (cliente@godeyes.com).');

    const vendorPasswordHash = await bcrypt.hash('vendor123', 10);

    for (let index = 0; index < AYACUCHO_VENDORS.length; index++) {
      const vendorData = AYACUCHO_VENDORS[index];
      const vendorId = uuidv4();
      const deviceId = uuidv4();
      const locationId = uuidv4();

      const photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(vendorData.name)}&background=random&size=150`;

      await db.insert(users).values({
        id: vendorId,
        email: `vendor${index}@godeyes.test`,
        passwordHash: vendorPasswordHash,
        name: vendorData.name,
        photoUrl,
        vendorType: vendorData.vendorType,
        priceRange: vendorData.priceRange,
        phone: vendorData.phone,
        description: vendorData.description,
        fixedAddress: vendorData.fixedAddress,
        fixedLatitude: vendorData.lat.toFixed(8),
        fixedLongitude: vendorData.lng.toFixed(8),
        role: 'vendor',
      });

      const categoriesMap = new Map<string, string>();
      for (const prod of vendorData.products) {
        if (!categoriesMap.has(prod.categoryName)) {
          const catId = uuidv4();
          await db.insert(categories).values({
            id: catId,
            vendorId,
            name: prod.categoryName,
          });
          categoriesMap.set(prod.categoryName, catId);
        }
      }

      for (const prod of vendorData.products) {
        const catId = categoriesMap.get(prod.categoryName);
        await db.insert(products).values({
          id: uuidv4(),
          vendorId,
          categoryId: catId ?? null,
          name: prod.name,
          description: prod.description,
          price: prod.price,
          imageUrl: prod.imageUrl,
          isAvailable: true,
        });
      }

      for (const promo of vendorData.promotions) {
        await db.insert(promotions).values({
          id: uuidv4(),
          vendorId,
          title: promo.title,
          description: promo.description,
          discountPercent: promo.discountPercent,
          promoPrice: promo.promoPrice,
          isActive: true,
        });
      }

      const calculatedBattery = (75 + ((index * 4) % 24)).toFixed(2);
      await db.insert(devices).values({
        id: deviceId,
        userId: vendorId,
        name: `GPS Baliza ${vendorData.name}`,
        batteryLevel: calculatedBattery,
        status: 'online',
        lastConnection: new Date(),
      });

      const isLiveRecently = index % 2 === 0;
      const minutesAgo = isLiveRecently ? index * 2 : 60 + index * 10;
      const locationTimestamp = new Date(Date.now() - minutesAgo * 60 * 1000);

      const latOffset = (Math.random() - 0.5) * 0.0015;
      const lngOffset = (Math.random() - 0.5) * 0.0015;
      const currentLat = (vendorData.lat + latOffset).toFixed(8);
      const currentLng = (vendorData.lng + lngOffset).toFixed(8);

      await db.insert(locations).values({
        id: locationId,
        deviceId,
        latitude: currentLat,
        longitude: currentLng,
        speed: isLiveRecently ? '0.80' : '0.00',
        accuracy: '4.50',
        timestamp: locationTimestamp,
      });

      if (index < 5) {
        await db.insert(geofences).values({
          id: uuidv4(),
          userId: vendorId,
          name: `Zona Operativa ${vendorData.name}`,
          latitude: vendorData.lat.toFixed(8),
          longitude: vendorData.lng.toFixed(8),
          radius: '500.00',
          isActive: true,
        });
      }

      if (index === 1 || index === 4) {
        await db.insert(alerts).values({
          id: uuidv4(),
          deviceId,
          type: 'battery_warning',
          message: `Dispositivo ${vendorData.name} con batería al ${calculatedBattery}%`,
          isRead: false,
        });
      }
    }

    console.log(`Se sembraron exitosamente ${AYACUCHO_VENDORS.length} puestos y vendedores reales en Ayacucho - Huamanga con sus categorías, productos y promociones.`);
  } catch (error) {
    console.error('Error durante el seed de la base de datos:', error);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

void seed();
