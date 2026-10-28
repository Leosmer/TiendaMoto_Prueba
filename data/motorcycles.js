/**
 * ============================================================
 * APEX MOTO — Mock Data: Catálogo de Motocicletas
 * ============================================================
 * Contiene datos de prueba para al menos 8 modelos de motos
 * con diferentes categorías, marcas y estados.
 */

const MOTORCYCLES = [
  {
    id: 1,
    model: "Panigale V4 SP2",
    brand: "Ducati",
    type: "Deportiva",
    cc: 1103,
    hp: 210,
    torque: "124 Nm",
    weight: 173,
    tank: 16,
    brakes: "Brembo Stylema R",
    price: 42900,
    condition: "Nuevo",
    year: 2026,
    color: "Winter Test Livery",
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
      "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80"
    ],
    description: "La superbike definitiva de Ducati. Motor Desmosedici Stradale V4, electrónica MotoGP y aerodinámica avanzada.",
    featured: true
  },
  {
    id: 2,
    model: "MT-09 SP",
    brand: "Yamaha",
    type: "Naked",
    cc: 890,
    hp: 119,
    torque: "93 Nm",
    weight: 190,
    tank: 14,
    brakes: "Brembo radial",
    price: 12500,
    condition: "Nuevo",
    year: 2026,
    color: "Icon Performance",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
      "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800&q=80",
      "https://images.unsplash.com/photo-1558980664-769d59546b3d?w=800&q=80"
    ],
    description: "Agresividad naked con motor CP3 de triple cilindro. Suspensión Öhlins, frenos Brembo y electrónica de última generación.",
    featured: false
  },
  {
    id: 3,
    model: "Africa Twin 1100",
    brand: "Honda",
    type: "Enduro",
    cc: 1084,
    hp: 102,
    torque: "105 Nm",
    weight: 226,
    tank: 24.8,
    brakes: "Doble disco 310mm",
    price: 18900,
    condition: "Nuevo",
    year: 2025,
    color: "Grand Prix Red",
    image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80",
      "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80"
    ],
    description: "La aventurera por excelencia. DCT opcional, tracción trasera y electrónica HSTC para conquistar cualquier terreno.",
    featured: false
  },
  {
    id: 4,
    model: "Sportster S",
    brand: "Harley-Davidson",
    type: "Custom",
    cc: 1252,
    hp: 121,
    torque: "127 Nm",
    weight: 228,
    tank: 11.8,
    brakes: "Brembo doble disco",
    price: 16999,
    condition: "Nuevo",
    year: 2026,
    color: "Vivid Black",
    image: "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=800&q=80",
      "https://images.unsplash.com/photo-1558981852-426c6c22a060?w=800&q=80",
      "https://images.unsplash.com/photo-1558981033-7c0a19beb28d?w=800&q=80"
    ],
    description: "La nueva era Sportster. Motor Revolution Max 1250T refrigerado por líquido con el carácter inconfundible H-D.",
    featured: true
  },
  {
    id: 5,
    model: "Z900",
    brand: "Kawasaki",
    type: "Naked",
    cc: 948,
    hp: 125,
    torque: "98.6 Nm",
    weight: 210,
    tank: 17,
    brakes: "Doble disco 300mm",
    price: 11200,
    condition: "Usado",
    year: 2024,
    color: "Metallic Spark Black",
    image: "https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=800&q=80",
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
      "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800&q=80"
    ],
    description: "Supernaked con diseño Sugomi. Motor tetracilíndrico en línea, chasis ligero y una relación precio-rendimiento imbatible.",
    featured: false
  },
  {
    id: 6,
    model: "R 1250 GS Adventure",
    brand: "BMW",
    type: "Enduro",
    cc: 1254,
    hp: 136,
    torque: "143 Nm",
    weight: 268,
    tank: 30,
    brakes: "Brembo integral ABS Pro",
    price: 24500,
    condition: "Nuevo",
    year: 2026,
    color: "GS Trophy",
    image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&q=80",
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80",
      "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80"
    ],
    description: "La reina del adventure touring. Motor boxer ShiftCam, Dynamic ESA, pantalla TFT 6.5\" y conectividad total.",
    featured: false
  },
  {
    id: 7,
    model: "CBR600RR",
    brand: "Honda",
    type: "Deportiva",
    cc: 599,
    hp: 121,
    torque: "63 Nm",
    weight: 186,
    tank: 18,
    brakes: "Doble disco 310mm Nissin",
    price: 13800,
    condition: "Usado",
    year: 2023,
    color: "Grand Prix Red/Black",
    image: "https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800&q=80",
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80"
    ],
    description: "La supersport de referencia. Línea directa con la RC213V de MotoGP, winglets aerodinámicos y electrónica avanzada.",
    featured: false
  },
  {
    id: 8,
    model: "XMAX 300",
    brand: "Yamaha",
    type: "Scooter",
    cc: 292,
    hp: 27.6,
    torque: "29.4 Nm",
    weight: 179,
    tank: 13,
    brakes: "Disco 267mm / 245mm ABS",
    price: 7200,
    condition: "Nuevo",
    year: 2026,
    color: "Power Grey",
    image: "https://images.unsplash.com/photo-1622185135505-2d795003994a?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1622185135505-2d795003994a?w=800&q=80",
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
      "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800&q=80"
    ],
    description: "El maxi-scooter premium para la ciudad. Motor Blue Core, conectividad smartphone, amplio espacio de almacenamiento.",
    featured: false
  }
];

/**
 * Marcas aliadas / Partners
 */
const PARTNER_BRANDS = [
  { name: "Ducati", logo: "🏁" },
  { name: "Yamaha", logo: "🔵" },
  { name: "Honda", logo: "🔴" },
  { name: "Kawasaki", logo: "🟢" },
  { name: "BMW Motorrad", logo: "🔷" },
  { name: "Harley-Davidson", logo: "🟠" }
];

/**
 * Testimonios de clientes
 */
const TESTIMONIALS = [
  {
    name: "Carlos Mendoza",
    avatar: "CM",
    rating: 5,
    text: "Compré mi Ducati Panigale aquí y la experiencia fue inigualable. El equipo de Apex Moto me asesoró en cada paso, desde la financiación hasta los accesorios. ¡Totalmente recomendados!",
    bike: "Ducati Panigale V4",
    date: "Oct 2026"
  },
  {
    name: "Valentina Ríos",
    avatar: "VR",
    rating: 5,
    text: "El servicio de taller es excepcional. Llevé mi BMW GS para mantenimiento y quedó como nueva. El personal es profesional y los tiempos de entrega se respetan al pie de la letra.",
    bike: "BMW R 1250 GS",
    date: "Sep 2026"
  },
  {
    name: "Andrés Jiménez",
    avatar: "AJ",
    rating: 4,
    text: "La calculadora de financiación me ayudó a planificar la compra de mi Yamaha MT-09. El proceso fue transparente y sin sorpresas. Gran variedad de opciones de pago.",
    bike: "Yamaha MT-09 SP",
    date: "Ago 2026"
  },
  {
    name: "Isabella Torres",
    avatar: "IT",
    rating: 5,
    text: "Apex Moto no es solo una tienda, es una comunidad. Los eventos de riders, el asesoramiento personalizado y la calidad del servicio postventa son de otro nivel.",
    bike: "Kawasaki Z900",
    date: "Jul 2026"
  }
];

/**
 * Servicios del taller
 */
const SERVICES = [
  {
    id: "maintenance",
    title: "Mantenimiento Preventivo",
    icon: "🔧",
    description: "Cambio de aceite, filtros, revisión de frenos, cadena y componentes críticos. Protocolos certificados por cada marca.",
    features: ["Diagnóstico computarizado", "Aceites sintéticos premium", "Check-list de 42 puntos"]
  },
  {
    id: "parts",
    title: "Repuestos Originales",
    icon: "⚙️",
    description: "Acceso directo a catálogos de repuestos originales de todas las marcas que distribuimos, con garantía de fábrica.",
    features: ["Envío express", "Garantía de fábrica", "Asesoría técnica incluida"]
  },
  {
    id: "custom",
    title: "Personalización",
    icon: "🎨",
    description: "Transformá tu moto con accesorios, pintura custom, escape deportivo, suspensión y electrónica de alto rendimiento.",
    features: ["Diseño 3D previo", "Marcas premium", "Instalación profesional"]
  },
  {
    id: "warranty",
    title: "Garantía Extendida",
    icon: "🛡️",
    description: "Planes de garantía extendida de hasta 5 años con cobertura total de motor, transmisión y componentes electrónicos.",
    features: ["Cobertura total", "Asistencia en ruta 24/7", "Sin deducible"]
  }
];
