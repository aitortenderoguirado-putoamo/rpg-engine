import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// --- CONFIGURATION CONSTANTS ---

const WORLDS = [
  { id: "medieval", name: "Fantasía Medieval", desc: "Espadas, hechicería, castillos en ruinas y antiguas profecías." },
  { id: "scifi", name: "Ciencia Ficción", desc: "Ciberpunk, viajes espaciales, implantes cibernéticos y mega-corporaciones." },
  { id: "history", name: "Historia Real", desc: "Elige una región y sumérgete en un periodo histórico real y documentado." },
  { id: "reality", name: "Realidad Estricta", desc: "Mundo contemporáneo moderno, sin magia ni tecnología avanzada. Supervivencia diaria." },
  { id: "custom", name: "Mundo Propio", desc: "Define y describe tu propio universo narrativo libremente." }
];

const REGIONS = [
  { id: "esp_reconquista", name: "España — Reconquista (s.XI)", desc: "Conflicto fronterizo, caballeros, califatos y reinos cristianos en liza." },
  { id: "esp_oro", name: "España — Siglo de Oro (s.XVI)", desc: "Imperio, duelos de espada, pícaros en Sevilla, poetas y riquezas del nuevo mundo." },
  { id: "esp_ilustracion", name: "España — Ilustración (s.XVIII)", desc: "Reformismo, academias, bandolerismo y tensiones prerrevolucionarias." },
  { id: "fra_revolucion", name: "Francia — Revolución (1789)", desc: "Terror, guillotinas, asambleas populares e ideales de libertad." },
  { id: "roma_republica", name: "Roma — República (s.I a.C.)", desc: "Senado, legiones, conspiraciones patricias y rebeliones de esclavos." },
  { id: "euro_medieval", name: "Europa Medieval (s.XIII)", desc: "Feudalismo, cruzadas, peste incipiente y escolástica." },
  { id: "ing_industrial", name: "Inglaterra Industrial (s.XIX)", desc: "Carbón, fábricas de vapor, trenes y grandes brechas sociales." },
  { id: "jap_edo", name: "Japón — Edo (s.XVII)", desc: "Samoúrais, shogunato, aislamiento, geishas y ronins." },
  { id: "manual", name: "Definir manualmente", desc: "Escribe tu propia época y ubicación histórica." }
];

const ARCHETYPES = [
  {
    id: "guerrero",
    name: "Guerrero ⚔️",
    desc: "Especialista en combate cuerpo a cuerpo y resistencia física.",
    attrs: { fuerza: 15, agilidad: 11, inteligencia: 8, carisma: 10, resistencia: 14 },
    gold: 20,
    skills: [
      { name: "Combate", level: 2 },
      { name: "Intimidación", level: 1 }
    ],
    items: [
      { name: "Espada de Hierro", qty: 1, cat: "Arma", value: 15 },
      { name: "Escudo de Madera", qty: 1, cat: "Defensa", value: 8 },
      { name: "Raciones Secas", qty: 4, cat: "Comida", value: 1 }
    ],
    traits: ["Firmeza Física"]
  },
  {
    id: "comerciante",
    name: "Comerciante 💰",
    desc: "Astuto negociador enfocado en acumular riquezas e información.",
    attrs: { fuerza: 9, agilidad: 10, inteligencia: 14, carisma: 15, resistencia: 10 },
    gold: 300,
    skills: [
      { name: "Negociación", level: 2 },
      { name: "Tasación", level: 1 },
      { name: "Contabilidad", level: 1 }
    ],
    items: [
      { name: "Ropa Elegante", qty: 1, cat: "Vestimenta", value: 25 },
      { name: "Libro de Cuentas", qty: 1, cat: "Utilidad", value: 5 },
      { name: "Mercancías Finas", qty: 2, cat: "Comercial", value: 40 }
    ],
    traits: ["Ojo Clínico"]
  },
  {
    id: "noble",
    name: "Noble 👑",
    desc: "Poseedor de riqueza heredada, linaje e influencia social.",
    attrs: { fuerza: 10, agilidad: 10, inteligencia: 12, carisma: 14, resistencia: 10 },
    gold: 800,
    skills: [
      { name: "Política", level: 2 },
      { name: "Etiqueta", level: 1 },
      { name: "Equitación", level: 1 }
    ],
    items: [
      { name: "Anillo con Sello Familiar", qty: 1, cat: "Reliquia", value: 150 },
      { name: "Capa de Seda", qty: 1, cat: "Vestimenta", value: 80 },
      { name: "Caballo de Monta", qty: 1, cat: "Transporte", value: 250 }
    ],
    traits: ["Influencia Social"]
  },
  {
    id: "picaro",
    name: "Pícaro 🗡️",
    desc: "Experto en sigilo, robos, cerrajería y trampas.",
    attrs: { fuerza: 10, agilidad: 15, inteligencia: 11, carisma: 12, resistencia: 10 },
    gold: 40,
    skills: [
      { name: "Sigilo", level: 2 },
      { name: "Robo", level: 1 },
      { name: "Cerrajería", level: 1 }
    ],
    items: [
      { name: "Daga Envenenada", qty: 1, cat: "Arma", value: 20 },
      { name: "Ganzúas", qty: 1, cat: "Herramienta", value: 8 },
      { name: "Capa con Capucha", qty: 1, cat: "Vestimenta", value: 10 }
    ],
    traits: ["Manos Rápidas"]
  },
  {
    id: "erudito",
    name: "Erudito 📚",
    desc: "Estudioso de la historia, las ciencias o la magia elemental.",
    attrs: { fuerza: 8, agilidad: 10, inteligencia: 16, carisma: 10, resistencia: 10 },
    gold: 100,
    skills: [
      { name: "Historia", level: 2 },
      { name: "Medicina", level: 1 },
      { name: "Magia básica", level: 1 }
    ],
    items: [
      { name: "Libro Antiguo", qty: 1, cat: "Libro", value: 40 },
      { name: "Hierbas Curativas", qty: 5, cat: "Medicina", value: 5 },
      { name: "Pluma y Tintero", qty: 1, cat: "Utilidad", value: 3 }
    ],
    traits: ["Mente Analítica"]
  },
  {
    id: "libre",
    name: "Libre ✨",
    desc: "Total libertad para distribuir tus puntos y elegir tu propio camino.",
    attrs: { fuerza: 10, agilidad: 10, inteligencia: 10, carisma: 10, resistencia: 10 },
    gold: 100,
    skills: [],
    items: [
      { name: "Raciones Comunes", qty: 3, cat: "Comida", value: 1 }
    ],
    traits: ["Versátil"]
  }
];

const DIFFICULTIES = [
  { id: "easy", name: "Fácil 🟢", desc: "Consecuencias suaves, fallos abren puertas. DC 8. Hambre +5, Fatiga +8 por turno." },
  { id: "medium", name: "Medio 🟡", desc: "Equilibrado, errores con coste real. DC 10. Hambre +10, Fatiga +12 por turno." },
  { id: "hard", name: "Difícil 🔴", desc: "Duro, decisiones devastadoras. DC 13. Hambre +18, Fatiga +20 por turno." },
  { id: "legend", name: "Leyenda 💀", desc: "Sin piedad, muerte permanente posible. DC 15. Hambre +25, Fatiga +28 por turno." }
];

const TIMESCALES = [
  { id: "moment", name: "Tiempo Real (Minutos/Horas)", desc: "El transcurso del tiempo se calcula de forma dinámica y realista según la brevedad de tus acciones." },
  { id: "day", name: "Día", desc: "Cada turno representa un día de viaje o acción." },
  { id: "week", name: "Semana", desc: "Paso de tiempo acelerado de 7 días por turno." },
  { id: "month", name: "Mes", desc: "Evolución mensual, ideal para gestión o largos trayectos." },
  { id: "year", name: "Año", desc: "Evolución anual, transcurso de generaciones." }
];

const DEFAULT_SUPABASE_URL = "https://yfnabpnangkzyvwxwdhh.supabase.co";
const DEFAULT_SUPABASE_KEY = "";

const renderMarkdown = (text) => {
  if (!text) return { __html: "" };
  try {
    if (window.marked) {
      return { __html: window.marked.parse(text, { breaks: true }) };
    }
    return { __html: text.replace(/\n/g, "<br/>") };
  } catch (e) {
    return { __html: text.replace(/\n/g, "<br/>") };
  }
};

export default function App() {
  // --- STATE VARIABLES ---
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("openai_api_key") || "");
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem("supabase_url") || DEFAULT_SUPABASE_URL);
  const [supabaseKey, setSupabaseKey] = useState(() => localStorage.getItem("supabase_key") || DEFAULT_SUPABASE_KEY);
  const [isDiceRollEnabled, setIsDiceRollEnabled] = useState(() => {
    const val = localStorage.getItem("is_dice_roll_enabled");
    return val === null ? true : val === "true";
  });

  const [campaigns, setCampaigns] = useState([]);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("campaigns");
  
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Wizard Creation State
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardWorld, setWizardWorld] = useState("medieval");
  const [wizardWorldDesc, setWizardWorldDesc] = useState("");
  const [wizardRegion, setWizardRegion] = useState("esp_reconquista");
  const [wizardRegionManual, setWizardRegionManual] = useState("");
  const [wizardArchetype, setWizardArchetype] = useState("libre");
  const [wizardName, setWizardName] = useState("");
  const [wizardAge, setWizardAge] = useState(25);
  const [wizardOrigin, setWizardOrigin] = useState("");
  const [wizardIdentity, setWizardIdentity] = useState("");
  const [wizardBackstory, setWizardBackstory] = useState("");
  const [wizardAttrs, setWizardAttrs] = useState({ fuerza: 10, agilidad: 10, inteligencia: 10, carisma: 10, resistencia: 10 });
  const [wizardAttrPool, setWizardAttrPool] = useState(5);
  const [wizardSelectedSkills, setWizardSelectedSkills] = useState([]);
  const [wizardDifficulty, setWizardDifficulty] = useState("medium");
  const [wizardTimeScale, setWizardTimeScale] = useState("moment");

  // Game UI State
  const [activeTab, setActiveTab] = useState("personaje");
  const [customAction, setCustomAction] = useState("");
  const [isRolling, setIsRolling] = useState(false);
  const [isLlmLoading, setIsLlmLoading] = useState(false);
  const [lastDiceRoll, setLastDiceRoll] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);

  // Master Query state
  const [isQueryMode, setIsQueryMode] = useState(false);

  // Admin panel state lists
  const [adminPropName, setAdminPropName] = useState("");
  const [adminPropVal, setAdminPropVal] = useState(0);
  const [adminBizName, setAdminBizName] = useState("");
  const [adminBizInc, setAdminBizInc] = useState(0);

  const [heritageSource, setHeritageSource] = useState(null);

  const narrativeEndRef = useRef(null);
  const [supabaseClient, setSupabaseClient] = useState(null);

  // --- THEME SYNC EFFECT ---
  useEffect(() => {
    document.body.classList.toggle("light-theme", theme === "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // --- INITIALIZE SUPABASE CLIENT ---
  useEffect(() => {
    if (supabaseUrl && supabaseKey) {
      try {
        const client = createClient(supabaseUrl, supabaseKey);
        setSupabaseClient(client);
      } catch (err) {
        console.error("Error inicializando Supabase Client:", err);
      }
    } else {
      setSupabaseClient(null);
    }
  }, [supabaseUrl, supabaseKey]);

  // --- LOAD CAMPAIGNS ON INITIALIZATION ---
  useEffect(() => {
    loadCampaigns();
  }, [supabaseClient]);

  const loadCampaigns = async () => {
    let localCampaigns = [];
    try {
      const stored = localStorage.getItem("rpg_campaigns_local");
      if (stored) {
        localCampaigns = JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from("rpg_campaigns")
          .select("*")
          .order("updated_at", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const fetchedCampaigns = data.map(item => ({
            id: item.id,
            ...item.state
          }));

          const merged = [...fetchedCampaigns];
          localCampaigns.forEach(local => {
            if (!merged.some(m => m.id === local.id)) {
              merged.push(local);
            }
          });
          setCampaigns(merged);
          return;
        }
      } catch (err) {
        console.warn("Supabase fetch fallido, usando localStorage fallback:", err.message);
      }
    }
    setCampaigns(localCampaigns);
  };

  // --- SAVE CAMPAIGN HELPER ---
  const saveCampaignState = async (updatedCampaign) => {
    const updatedList = campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c);
    if (!updatedList.some(c => c.id === updatedCampaign.id)) {
      updatedList.unshift(updatedCampaign);
    }
    setCampaigns(updatedList);
    localStorage.setItem("rpg_campaigns_local", JSON.stringify(updatedList));

    if (supabaseClient) {
      try {
        const payload = {
          id: updatedCampaign.id,
          name: updatedCampaign.character.name,
          world: updatedCampaign.campaign.world,
          difficulty: updatedCampaign.difficulty,
          state: updatedCampaign,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabaseClient
          .from("rpg_campaigns")
          .upsert(payload, { onConflict: "id" });

        if (error) throw error;
        console.log("Sincronizado a Supabase correctamente.");
      } catch (err) {
        console.error("Error sincronizando a Supabase:", err.message);
      }
    }
  };

  // --- DELETE CAMPAIGN ---
  const deleteCampaign = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("¿Seguro que quieres eliminar esta campaña de forma permanente?")) return;

    const filtered = campaigns.filter(c => c.id !== id);
    setCampaigns(filtered);
    localStorage.setItem("rpg_campaigns_local", JSON.stringify(filtered));

    if (supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from("rpg_campaigns")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        console.error("Error eliminando en Supabase:", err.message);
      }
    }
  };

  // --- WIZARD AUTO SETUP ON ARCHETYPE CHANGE ---
  useEffect(() => {
    const arch = ARCHETYPES.find(a => a.id === wizardArchetype);
    if (arch) {
      setWizardAttrs({ ...arch.attrs });
      setWizardAttrPool(5);
      setWizardSelectedSkills(arch.skills.map(s => s.name));
    }
  }, [wizardArchetype]);

  const handleAttrChange = (attr, delta) => {
    if (delta > 0 && wizardAttrPool > 0) {
      setWizardAttrs(prev => ({ ...prev, [attr]: prev[attr] + 1 }));
      setWizardAttrPool(prev => prev - 1);
    } else if (delta < 0) {
      const archDefault = ARCHETYPES.find(a => a.id === wizardArchetype)?.attrs[attr] || 10;
      if (wizardAttrs[attr] > archDefault) {
        setWizardAttrs(prev => ({ ...prev, [attr]: prev[attr] - 1 }));
        setWizardAttrPool(prev => prev + 1);
      }
    }
  };

  // --- START CAMPAIGN ---
  const handleStartCampaign = async () => {
    if (!wizardName.trim()) {
      alert("Por favor introduce el nombre del personaje.");
      return;
    }

    const arch = ARCHETYPES.find(a => a.id === wizardArchetype);
    const initialSkills = wizardSelectedSkills.map(skillName => {
      const baseSkill = arch?.skills?.find(s => s.name === skillName);
      return { name: skillName, level: baseSkill ? baseSkill.level : 1 };
    });

    const initialInventory = [...(arch?.items || [])];
    const initialGold = arch?.gold || 100;

    let worldNameStr = WORLDS.find(w => w.id === wizardWorld)?.name || "";
    let regionStr = "";
    if (wizardWorld === "history") {
      regionStr = REGIONS.find(r => r.id === wizardRegion)?.name || "";
      if (wizardRegion === "manual") {
        regionStr = wizardRegionManual || "Región Personalizada";
      }
    } else if (wizardWorld === "custom") {
      worldNameStr = wizardWorldDesc || "Mundo Propio";
    }

    let dateStr = "Día 1, 08:00";
    if (wizardTimeScale === "moment") dateStr = "Día 1, 08:00";
    else if (wizardTimeScale === "day") dateStr = "Día 1";
    else if (wizardTimeScale === "week") dateStr = "Semana 1";
    else if (wizardTimeScale === "month") dateStr = "Mes 1";
    else if (wizardTimeScale === "year") dateStr = "Año 1";

    let inheritedGold = 0;
    let inheritedItem = null;
    let inheritedProperties = [];
    let initialMemorySummary = `La historia de ${wizardName} da comienzo en la región de ${regionStr || worldNameStr}.`;

    if (heritageSource) {
      inheritedGold = Math.floor(heritageSource.wealth.money * 0.5);
      inheritedProperties = heritageSource.wealth.properties ? [...heritageSource.wealth.properties] : [];
      
      if (heritageSource.inventory && heritageSource.inventory.length > 0) {
        inheritedItem = [...heritageSource.inventory].sort((a, b) => (b.value || 0) - (a.value || 0))[0];
      }

      initialMemorySummary = `Tras la trágica caída de su predecesor, ${heritageSource.character.name}, su heredero legítimo ${wizardName} toma el relevo de su legado. Acompañado de parte de sus pertenencias y una pesada herencia, comienza una nueva etapa en este mundo persistente.`;
    }

    const finalGold = initialGold + inheritedGold;
    if (inheritedItem) {
      const idx = initialInventory.findIndex(i => i.name === inheritedItem.name);
      if (idx !== -1) {
        initialInventory[idx].qty += inheritedItem.qty;
      } else {
        initialInventory.push({ ...inheritedItem });
      }
    }

    const inheritedNPCs = heritageSource ? [...heritageSource.npcs] : [];
    const inheritedZones = heritageSource ? [...heritageSource.world.zones] : [];

    const newCampaign = {
      id: Math.random().toString(36).substring(2, 15),
      turn: 0,
      campaign: {
        name: `${wizardName} - ${worldNameStr}`,
        world: worldNameStr,
        region: regionStr,
        worldDesc: wizardWorldDesc
      },
      difficulty: wizardDifficulty,
      timeScale: wizardTimeScale,
      temporal: { date: dateStr, scale: wizardTimeScale },
      character: {
        name: wizardName,
        age: wizardAge,
        origin: wizardOrigin || "Desconocido",
        identity: wizardIdentity || "Aventurero",
        backstory: wizardBackstory || "Trasfondo libre.",
        archetype: arch?.name || "Libre",
        status: "Vivo",
        attrs: { ...wizardAttrs },
        skills: initialSkills,
        traits: arch?.traits || []
      },
      physical: { health: 100, fatigue: 0, hunger: 0, wounds: [], rest: 100, mental: 100 },
      wealth: { 
        money: finalGold, 
        currency: "Monedas", 
        properties: inheritedProperties, 
        income: 0, 
        expenses: 0, 
        debts: 0,
        businesses: []
      },
      inventory: initialInventory,
      npcs: inheritedNPCs,
      world: { zones: inheritedZones.length ? inheritedZones : ["Zona Inicial"], events: [], climate: "Despejado", season: "Otoño", context: "Inicio de campaña." },
      memory: {
        summary: initialMemorySummary,
        keyEvents: heritageSource ? [...heritageSource.memory.keyEvents] : [],
        lastUpdated: new Date().toISOString()
      },
      log: [],
      narrative: `Bienvenido a ${worldNameStr}. Tu viaje está listo para comenzar.`,
      suggestedActions: ["Explorar los alrededores", "Buscar un lugar de descanso", "Hablar con los lugareños", "Revisar tus pertenencias"],
      locationImage: null,
      currentLocation: "Punto de Inicio"
    };

    // Save starting state to local first so we have a fallback
    await saveCampaignState(newCampaign);
    setCurrentCampaign(newCampaign);
    setHeritageSource(null);
    setCurrentScreen("game");

    setWizardName("");
    setWizardAge(25);
    setWizardOrigin("");
    setWizardIdentity("");
    setWizardBackstory("");

    if (apiKey) {
      setIsLlmLoading(true);
      (async () => {
        try {
          const initialSystemPrompt = `Eres el Master de un juego de rol narrativo y simulación. Tu objetivo es escribir el inicio inmersivo de la campaña para el jugador.
Debes colocar al personaje en una ciudad de inicio coherente con el universo, describir detalladamente el contexto sociohistórico inicial de esa ubicación, el clima, la estación del año y las primeras propuestas de acción.

ESTILO NARRATIVO REQUERIDO (NARRACIÓN LITERARIA EN PRIMERA PERSONA - ALTA CALIDAD):
- Escribe con un estilo literario del más alto nivel: sumamente evocativo, descriptivo y de prosa cuidada, imitando a la mejor literatura de ficción.
- LA NARRACIÓN DEBE SER SIEMPRE EN PRIMERA PERSONA DEL SINGULAR: Todo lo que le ocurre al protagonista, sus acciones, sensaciones y pensamientos internos deben narrarse en primera persona ('Yo', 'Me', 'Mi', 'Mis'). Por ejemplo, di 'Siento el frío' en vez de 'Sientes el frío'.
- CALIDAD DE PROSA Y VOCABULARIO: Evita repeticiones innecesarias y clichés. Varía la longitud de las oraciones para darle ritmo. Describe minuciosamente el entorno (sonidos de fondo, olores, tacto de los objetos, iluminación, temperatura del aire) para situar la escena con fuerza tridimensional.
- DIÁLOGOS REALISTAS: Los diálogos deben tener personalidad propia, usando guiones largos en cursiva.

Debes responder EXCLUSIVAMENTE en formato JSON estructurado según el siguiente esquema (sin texto fuera del JSON):
{
  "narrative": "Escribe tu respuesta narrada en Markdown rico adoptando estrictamente la estética de las partidas de rol de ChatGPT. Debes seguir exactamente la siguiente estructura de formato en tu texto:\\n\\n# [NOMBRE DE LA CIUDAD O UBICACIÓN DE INICIO EN MAYÚSCULAS]\\n## [Contexto Sociohistórico Corto de la Partida]\\n### [Estación del año y clima inicial]\\n### **Día 1 — 08:00 (Mañana)**\\n\\n[Prosa narrativa inmersiva y de bienvenida de 3 a 5 párrafos cortos de 1 a 3 frases cada uno, separados por doble salto de línea, introduciendo al héroe, dónde se encuentra físicamente, la atmósfera de las calles, la situación social/política de la ciudad y el contexto inicial de su trasfondo. Diálogos en cursiva y con guiones largos].\\n\\n---\\n\\n## Estado\\n* 🪙 Dinero: **[Dinero inicial del personaje en negrita]**\\n* 🥖 Comida: **Suficiente para empezar**\\n* 🏡 Refugio/Vivienda: **Estable**\\n\\n### Nota del Director\\n[Breve nota de bienvenida del Master]",
  "suggestedActions": ["Título Opción A", "Título Opción B", "Título Opción C", "Título Opción D"],
  "currentLocation": "Nombre de la Ciudad o Ubicación de Inicio",
  "locationImagePrompt": "Descriptive English prompt of the starting location and city to generate an image with DALL-E, style Anime One Piece: vibrant, detailed.",
  "changes": {
    "worldClimate": "Clima de inicio (ej: Soleado, Nublado, Nevando)",
    "worldSeason": "Estación de inicio (ej: Otoño, Invierno)"
  }
}`;

          const initialUserPrompt = `
DATOS DE LA CAMPAÑA:
- Universo/Mundo: ${worldNameStr}
- Trasfondo del Mundo: ${wizardWorldDesc || "Estándar"}
- Región: ${regionStr || "Zona central"}
- Personaje: ${wizardName}
- Edad: ${wizardAge} años
- Trasfondo del Personaje: ${wizardBackstory || "Aventurero comenzando su viaje."}
- Arquetipo: ${arch?.name || "Libre"}
- Habilidades Iniciales: ${initialSkills.map(s => `${s.name} (nv ${s.level})`).join(", ")}
- Oro Inicial: ${finalGold} monedas.

Genera el JSON de respuesta con la introducción de inicio de la campaña, la ciudad inicial y el contexto sociohistórico.`;

          const rawContent = await callGPTNarrator(initialSystemPrompt, initialUserPrompt);
          let cleanContent = rawContent.trim();
          if (cleanContent.startsWith("```json")) {
            cleanContent = cleanContent.substring(7);
          } else if (cleanContent.startsWith("```")) {
            cleanContent = cleanContent.substring(3);
          }
          if (cleanContent.endsWith("```")) {
            cleanContent = cleanContent.substring(0, cleanContent.length - 3);
          }

          const parsed = JSON.parse(cleanContent.trim());
          
          const updatedCampaign = {
            ...newCampaign,
            narrative: parsed.narrative,
            suggestedActions: parsed.suggestedActions || newCampaign.suggestedActions,
            currentLocation: parsed.currentLocation || newCampaign.currentLocation
          };

          if (parsed.changes) {
            if (parsed.changes.worldClimate) updatedCampaign.world.climate = parsed.changes.worldClimate;
            if (parsed.changes.worldSeason) updatedCampaign.world.season = parsed.changes.worldSeason;
          }

          await saveCampaignState(updatedCampaign);
          setCurrentCampaign(updatedCampaign);
          
          const imagePrompt = parsed.locationImagePrompt || `A wide view of the starting area: ${updatedCampaign.currentLocation} in the region ${updatedCampaign.campaign.region || updatedCampaign.campaign.world}. Estilo Anime One Piece: vibrant, colorful, clean anime outline, detailed shading.`;
          triggerImageGeneration(updatedCampaign, imagePrompt);
        } catch (err) {
          console.error("Error al generar la introducción inmersiva:", err);
          // Fallback
          triggerImageGeneration(newCampaign, `A wide view of the starting area: ${newCampaign.currentLocation} in the region ${newCampaign.campaign.region || newCampaign.campaign.world}. Estilo Anime One Piece: vibrant, colorful, clean outline, detailed shading.`);
        } finally {
          setIsLlmLoading(false);
        }
      })();
    } else {
      triggerImageGeneration(newCampaign, `A wide view of the starting area: ${newCampaign.currentLocation} in the region ${newCampaign.campaign.region || newCampaign.campaign.world}. Estilo Anime One Piece: vibrant, colorful, clean outline, detailed shading.`);
    }
  };

  // --- DICE ROLL SYSTEM ENGINE ---
  const calculateDiceRoll = (actionText, campaign) => {
    let dc = 10;
    if (campaign.difficulty === "easy") dc = 8;
    else if (campaign.difficulty === "medium") dc = 10;
    else if (campaign.difficulty === "hard") dc = 13;
    else if (campaign.difficulty === "legend") dc = 15;

    const base = Math.floor(Math.random() * 20) + 1;
    const modifiers = [];
    
    let matchedAttr = "fuerza";
    const textLower = actionText.toLowerCase();
    if (textLower.match(/(esquivar|correr|sigilo|robar|cerradura|agil|veloz|trepar)/)) {
      matchedAttr = "agilidad";
    } else if (textLower.match(/(estudiar|investigar|leer|magia|hechizo|saber|analizar|ciencia)/)) {
      matchedAttr = "inteligencia";
    } else if (textLower.match(/(hablar|convencer|engañar|negociar|comerciar|carisma|seducir|liderar)/)) {
      matchedAttr = "carisma";
    } else if (textLower.match(/(soportar|resistir|correr largo|veneno|frio|calor|defensa)/)) {
      matchedAttr = "resistencia";
    }
    
    const attrValue = campaign.character.attrs[matchedAttr] || 10;
    const attrMod = Math.floor((attrValue - 10) / 2);
    modifiers.push({ name: `Atributo (${matchedAttr})`, val: attrMod });

    let skillMod = 0;
    let matchedSkill = null;
    campaign.character.skills.forEach(skill => {
      const nameNorm = skill.name.toLowerCase();
      if (textLower.includes(nameNorm)) {
        matchedSkill = skill.name;
        skillMod = Math.min(skill.level, 4);
      }
    });

    if (matchedSkill) {
      modifiers.push({ name: `Habilidad (${matchedSkill})`, val: skillMod });
    }

    if (campaign.character.age > 55) {
      const extraYears = campaign.character.age - 55;
      const penalty = -Math.floor(extraYears / 8);
      if (penalty !== 0) {
        modifiers.push({ name: "Edad (>55 años)", val: penalty });
      }
    }

    const health = campaign.physical.health;
    let healthPenalty = 0;
    if (health < 25) healthPenalty = -4;
    else if (health < 50) healthPenalty = -2;
    else if (health < 75) healthPenalty = -1;
    if (healthPenalty !== 0) {
      modifiers.push({ name: "Salud baja", val: healthPenalty });
    }

    const fatigue = campaign.physical.fatigue;
    let fatiguePenalty = 0;
    if (fatigue > 85) fatiguePenalty = -4;
    else if (fatigue > 65) fatiguePenalty = -2;
    else if (fatigue > 45) fatiguePenalty = -1;
    if (fatiguePenalty !== 0) {
      modifiers.push({ name: "Fatiga alta", val: fatiguePenalty });
    }

    const hunger = campaign.physical.hunger;
    let hungerPenalty = 0;
    if (hunger > 80) hungerPenalty = -3;
    else if (hunger > 60) hungerPenalty = -1;
    if (hungerPenalty !== 0) {
      modifiers.push({ name: "Hambre", val: hungerPenalty });
    }

    let diffMod = 0;
    if (campaign.difficulty === "easy") diffMod = 3;
    else if (campaign.difficulty === "hard") diffMod = -3;
    else if (campaign.difficulty === "legend") diffMod = -5;
    if (diffMod !== 0) {
      modifiers.push({ name: `Dificultad (${campaign.difficulty})`, val: diffMod });
    }

    const totalModifiers = modifiers.reduce((acc, curr) => acc + curr.val, 0);
    const total = base + totalModifiers;

    let status = "Fallo";
    if (base === 20) {
      status = "¡CRÍTICO!";
    } else if (base === 1) {
      status = "¡PIFIA!";
    } else {
      status = total >= dc ? "Éxito" : "Fallo";
    }

    return {
      base,
      modifiers,
      total,
      dc,
      status,
      matchedAttr,
      matchedSkill
    };
  };

  // --- ADVANCE DATE AND TURN SYSTEM ---
  const advanceTime = (temporal) => {
    const { date, scale } = temporal;
    if (scale === "moment") {
      // Check if format is "Día X, HH:MM" or similar
      const match = date.match(/Día (\d+),\s*(\d{1,2}):(\d{2})/);
      if (match) {
        let day = parseInt(match[1], 10);
        let hour = parseInt(match[2], 10);
        let min = parseInt(match[3], 10);

        // Advance by 1 hour by default (60 minutes) if not overridden
        hour += 1;
        if (hour >= 24) {
          day += 1;
          hour = hour % 24;
        }

        const hourStr = String(hour).padStart(2, "0");
        const minStr = String(min).padStart(2, "0");
        return `Día ${day}, ${hourStr}:${minStr}`;
      }

      // Legacy fallback
      const moments = ["Madrugada", "Mañana", "Mediodía", "Tarde", "Anochecer", "Noche"];
      const currentIdx = moments.indexOf(date);
      if (currentIdx === -1) return "Día 1, 08:00";
      const nextIdx = (currentIdx + 1) % moments.length;
      return moments[nextIdx];
    }

    const match = date.match(/(\d+)/);
    if (!match) return date;
    const num = parseInt(match[0], 10);
    const nextNum = num + 1;

    if (scale === "day") return `Día ${nextNum}`;
    if (scale === "week") return `Semana ${nextNum}`;
    if (scale === "month") return `Mes ${nextNum}`;
    if (scale === "year") return `Año ${nextNum}`;
    return date;
  };

  // --- OpenAI CHAT COMPLETIONS API CALL ---
  const callGPTNarrator = async (systemPrompt, userPrompt) => {
    if (!apiKey) {
      throw new Error("No OpenAI API key found. Please insert it in Settings.");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.85,
        frequency_penalty: 0.3,
        presence_penalty: 0.2
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Error calling GPT-4o API.");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  // --- OpenAI DALL-E IMAGE GENERATION ---
  const triggerImageGeneration = async (campaign, promptText) => {
    if (!apiKey) return;
    setIsImageGenerating(true);

    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: promptText,
          n: 1,
          size: "1024x1024"
        })
      });

      if (!response.ok) {
        throw new Error("Image Generation failed.");
      }

      const data = await response.json();
      const imageUrl = data.data[0].url;

      const updatedCampaign = {
        ...campaign,
        locationImage: imageUrl
      };
      
      if (currentCampaign && currentCampaign.id === campaign.id) {
        setCurrentCampaign(updatedCampaign);
      }
      saveCampaignState(updatedCampaign);
    } catch (err) {
      console.error("DALL-E image generation error:", err);
    } finally {
      setIsImageGenerating(false);
    }
  };

  // --- DALL-E NPC PORTRAIT GENERATOR ---
  const generateNpcPortrait = async (npcName, customPrompt) => {
    if (!apiKey) {
      alert("Introduce tu API Key en Configuración.");
      return;
    }
    
    setIsImageGenerating(true);
    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: `${customPrompt}. Portrait character avatar. Estilo Anime One Piece: vibrant, colorful, simple background, detailed character profile.`,
          n: 1,
          size: "1024x1024"
        })
      });

      if (!response.ok) throw new Error("NPC portrait failed.");
      const data = await response.json();
      const portraitUrl = data.data[0].url;

      const updatedNpcs = currentCampaign.npcs.map(npc => {
        if (npc.name === npcName) {
          return { ...npc, image: portraitUrl };
        }
        return npc;
      });

      const updatedCampaign = {
        ...currentCampaign,
        npcs: updatedNpcs
      };

      setCurrentCampaign(updatedCampaign);
      saveCampaignState(updatedCampaign);
    } catch (err) {
      alert("Error al generar retrato: " + err.message);
    } finally {
      setIsImageGenerating(false);
    }
  };

  // --- TRIGGER MEMORY COMPRESSION (↺) ---
  const handleMemoryCompression = async () => {
    if (!apiKey) {
      alert("Por favor introduce la OpenAI API Key.");
      return;
    }
    
    setIsLlmLoading(true);
    try {
      const logsSnippet = currentCampaign.log.slice(-15).map(l => `Turno: ${l.textRoll || ''}\n${l.narrative}`).join("\n\n");
      const systemMsg = `Eres un sintetizador de historia para juegos de rol. Debes crear un resumen narrativo acumulativo y denso (máx. 200 palabras) sobre la partida del jugador. Sintentiza: decisiones importantes, secretos descubiertos, pérdidas fatales, alianzas actuales y promesas pendientes. Devuelve SOLO un párrafo denso en español.`;
      
      const userMsg = `Historial reciente:\n${logsSnippet}\n\nResumen actual:\n${currentCampaign.memory.summary}`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemMsg },
            { role: "user", content: userMsg }
          ],
          temperature: 0.5
        })
      });

      if (!response.ok) throw new Error("API call error.");
      const data = await response.json();
      const newSummary = data.choices[0].message.content.trim();

      const updated = {
        ...currentCampaign,
        memory: {
          ...currentCampaign.memory,
          summary: newSummary,
          lastUpdated: new Date().toISOString()
        }
      };
      setCurrentCampaign(updated);
      saveCampaignState(updated);
      alert("¡Memoria sintetizada con éxito!");
    } catch (err) {
      alert("Error comprimiendo memoria: " + err.message);
    } finally {
      setIsLlmLoading(false);
    }
  };

  // --- EXECUTE TURN LOGIC ---
  const handleAction = async (actionText) => {
    if (!actionText.trim()) return;
    if (!apiKey) {
      alert("Introduce tu API Key en configuración (⚙) para poder jugar.");
      setCurrentScreen("settings");
      return;
    }

    if (isQueryMode) {
      handleMasterQuery(actionText);
      return;
    }

    setIsRolling(true);
    setIsLlmLoading(true);

    let nextCampaign = { ...currentCampaign };

    // 1. Increment Turn Counter
    nextCampaign.turn = (nextCampaign.turn || 0) + 1;

    // 2. Apply Recurrent Financial Income/Expenses (per turn)
    if (nextCampaign.wealth) {
      nextCampaign.wealth.money = Math.max(0, nextCampaign.wealth.money + (nextCampaign.wealth.income || 0) - (nextCampaign.wealth.expenses || 0));
    }

    if (nextCampaign.physical.health <= 0) {
      setIsRolling(false);
      setIsLlmLoading(false);
      nextCampaign.character.status = "Muerto";
      nextCampaign.narrative = `Has sucumbido a tus heridas previas. Tu cuerpo no pudo resistir más.`;
      saveCampaignState(nextCampaign);
      setCurrentCampaign(nextCampaign);
      setCurrentScreen("dead");
      return;
    }

    // 3. Compute dice roll
    let rollInfo = null;
    let rollString = "Sin tiradas de dados activas. El resultado se determina de forma puramente narrativa.";
    if (isDiceRollEnabled) {
      rollInfo = calculateDiceRoll(actionText, nextCampaign);
      setLastDiceRoll(rollInfo);
      rollString = `🎲 ${rollInfo.total} (d20:${rollInfo.base}${rollInfo.modifiers.map(m => ` ${m.val >= 0 ? `+${m.val}` : m.val}(${m.name.split(" ")[0]})`).join("")}) vs DC${rollInfo.dc} ➔ ${rollInfo.status}`;
    } else {
      setLastDiceRoll(null);
    }

    // 4. Progress Date
    const nextDate = advanceTime(nextCampaign.temporal);
    nextCampaign.temporal.date = nextDate;

    // 5. Build Prompt Context Blocks
    const stateContext = JSON.stringify({
      turn: nextCampaign.turn,
      character: {
        name: nextCampaign.character.name,
        age: nextCampaign.character.age,
        identity: nextCampaign.character.identity,
        backstory: nextCampaign.character.backstory,
        attrs: nextCampaign.character.attrs,
        skills: nextCampaign.character.skills,
        traits: nextCampaign.character.traits
      },
      physical: nextCampaign.physical,
      wealth: nextCampaign.wealth,
      inventory: nextCampaign.inventory,
      npcs: nextCampaign.npcs,
      world: nextCampaign.world,
      currentLocation: nextCampaign.currentLocation
    });

    const memoryBlock = `
Resumen de campaña acumulado: "${nextCampaign.memory.summary}"
Eventos Históricos Clave en Diario (diario/timeline):
${nextCampaign.memory.keyEvents.slice(-20).map((e, i) => `- [${e.date}] ${e.desc}`).join("\n")}
`;

    const recentHistory = nextCampaign.log.slice(-10).map((turn, index) => {
      return `Turno ${turn.turnNum || index} [${turn.date}]: Acción: "${turn.action}"\nTirada: ${turn.textRoll}\nResultado: ${turn.narrative}`;
    }).join("\n\n");

    // SYSTEM PROMPT: Instructs GPT-4o to calculate PROPORTIONAL hunger and fatigue consumption based on the action
    const systemPrompt = `Eres el Master de un juego de rol narrativo y simulación.

ESTILO NARRATIVO REQUERIDO (NARRACIÓN LITERARIA EN PRIMERA PERSONA - ALTA CALIDAD):
- Debes escribir con un estilo literario del más alto nivel: sumamente evocativo, descriptivo, inmersivo y de prosa cuidada, imitando a la mejor literatura de ficción.
- LA NARRACIÓN DEBE SER SIEMPRE EN PRIMERA PERSONA DEL SINGULAR: Todo lo que le ocurre al protagonista (mi personaje), sus acciones, diálogos, sensaciones físicas e internas deben narrarse en primera persona ('Yo', 'Me', 'Mi', 'Mis'). Por ejemplo, di 'Siento el frío' en vez de 'Sientes el frío'.
- Sigue escrupulosamente la estructura de títulos, párrafos cortos de 1 a 3 frases, apartados de resultado y consecuencias, tabla o lista de Estado del Personaje, y Nota del Director detalladas en el campo "narrative" (NO incluyas la lista de opciones/decisiones en el texto narrative, ya que se mostrarán en los botones interactivos sugeridos).
- CALIDAD DE PROSA Y VOCABULARIO: Evita repeticiones innecesarias, clichés literarios y frases hechas. Varía la longitud de las oraciones para darle ritmo a la narración. Describe minuciosamente el entorno (sonidos de fondo, olores, tacto de los objetos, cambios de iluminación, temperatura del aire) para situar la escena con fuerza tridimensional.
- DIÁLOGOS REALISTAS: Los diálogos deben tener personalidad propia, reflejar el estrato social, dialecto, estado de ánimo y cansancio de los personajes. Usa guiones largos en cursiva, ej: —«Le cuento lo justo: he entrado dos días en un taller...».
- Evita por completo resúmenes rápidos, explicaciones vagas o acelerar el ritmo del relato. Narra cada detalle con calma y gravedad.

Mundo: ${nextCampaign.campaign.world} ${nextCampaign.campaign.worldDesc ? `(${nextCampaign.campaign.worldDesc})` : ""}
Región: ${nextCampaign.campaign.region || "N/A"}
Dificultad: ${nextCampaign.difficulty} ${rollInfo ? `(DC Tiradas: ${rollInfo.dc})` : ""}
Escala Temporal: ${nextCampaign.timeScale}

REGLAS DE SIMULACIÓN DE ESTADÍSTICAS FÍSICAS (PROPORCIONALES):
El hambre (hunger) y el cansancio/fatiga (fatigue) ya no suben por un ratio fijo por turno. TÚ debes determinar el impacto físico exacto de la acción del jugador en sus estadísticas físicas, devolviéndolo en el objeto "changes.physical" del JSON.
Sé coherente y proporcional al esfuerzo físico e intelectual de la acción:
- Acciones pasivas, dialogar, investigar con calma, comprar: Hambre +1 a +3, Fatiga +1 a +3 (bajo consumo).
- Acciones intensas como combatir, correr a toda velocidad, cavar, viajar largas distancias a pie: Hambre +8 a +18, Fatiga +12 a +25 (alto consumo).
- Acciones extremas como escalar montañas sin equipo, marchar todo el día sin pausa: Hambre +20 a +35, Fatiga +25 a +45.
- Comer comida o raciones: Hambre negativo (ej: -20 a -45).
- Dormir en una cama, descansar profundamente: Fatiga negativa (ej: -40 a -80), Hambre ligeramente aumentado (+3 a +6 por el transcurso de horas).
- Recibir heridas físicas severas: Quita Salud ("health": -10 a -35).

OTRAS REGLAS DE SIMULACIÓN:
1. Si el jugador realiza transacciones comerciales, debes incluir precios numéricos explícitos en la narrativa y reflejar los cambios en el JSON (inventoryAdd, inventoryConsume, wealth.money).
2. Progreso de Habilidades: Si la acción del jugador fue un éxito usando una habilidad, puedes subir su nivel añadiendo su nombre a "skillsImproved".
3. PNJs: Si el jugador interactúa con personajes, puedes añadirlos o actualizarlos en "npcUpdates".
4. Si ocurre un evento histórico o hito de la campaña, agrégalo a "keyEventToAdd" (diario de eventos).
5. Si la salud del personaje llega a 0, pon "isDead" en true y explica cómo murió en "deathMessage".
6. Patrimonio y Finanzas: Puedes añadir o quitar propiedades en "propertiesAdd" / "propertiesRemove" y negocios en "businessesAdd" / "businessesRemove" si la narrativa lo justifica.
7. Clima y Estación: Puedes cambiar dinámicamente el clima en "worldClimate" (ej: 'Tormenta de nieve', 'Soleado') y la estación del año en "worldSeason" (ej: 'Invierno', 'Primavera') según progrese la historia.
8. Transcurso del Tiempo (PROPORCIONAL Y DINÁMICO): Si la escala temporal es "moment", la hora actual tiene el formato "Día X, HH:MM" (ej: "Día 1, 08:00"). TÚ debes calcular el tiempo que tarda la acción propuesta por el jugador de forma realista y proporcional. Si la acción es extremadamente breve (ej: hacer una pregunta rápida, mirar una sala, escribir una nota, desenvainar), avanza solo de 2 a 10 minutos. Si es intermedia (ej: un combate corto, explorar a fondo un templo), avanza 30 minutos o 1 hora. Si es prolongada (ej: viajar a pie, acampar, dormir), avanza varias horas o un día. Devuelve la nueva fecha en "changes.temporal.date" (ej: "Día 1, 08:05").
9. Propuestas de Acción (suggestedActions): Deben corresponder estrictamente al contexto geográfico/narrativo actual, el momento del día actual (ej: noche requiere sigilo/refugio/antorchas), el clima/estación del año (ej: invierno requiere calentarse/buscar abrigo), y las necesidades físicas (salud baja requiere descanso/curación). Evita opciones genéricas y aburridas.
10. Debes responder EXCLUSIVAMENTE en formato JSON estructurado según el siguiente esquema (sin texto fuera del JSON):
{
  "narrative": "Escribe tu respuesta narrada en Markdown rico adoptando estrictamente la estética de las partidas de rol de ChatGPT. Debes seguir exactamente la siguiente estructura de formato en tu texto:\n\n# [NOMBRE DE LA UBICACIÓN / MUNDO EN MAYÚSCULAS]\n## [Año, Época o Momento Histórico de la partida]\n### [Estación del año y clima actual]\n### **[Momento del día o hora] — [Nombre del interlocutor/lugar secundario si aplica (ej: Atardecer — Monna Alessa)]**\n\n[Prosa narrativa inmersiva y de diálogos en párrafos cortos de 1 a 3 frases, separados por doble salto de línea. Diálogos en cursiva y con guiones largos, ej: —«Tienes mejor cara de hambre...»]\n\n**Tirada oculta**\n[Habilidad/Atributo evaluado, ej: Lectura social + credibilidad]\nResultado: [Resultado final del d20 + modificadores] — [Detalle cualitativo del éxito/fallo]\n\n## Resultado\n[Detalla en secciones numeradas qué consigue/pierde el personaje en base al éxito o fallo, ej:]\n1. [Logro 1, ej: Comida barata]\n2. [Logro 2, ej: Información útil]\n3. [Logro 3, ej: Advertencia]\n\n## Consecuencias\n* [Consecuencia física/narrativa 1, ej: ganas pista real, pierdes algo de dinero]\n* [Consecuencia física/narrativa 2, ej: fatiga/hambre mitigada o aumentada]\n\n---\n\n## Estado\n* 🪙 Dinero: **[Dinero actual en negrita, ej: 1 soldo, 8 quattrini]**\n* 🥖 Comida: **[Comida/Recursos actuales, ej: 1 cebolla]**\n* ⚡ Fatiga: **[Nivel cualitativo de fatiga, ej: muy alta]**\n* 🍖 Hambre: **[Nivel cualitativo de hambre, ej: alta, algo mitigada]**\n* ⚠️ Situación/Amenazas: [Resumen de la situación inmediata, ej: opción real de dormir bajo techo]\n\n### Nota del Director\n[Nota corta con explicaciones del lore, consejos o advertencias narrativas sobre el futuro de las decisiones]",
  "suggestedActions": ["Propuesta A (Contextual e inmediata)", "Propuesta B", "Propuesta C", "Propuesta D"],
  "currentLocation": "Lugar actual (corto)",
  "locationImagePrompt": "Prompt en inglés descriptivo del lugar actual para generar una imagen con DALL-E, estilo Anime One Piece: vibrante, colorido, detallado.",
  "changes": {
    "physical": { "health": 0, "fatigue": 0, "hunger": 0, "mental": 0 }, 
    "wealth": { "money": 0, "income": 0, "expenses": 0, "debts": 0 }, 
    "inventoryAdd": [{"name": "Objeto", "qty": 1, "cat": "Categoría", "value": 10}],
    "inventoryConsume": [{"name": "Objeto", "qty": 1}],
    "propertiesAdd": [{"name": "NombrePropiedad", "value": 100}],
    "propertiesRemove": ["NombrePropiedad"],
    "businessesAdd": [{"name": "NombreNegocio", "income": 10}],
    "businessesRemove": ["NombreNegocio"],
    "npcUpdates": [{"name": "Nombre", "role": "Rol", "relation": 5, "trust": 10, "location": "Lugar", "status": "Vivo"}],
    "worldEvents": [],
    "zonesAdd": [],
    "worldClimate": "Nuevo clima si cambia (opcional)",
    "worldSeason": "Nueva estación del año si cambia (opcional)",
    "temporal": { "date": "nueva fecha si aplica (opcional)" },
    "skillsImproved": [],
    "attrChanges": {} 
  },
  "npcPortraitPrompts": { "NombrePNJ": "Prompt en inglés para el retrato, estilo Anime One Piece, 1:1." },
  "keyEventToAdd": "Descripción muy corta del evento clave (ej: 'Logró ingresar a la hermandad'), o null si no",
  "isDead": false,
  "deathMessage": null,
  "turnSummary": "Resumen rápido del turno en una sola frase."
}`;

    const rollBlockText = isDiceRollEnabled && rollInfo ? `
TIRADA DE DADO EJECUTADA PARA ESTE TURNO:
Resultado de Tirada: ${rollString}
Modificadores aplicados: ${JSON.stringify(rollInfo.modifiers)}
Habilidad emparejada: ${rollInfo.matchedSkill || "Ninguna"}
Atributo emparejado: ${rollInfo.matchedAttr}
` : `
NO HAY TIRADAS DE DADOS PARA ESTE TURNO:
El resultado de la acción debe determinarse de forma puramente narrativa, lógica y razonable basándose en las capacidades y contexto del personaje.
OBLIGATORIO: En la sección "Tirada oculta" del Markdown narrative, en lugar de poner números de tiradas de dados, pon una breve explicación narrativa del esfuerzo/capacidad (ej: "Lectura social + credibilidad") y pon en "Resultado" un veredicto cualitativo lógico (ej: "Éxito narrativo" o "Fallo narrativo") según la historia.
`;

    const userPrompt = `
HISTORIAL DE CAMPAÑA RECIENTE:
${recentHistory}

DATOS DE MEMORIA DEL MUNDO:
${memoryBlock}

ESTADO ACTUAL DETALLADO DEL PERSONAJE:
${stateContext}

ACCIÓN PROPUESTA POR EL JUGADOR:
"${actionText}"
${rollBlockText}

Genera el JSON de respuesta con el desenlace narrativo literario y extenso.`;

    try {
      const rawContent = await callGPTNarrator(systemPrompt, userPrompt);
      
      let cleanContent = rawContent.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.substring(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.substring(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.substring(0, cleanContent.length - 3);
      }
      cleanContent = cleanContent.trim();

      const parsed = JSON.parse(cleanContent);

      nextCampaign.narrative = parsed.narrative;
      nextCampaign.suggestedActions = parsed.suggestedActions || [];
      
      const oldLocation = nextCampaign.currentLocation;
      if (parsed.currentLocation) {
        nextCampaign.currentLocation = parsed.currentLocation;
      }

      const locationChanged = oldLocation !== nextCampaign.currentLocation;

      if (parsed.changes) {
        const changes = parsed.changes;
        
        if (changes.physical) {
          nextCampaign.physical.health = Math.max(0, Math.min(100, nextCampaign.physical.health + (changes.physical.health || 0)));
          nextCampaign.physical.fatigue = Math.max(0, Math.min(100, nextCampaign.physical.fatigue + (changes.physical.fatigue || 0)));
          nextCampaign.physical.hunger = Math.max(0, Math.min(100, nextCampaign.physical.hunger + (changes.physical.hunger || 0)));
          nextCampaign.physical.mental = Math.max(0, Math.min(100, nextCampaign.physical.mental + (changes.physical.mental || 0)));

          // Apply starvation damage if hunger exceeds 80% post-action
          if (nextCampaign.physical.hunger > 80) {
            const starvationDamage = nextCampaign.difficulty === "easy" ? 5 : nextCampaign.difficulty === "hard" ? 15 : nextCampaign.difficulty === "legend" ? 22 : 10;
            nextCampaign.physical.health = Math.max(0, nextCampaign.physical.health - starvationDamage);
          }
        }

        if (changes.wealth) {
          nextCampaign.wealth.money = Math.max(0, nextCampaign.wealth.money + (changes.wealth.money || 0));
          nextCampaign.wealth.income = Math.max(0, nextCampaign.wealth.income + (changes.wealth.income || 0));
          nextCampaign.wealth.expenses = Math.max(0, nextCampaign.wealth.expenses + (changes.wealth.expenses || 0));
          nextCampaign.wealth.debts = Math.max(0, nextCampaign.wealth.debts + (changes.wealth.debts || 0));
        }

        if (!nextCampaign.wealth.properties) nextCampaign.wealth.properties = [];
        if (changes.propertiesAdd && changes.propertiesAdd.length > 0) {
          changes.propertiesAdd.forEach(prop => {
            if (!nextCampaign.wealth.properties.some(p => p.name === prop.name)) {
              nextCampaign.wealth.properties.push(prop);
            }
          });
        }
        if (changes.propertiesRemove && changes.propertiesRemove.length > 0) {
          nextCampaign.wealth.properties = nextCampaign.wealth.properties.filter(
            p => !changes.propertiesRemove.includes(p.name)
          );
        }

        if (!nextCampaign.wealth.businesses) nextCampaign.wealth.businesses = [];
        if (changes.businessesAdd && changes.businessesAdd.length > 0) {
          changes.businessesAdd.forEach(biz => {
            if (!nextCampaign.wealth.businesses.some(b => b.name === biz.name)) {
              nextCampaign.wealth.businesses.push(biz);
            }
          });
        }
        if (changes.businessesRemove && changes.businessesRemove.length > 0) {
          nextCampaign.wealth.businesses = nextCampaign.wealth.businesses.filter(
            b => !changes.businessesRemove.includes(b.name)
          );
        }

        if (changes.inventoryAdd && changes.inventoryAdd.length > 0) {
          changes.inventoryAdd.forEach(item => {
            const idx = nextCampaign.inventory.findIndex(i => i.name === item.name);
            if (idx !== -1) {
              nextCampaign.inventory[idx].qty += item.qty;
            } else {
              nextCampaign.inventory.push({ ...item });
            }
          });
        }

        if (changes.inventoryConsume && changes.inventoryConsume.length > 0) {
          changes.inventoryConsume.forEach(item => {
            const idx = nextCampaign.inventory.findIndex(i => i.name === item.name);
            if (idx !== -1) {
              nextCampaign.inventory[idx].qty = Math.max(0, nextCampaign.inventory[idx].qty - item.qty);
              if (nextCampaign.inventory[idx].qty === 0) {
                nextCampaign.inventory = nextCampaign.inventory.filter((_, i) => i !== idx);
              }
            }
          });
        }

        if (changes.npcUpdates && changes.npcUpdates.length > 0) {
          changes.npcUpdates.forEach(update => {
            const idx = nextCampaign.npcs.findIndex(n => n.name === update.name);
            if (idx !== -1) {
              nextCampaign.npcs[idx].role = update.role || nextCampaign.npcs[idx].role;
              nextCampaign.npcs[idx].relation = Math.max(-100, Math.min(100, (nextCampaign.npcs[idx].relation || 0) + (update.relation || 0)));
              nextCampaign.npcs[idx].trust = Math.max(0, Math.min(100, (nextCampaign.npcs[idx].trust || 0) + (update.trust || 0)));
              nextCampaign.npcs[idx].location = update.location || nextCampaign.npcs[idx].location;
              nextCampaign.npcs[idx].status = update.status || nextCampaign.npcs[idx].status;
            } else {
              nextCampaign.npcs.push({
                name: update.name,
                role: update.role || "Desconocido",
                relation: update.relation || 0,
                trust: update.trust || 10,
                location: update.location || nextCampaign.currentLocation,
                status: update.status || "Vivo",
                image: null
              });
            }
          });
        }

        if (changes.worldEvents && changes.worldEvents.length > 0) {
          nextCampaign.world.events = [...new Set([...nextCampaign.world.events, ...changes.worldEvents])];
        }

        if (changes.worldClimate) {
          nextCampaign.world.climate = changes.worldClimate;
        }

        if (changes.worldSeason) {
          nextCampaign.world.season = changes.worldSeason;
        }

        if (changes.zonesAdd && changes.zonesAdd.length > 0) {
          nextCampaign.world.zones = [...new Set([...nextCampaign.world.zones, ...changes.zonesAdd])];
        }

        if (changes.temporal && changes.temporal.date) {
          nextCampaign.temporal.date = changes.temporal.date;
        }

        if (changes.skillsImproved && changes.skillsImproved.length > 0) {
          changes.skillsImproved.forEach(skillName => {
            const idx = nextCampaign.character.skills.findIndex(s => s.name.toLowerCase() === skillName.toLowerCase());
            if (idx !== -1) {
              nextCampaign.character.skills[idx].level = Math.min(10, nextCampaign.character.skills[idx].level + 1);
            } else {
              nextCampaign.character.skills.push({ name: skillName, level: 1 });
            }
          });
        }

        if (changes.attrChanges) {
          Object.keys(changes.attrChanges).forEach(attrName => {
            if (nextCampaign.character.attrs[attrName] !== undefined) {
              nextCampaign.character.attrs[attrName] = Math.max(1, nextCampaign.character.attrs[attrName] + changes.attrChanges[attrName]);
            }
          });
        }
      }

      if (parsed.keyEventToAdd) {
        nextCampaign.memory.keyEvents.push({
          date: nextCampaign.temporal.date,
          desc: parsed.keyEventToAdd
        });
      }

      if (parsed.isDead || nextCampaign.physical.health <= 0) {
        nextCampaign.character.status = "Muerto";
        nextCampaign.narrative = parsed.deathMessage || parsed.narrative || "Has muerto.";
        saveCampaignState(nextCampaign);
        setCurrentCampaign(nextCampaign);
        setCurrentScreen("dead");
        return;
      }

      const newTurn = {
        turnNum: nextCampaign.turn,
        date: nextCampaign.temporal.date,
        action: actionText,
        textRoll: isDiceRollEnabled ? rollString : null,
        narrative: parsed.narrative,
        summary: parsed.turnSummary || ""
      };
      nextCampaign.log.push(newTurn);

      await saveCampaignState(nextCampaign);
      setCurrentCampaign(nextCampaign);
      setCustomAction("");

      if (locationChanged && parsed.locationImagePrompt) {
        triggerImageGeneration(nextCampaign, parsed.locationImagePrompt);
      }

      if (parsed.npcPortraitPrompts) {
        Object.keys(parsed.npcPortraitPrompts).forEach(npcName => {
          if (nextCampaign.npcs.some(n => n.name === npcName && !n.image)) {
            generateNpcPortrait(npcName, parsed.npcPortraitPrompts[npcName]);
          }
        });
      }

    } catch (err) {
      alert("Error en el turno: " + err.message);
    } finally {
      setIsRolling(false);
      setIsLlmLoading(false);
      setLastDiceRoll(null);
    }
  };

  // --- EXECUTE MASTER DIRECT QUERY FLOW ---
  const handleMasterQuery = async (queryText) => {
    setIsLlmLoading(true);
    let nextCampaign = { ...currentCampaign };

    const systemPrompt = `Eres el Master de un juego de rol narrativo y simulación. El jugador te está haciendo una consulta directa (pregunta o aclaración) sobre el entorno, el trasfondo o la situación en la que se encuentra.
Tu objetivo es responder de forma sumamente atenta, inmersiva, detallada y literaria, manteniéndote en el papel de Master narrador (similar a ChatGPT).

Mundo: ${nextCampaign.campaign.world}
Región: ${nextCampaign.campaign.region || "N/A"}
Lugar actual: ${nextCampaign.currentLocation}
Trasfondo del personaje: ${nextCampaign.character.backstory}
Resumen de historia acumulado: ${nextCampaign.memory.summary}

Responde exclusivamente en formato JSON estructurado:
{
  "narrative": "Tu respuesta descriptiva y aclaratoria inmersiva como Master (2-3 párrafos detallados)."
}`;

    const userPrompt = `
PREGUNTA DEL JUGADOR AL MASTER:
"${queryText}"

Responde a la consulta de forma descriptiva basándote en el contexto de juego actual.`;

    try {
      const rawContent = await callGPTNarrator(systemPrompt, userPrompt);
      
      let cleanContent = rawContent.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.substring(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.substring(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.substring(0, cleanContent.length - 3);
      }
      cleanContent = cleanContent.trim();

      const parsed = JSON.parse(cleanContent);

      const newQueryLog = {
        turnNum: nextCampaign.turn || 0,
        date: nextCampaign.temporal.date,
        action: `Pregunta al Master: "${queryText}"`,
        textRoll: `💡 Consulta al Master`,
        narrative: parsed.narrative,
        summary: "Consulta Master"
      };

      nextCampaign.log.push(newQueryLog);
      
      await saveCampaignState(nextCampaign);
      setCurrentCampaign(nextCampaign);
      setCustomAction("");
      setIsQueryMode(false);
    } catch (err) {
      alert("Error al consultar al Master: " + err.message);
    } finally {
      setIsLlmLoading(false);
    }
  };

  // --- TRIGGER HERITAGE SYSTEM ---
  const handleHeritage = () => {
    setHeritageSource(currentCampaign);
    setWizardArchetype("libre");
    setWizardStep(1);
    setCurrentScreen("create");
  };

  // --- SAVE SETTINGS (⚙) ---
  const handleSaveSettings = () => {
    localStorage.setItem("openai_api_key", apiKey);
    localStorage.setItem("supabase_url", supabaseUrl);
    localStorage.setItem("supabase_key", supabaseKey);
    alert("Configuración guardada correctamente.");
    setCurrentScreen("campaigns");
  };

  // --- ADMIN PANEL STATE UPDATE ---
  const handleAdminSave = (updatedFields) => {
    const updated = {
      ...currentCampaign,
      ...updatedFields
    };
    setCurrentCampaign(updated);
    saveCampaignState(updated);
  };

  // Auto-scroll narrative to bottom when log changes
  useEffect(() => {
    if (narrativeEndRef.current) {
      narrativeEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentCampaign?.log?.length, isLlmLoading]);

  // --- RENDERING SCREENS ---

  return (
    <div style={{ maxWidth: "1250px", margin: "0 auto", padding: "15px" }}>
      
      {/* 1. CAMPAIGNS SELECT SCREEN */}
      {currentScreen === "campaigns" && (
        <div className="animate-fade">
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "1px solid var(--card-border)", paddingBottom: "15px" }}>
            <h1 style={{ fontFamily: "var(--font-title)", fontSize: "2rem", fontWeight: "800", background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              🔮 Motor RPG Persistente
            </h1>
            
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button 
                onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
                className="glass-panel"
                style={{ padding: "8px 12px", cursor: "pointer", fontSize: "1.1rem" }}
                title="Cambiar Modo Día / Noche"
              >
                {theme === "dark" ? "☀️ Día" : "🌙 Noche"}
              </button>
              <button 
                onClick={() => setCurrentScreen("settings")}
                className="glass-panel"
                style={{ padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", fontSize: "0.9rem" }}
              >
                ⚙️ Ajustes / API Keys
              </button>
            </div>
          </header>

          <section>
            <h2 style={{ fontFamily: "var(--font-title)", fontSize: "1.3rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Tus Partidas de Campaña
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
              
              {campaigns.map(c => (
                <div 
                  key={c.id} 
                  className="glass-panel"
                  style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "270px", cursor: "pointer" }}
                  onClick={() => {
                    setCurrentCampaign(c);
                    setCurrentScreen("game");
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.2rem", fontWeight: "600", color: "var(--text-primary)" }}>{c.campaign.name}</h3>
                      <button 
                        onClick={(e) => deleteCampaign(c.id, e)} 
                        style={{ background: "transparent", border: "none", color: "var(--color-fail)", cursor: "pointer", fontSize: "1.1rem" }}
                        title="Borrar campaña"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "10px" }}>
                      Mundo: {c.campaign.world} {c.campaign.region ? `| ${c.campaign.region}` : ""}
                    </p>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                      <span style={{ fontSize: "0.75rem", background: "var(--panel-bg-hover)", padding: "2px 8px", borderRadius: "12px", border: "1px solid var(--card-border)", color: "var(--text-secondary)" }}>
                        Turno: {c.turn || 0}
                      </span>
                      <span style={{ fontSize: "0.75rem", background: "var(--panel-bg-hover)", padding: "2px 8px", borderRadius: "12px", border: "1px solid var(--card-border)", color: "var(--text-secondary)" }}>
                        Dificultad: {c.difficulty.toUpperCase()}
                      </span>
                      <span style={{ fontSize: "0.75rem", background: "var(--panel-bg-hover)", padding: "2px 8px", borderRadius: "12px", border: "1px solid var(--card-border)", color: "var(--text-secondary)" }}>
                        📅 {c.temporal.date}
                      </span>
                    </div>

                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                      {c.memory.summary}
                    </p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", borderTop: "1px solid var(--card-border)", paddingTop: "8px", marginTop: "10px" }}>
                    <span style={{ color: "var(--color-health)" }}>❤️ {c.physical.health}%</span>
                    <span style={{ color: "var(--color-fatigue)" }}>⚡ {c.physical.fatigue}%</span>
                    <span style={{ color: "var(--color-money)" }}>💰 {c.wealth.money}</span>
                  </div>
                </div>
              ))}

              <div 
                className="glass-panel"
                style={{ 
                  borderStyle: "dashed", 
                  borderColor: "rgba(168, 85, 247, 0.4)", 
                  padding: "30px", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  height: "270px", 
                  cursor: "pointer" 
                }}
                onClick={() => {
                  setHeritageSource(null);
                  setWizardStep(1);
                  setCurrentScreen("create");
                }}
              >
                <span style={{ fontSize: "3rem", marginBottom: "10px" }}>➕</span>
                <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.2rem", fontWeight: "600", color: "var(--accent-primary)" }}>
                  Nueva Campaña
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", marginTop: "5px" }}>
                  Empieza una nueva partida de rol con personaje personalizado
                </p>
              </div>

            </div>
          </section>
        </div>
      )}

      {/* 2. CONFIGURATION & SETTINGS */}
      {currentScreen === "settings" && (
        <div className="animate-fade" style={{ maxWidth: "700px", margin: "0 auto" }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "1px solid var(--card-border)", paddingBottom: "15px" }}>
            <h1 style={{ fontFamily: "var(--font-title)", fontSize: "1.8rem", fontWeight: "800", background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              ⚙️ Ajustes del Motor
            </h1>
            <button 
              onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
              className="glass-panel"
              style={{ padding: "8px 12px", cursor: "pointer", fontSize: "1.1rem" }}
              title="Cambiar Modo Día / Noche"
            >
              {theme === "dark" ? "☀️ Día" : "🌙 Noche"}
            </button>
          </header>
          <div className="glass-panel" style={{ padding: "30px" }}>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "30px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: "500" }}>
                  OpenAI API Key (para GPT-4o y DALL-E 3)
                </label>
                <input 
                  type="password" 
                  value={apiKey} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setApiKey(val);
                    localStorage.setItem("openai_api_key", val);
                  }}
                  placeholder="sk-proj-..."
                  style={{ width: "100%" }}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                  Tus llaves se guardan localmente en localStorage. Nunca viajan fuera de tu navegador.
                </span>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: "500" }}>
                  Supabase Project URL
                </label>
                <input 
                  type="text" 
                  value={supabaseUrl} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setSupabaseUrl(val);
                    localStorage.setItem("supabase_url", val);
                  }}
                  placeholder="https://your-project.supabase.co"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: "500" }}>
                  Supabase Anon Key
                </label>
                <input 
                  type="password" 
                  value={supabaseKey} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setSupabaseKey(val);
                    localStorage.setItem("supabase_key", val);
                  }}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..."
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                <input 
                  type="checkbox" 
                  id="diceRollToggle"
                  checked={isDiceRollEnabled}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setIsDiceRollEnabled(val);
                    localStorage.setItem("is_dice_roll_enabled", String(val));
                  }}
                  style={{ cursor: "pointer", width: "18px", height: "18px" }}
                />
                <label htmlFor="diceRollToggle" style={{ fontSize: "0.95rem", color: "var(--text-primary)", cursor: "pointer", fontWeight: "500", userSelect: "none" }}>
                  🎲 Habilitar tiradas de dados aleatorias (d20)
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
              <button 
                onClick={() => setCurrentScreen("campaigns")}
                style={{ padding: "10px 20px", background: "transparent", border: "1px solid var(--card-border)", cursor: "pointer", borderRadius: "6px" }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveSettings}
                style={{ padding: "10px 20px", background: "var(--accent-gradient)", border: "none", color: "#fff", cursor: "pointer", borderRadius: "6px", fontWeight: "600", boxShadow: "var(--accent-glow)" }}
              >
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. WIZARD CREATION */}
      {currentScreen === "create" && (
        <div className="animate-fade" style={{ maxWidth: "700px", margin: "0 auto" }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "1px solid var(--card-border)", paddingBottom: "15px" }}>
            <h1 style={{ fontFamily: "var(--font-title)", fontSize: "1.8rem", fontWeight: "800", background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {heritageSource ? "📜 Continuar Linaje" : "🧙‍♂️ Creación"}
            </h1>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button 
                onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
                className="glass-panel"
                style={{ padding: "8px 12px", cursor: "pointer", fontSize: "1.1rem" }}
                title="Cambiar Modo Día / Noche"
              >
                {theme === "dark" ? "☀️ Día" : "🌙 Noche"}
              </button>
              <span style={{ fontSize: "0.9rem", color: "var(--accent-primary)", fontWeight: "600" }}>
                Paso {wizardStep} de {wizardWorld === "history" ? 6 : 5}
              </span>
            </div>
          </header>
          <div className="glass-panel" style={{ padding: "30px" }}>

            {/* STEP 1 */}
            {wizardStep === 1 && (
              <div>
                <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.1rem", marginBottom: "15px", color: "var(--text-secondary)" }}>
                  Elige el Universo de Juego:
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px", marginBottom: "20px" }}>
                  {WORLDS.map(w => (
                    <div 
                      key={w.id}
                      onClick={() => setWizardWorld(w.id)}
                      className="glass-panel"
                      style={{ 
                        padding: "16px", 
                        cursor: "pointer", 
                        borderColor: wizardWorld === w.id ? "var(--accent-primary)" : "var(--card-border)",
                        background: wizardWorld === w.id ? "rgba(168,85,247,0.06)" : "var(--card-bg)"
                      }}
                    >
                      <h4 style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "1rem" }}>{w.name}</h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>{w.desc}</p>
                    </div>
                  ))}
                </div>

                {wizardWorld === "custom" && (
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "6px" }}>Describe tu mundo personalizado:</label>
                    <textarea 
                      value={wizardWorldDesc}
                      onChange={(e) => setWizardWorldDesc(e.target.value)}
                      placeholder="Ej: Un planeta desértico gobernado por piratas..."
                      rows="3"
                      style={{ width: "100%" }}
                    />
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setCurrentScreen("campaigns")} style={{ padding: "10px 20px" }}>Atrás</button>
                  <button 
                    onClick={() => setWizardStep(wizardWorld === "history" ? 2 : 3)}
                    style={{ padding: "10px 20px", background: "var(--accent-gradient)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600" }}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {wizardStep === 2 && wizardWorld === "history" && (
              <div>
                <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.1rem", marginBottom: "15px", color: "var(--text-secondary)" }}>
                  Elige la Época y Región Histórica:
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                  {REGIONS.map(r => (
                    <div 
                      key={r.id}
                      onClick={() => setWizardRegion(r.id)}
                      className="glass-panel"
                      style={{ 
                        padding: "12px", 
                        cursor: "pointer", 
                        borderColor: wizardRegion === r.id ? "var(--accent-primary)" : "var(--card-border)",
                        background: wizardRegion === r.id ? "rgba(168,85,247,0.06)" : "var(--card-bg)"
                      }}
                    >
                      <h4 style={{ fontWeight: "600", fontSize: "0.9rem", color: "var(--text-primary)" }}>{r.name}</h4>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>{r.desc}</p>
                    </div>
                  ))}
                </div>

                {wizardRegion === "manual" && (
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px" }}>Indica tu ubicación/era personalizada:</label>
                    <input 
                      type="text"
                      value={wizardRegionManual}
                      onChange={(e) => setWizardRegionManual(e.target.value)}
                      placeholder="Ej: Grecia — Periodo Helenístico"
                      style={{ width: "100%" }}
                    />
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setWizardStep(1)} style={{ padding: "10px 20px" }}>Atrás</button>
                  <button 
                    onClick={() => setWizardStep(3)}
                    style={{ padding: "10px 20px", background: "var(--accent-gradient)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600" }}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {wizardStep === 3 && (
              <div>
                <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.1rem", marginBottom: "15px", color: "var(--text-secondary)" }}>
                  Elige tu Arquetipo de Personaje:
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                  {ARCHETYPES.map(a => (
                    <div 
                      key={a.id}
                      onClick={() => setWizardArchetype(a.id)}
                      className="glass-panel"
                      style={{ 
                        padding: "12px", 
                        cursor: "pointer", 
                        borderColor: wizardArchetype === a.id ? "var(--accent-primary)" : "var(--card-border)",
                        background: wizardArchetype === a.id ? "rgba(168,85,247,0.06)" : "var(--card-bg)"
                      }}
                    >
                      <h4 style={{ fontWeight: "600", fontSize: "0.95rem", color: "var(--text-primary)" }}>{a.name}</h4>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>{a.desc}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setWizardStep(wizardWorld === "history" ? 2 : 1)} style={{ padding: "10px 20px" }}>Atrás</button>
                  <button 
                    onClick={() => setWizardStep(4)}
                    style={{ padding: "10px 20px", background: "var(--accent-gradient)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600" }}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {wizardStep === 4 && (
              <div>
                <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.1rem", marginBottom: "15px", color: "var(--text-secondary)" }}>
                  Personaliza a tu Héroe
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "4px" }}>Nombre:</label>
                    <input 
                      type="text" 
                      value={wizardName} 
                      onChange={(e) => setWizardName(e.target.value)} 
                      placeholder="Ej: Rodrigo Díaz" 
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "4px" }}>Edad:</label>
                    <input 
                      type="number" 
                      value={wizardAge} 
                      onChange={(e) => setWizardAge(parseInt(e.target.value, 10))} 
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "4px" }}>Lugar de Origen:</label>
                    <input 
                      type="text" 
                      value={wizardOrigin} 
                      onChange={(e) => setWizardOrigin(e.target.value)} 
                      placeholder="Ej: Aldea de Vivar" 
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "4px" }}>Identidad / Profesión:</label>
                    <input 
                      type="text" 
                      value={wizardIdentity} 
                      onChange={(e) => setWizardIdentity(e.target.value)} 
                      placeholder="Ej: Infanzón desterrado" 
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "4px" }}>Trasfondo narrativo inicial:</label>
                  <textarea 
                    value={wizardBackstory} 
                    onChange={(e) => setWizardBackstory(e.target.value)} 
                    placeholder="Describe brevemente su pasado..." 
                    rows="3" 
                    style={{ width: "100%" }}
                  />
                </div>

                <div className="glass-panel" style={{ padding: "15px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", borderBottom: "1px solid var(--card-border)", paddingBottom: "8px" }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: "600" }}>Puntos de Atributos</h4>
                    <span style={{ color: "var(--accent-primary)", fontWeight: "600", fontSize: "0.95rem" }}>Puntos Libres: {wizardAttrPool}</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {Object.keys(wizardAttrs).map(attr => (
                      <div key={attr} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ textTransform: "capitalize", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                          {attr} ({(wizardAttrs[attr] - 10) >= 0 ? `+${Math.floor((wizardAttrs[attr] - 10)/2)}` : Math.floor((wizardAttrs[attr] - 10)/2)})
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <button 
                            onClick={() => handleAttrChange(attr, -1)}
                            style={{ width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--panel-bg-hover)", border: "1px solid var(--card-border)", cursor: "pointer", borderRadius: "50%", color: "var(--text-primary)" }}
                          >
                            -
                          </button>
                          <span style={{ fontWeight: "600", width: "20px", textAlign: "center", color: "var(--text-primary)" }}>{wizardAttrs[attr]}</span>
                          <button 
                            onClick={() => handleAttrChange(attr, 1)}
                            style={{ width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--panel-bg-hover)", border: "1px solid var(--card-border)", cursor: "pointer", borderRadius: "50%", color: "var(--text-primary)" }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setWizardStep(3)} style={{ padding: "10px 20px" }}>Atrás</button>
                  <button 
                    onClick={() => setWizardStep(5)}
                    style={{ padding: "10px 20px", background: "var(--accent-gradient)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600" }}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {wizardStep === 5 && (
              <div>
                <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.1rem", marginBottom: "15px", color: "var(--text-secondary)" }}>
                  Elige el Nivel de Dificultad:
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px", marginBottom: "20px" }}>
                  {DIFFICULTIES.map(d => (
                    <div 
                      key={d.id}
                      onClick={() => setWizardDifficulty(d.id)}
                      className="glass-panel"
                      style={{ 
                        padding: "16px", 
                        cursor: "pointer", 
                        borderColor: wizardDifficulty === d.id ? "var(--accent-primary)" : "var(--card-border)",
                        background: wizardDifficulty === d.id ? "rgba(168,85,247,0.06)" : "var(--card-bg)"
                      }}
                    >
                      <h4 style={{ fontWeight: "600", fontSize: "1rem", color: "var(--text-primary)" }}>{d.name}</h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>{d.desc}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setWizardStep(4)} style={{ padding: "10px 20px" }}>Atrás</button>
                  <button 
                    onClick={() => setWizardStep(6)}
                    style={{ padding: "10px 20px", background: "var(--accent-gradient)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600" }}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6 */}
            {wizardStep === 6 && (
              <div>
                <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.1rem", marginBottom: "15px", color: "var(--text-secondary)" }}>
                  Escala de Tiempo de la Partida:
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px", marginBottom: "20px" }}>
                  {TIMESCALES.map(ts => (
                    <div 
                      key={ts.id}
                      onClick={() => setWizardTimeScale(ts.id)}
                      className="glass-panel"
                      style={{ 
                        padding: "16px", 
                        cursor: "pointer", 
                        borderColor: wizardTimeScale === ts.id ? "var(--accent-primary)" : "var(--card-border)",
                        background: wizardTimeScale === ts.id ? "rgba(168,85,247,0.06)" : "var(--card-bg)"
                      }}
                    >
                      <h4 style={{ fontWeight: "600", fontSize: "1rem", color: "var(--text-primary)" }}>{ts.name}</h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>{ts.desc}</p>
                    </div>
                  ))}
                </div>

                {heritageSource && (
                  <div className="glass-panel" style={{ padding: "12px", border: "1px dashed var(--accent-primary)", marginBottom: "20px" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--accent-primary)", fontWeight: "500" }}>
                      🧬 Legado Activado: Heredas el 50% de oro de {heritageSource.character.name} y su objeto más valioso.
                    </span>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setWizardStep(5)} style={{ padding: "10px 20px" }}>Atrás</button>
                  <button 
                    onClick={handleStartCampaign}
                    style={{ padding: "10px 20px", background: "var(--accent-gradient)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", boxShadow: "var(--accent-glow)" }}
                  >
                    Comenzar Aventura
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 4. MAIN GAMEPLAY DASHBOARD */}
      {currentScreen === "game" && currentCampaign && (
        <div className="animate-fade" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Header Bar */}
          <header className="glass-panel" style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <button 
                onClick={() => setCurrentScreen("campaigns")}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "1.4rem", cursor: "pointer" }}
                title="Volver a Campañas"
              >
                ☰
              </button>
              <div>
                <h2 style={{ fontFamily: "var(--font-title)", fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>
                  {currentCampaign.character.name} <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{currentCampaign.character.archetype}</span>
                </h2>
                <span style={{ fontSize: "0.75rem", color: "var(--accent-primary)" }}>
                  📍 {currentCampaign.currentLocation} ({currentCampaign.campaign.world})
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: "600", display: "block" }}>
                  Turno: {currentCampaign.turn || 0}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block" }}>
                  📅 {currentCampaign.temporal.date}
                </span>
              </div>

              {/* Toggle Sidebar Button */}
              <button 
                onClick={() => setIsSidebarOpen(prev => !prev)}
                className="glass-panel"
                style={{ 
                  padding: "6px 12px", 
                  fontSize: "0.85rem", 
                  fontWeight: "600", 
                  cursor: "pointer", 
                  border: isSidebarOpen ? "1px solid var(--accent-primary)" : "1px solid var(--card-border)",
                  color: isSidebarOpen ? "var(--accent-primary)" : "var(--text-primary)",
                  boxShadow: isSidebarOpen ? "var(--accent-glow)" : "none"
                }}
                title={isSidebarOpen ? "Ocultar panel de datos" : "Mostrar panel de datos"}
              >
                📋 Ficha
              </button>

              <button 
                onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
                className="glass-panel"
                style={{ padding: "6px 10px", fontSize: "0.95rem", cursor: "pointer" }}
                title="Modo Día / Noche"
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>

              <button 
                onClick={() => setShowAdminPanel(prev => !prev)}
                className="glass-panel"
                style={{ padding: "6px 12px", fontSize: "0.8rem", cursor: "pointer", background: showAdminPanel ? "rgba(168,85,247,0.15)" : "transparent", color: "var(--text-primary)" }}
              >
                🛠️ Admin
              </button>
              <button 
                onClick={() => setCurrentScreen("settings")}
                className="glass-panel"
                style={{ padding: "6px 10px", fontSize: "0.8rem", cursor: "pointer", color: "var(--text-primary)" }}
              >
                ⚙️
              </button>
            </div>
          </header>

          {/* Location Banner Image */}
          <div className="glass-panel" style={{ height: "130px", overflow: "hidden", position: "relative", borderRadius: "12px" }}>
            {currentCampaign.locationImage ? (
              <img 
                src={currentCampaign.locationImage} 
                alt={currentCampaign.currentLocation} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ 
                width: "100%", 
                height: "100%", 
                background: "linear-gradient(230deg, var(--card-bg) 0%, var(--bg-color) 100%)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                flexDirection: "column"
              }}>
                <span style={{ fontFamily: "var(--font-title)", fontSize: "1.2rem", fontWeight: "600", color: "var(--text-primary)", opacity: 0.65, letterSpacing: "1px" }}>
                  {currentCampaign.currentLocation.toUpperCase()}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  {isImageGenerating ? "Generando imagen con DALL-E 3..." : "Usa acciones para explorar y revelar imágenes"}
                </span>
              </div>
            )}
            <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", color: "#fff", fontWeight: "500" }}>Clima: {currentCampaign.world.climate}</span>
              <span style={{ fontSize: "0.85rem", color: "#fff", fontWeight: "500" }}>Estación: {currentCampaign.world.season || "Otoño"}</span>
            </div>
            {isImageGenerating && (
              <div style={{ position: "absolute", top: "10px", right: "20px", fontSize: "0.75rem", background: "rgba(0,0,0,0.7)", padding: "2px 8px", borderRadius: "4px", border: "1px solid var(--accent-primary)", color: "var(--accent-primary)" }}>
                ⏳ Cargando imagen...
              </div>
            )}
          </div>

          {/* Collapsible Flex Layout */}
          <div className="game-container-flex" style={{ gap: isSidebarOpen ? "20px" : "0px" }}>
            
            {/* Left Column: Narrative Box & Actions (Chat ChatGPT Style) */}
            <div className={`main-narrative-area ${!isSidebarOpen ? "expanded" : ""}`}>
              
              {/* Narrative Panel (ChatGPT Session look) */}
              <div 
                className="glass-panel" 
                style={{ 
                  height: "560px", // Increased height for text dominance
                  padding: "20px 25px", 
                  overflowY: "auto", 
                  display: "flex", 
                  flexDirection: "column",
                  gap: "5px"
                }}
              >
                {/* Initial starting description */}
                <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "15px", marginBottom: "20px" }}>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Introducción histórica / Trasfondo:</p>
                  <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", fontStyle: "italic", lineHeight: "1.6" }}>
                    {currentCampaign.character.backstory}
                  </p>
                </div>

                {/* ChatGPT Styled Dialog Log */}
                {currentCampaign.log.map((turn, i) => (
                  <div key={i} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px" }}>
                    
                    {/* User Action Bubble */}
                    <div className="chat-bubble user-bubble">
                      <div className="user-bubble-content">
                        <strong>Tú:</strong> {turn.action}
                      </div>
                    </div>

                    {/* Centered Roll Badge */}
                    {turn.textRoll && (
                      <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: "10px" }}>
                        <span style={{ background: "var(--panel-bg-darker)", padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", fontFamily: "monospace", borderLeft: "3px solid var(--accent-secondary)", color: "var(--text-secondary)" }}>
                          {turn.textRoll}
                        </span>
                      </div>
                    )}

                    {/* Master Response Bubble */}
                    <div className="chat-bubble master-bubble">
                      <div className="master-bubble-content">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "4px" }}>
                          <strong style={{ color: "var(--accent-primary)", fontSize: "0.85rem" }}>🔮 MASTER (Turno {turn.turnNum || 0})</strong>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>📅 {turn.date}</span>
                        </div>
                          <div 
                            className="markdown-content" 
                            dangerouslySetInnerHTML={renderMarkdown(turn.narrative)} 
                            style={{ fontSize: "1.05rem", lineHeight: "1.65", color: "var(--text-primary)" }}
                          />
                      </div>
                    </div>

                  </div>
                ))}

                {isRolling && (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <span style={{ fontSize: "2rem" }} className="animate-dice">🎲</span>
                    <p style={{ fontSize: "0.9rem", color: "var(--accent-primary)", marginTop: "8px", fontWeight: "600" }}>
                      Tirando dado d20 y calculando modificadores...
                    </p>
                  </div>
                )}

                {!isRolling && currentCampaign.log.length === 0 && (
                  <div className="chat-bubble master-bubble">
                    <div className="master-bubble-content">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "4px" }}>
                        <strong style={{ color: "var(--accent-primary)", fontSize: "0.85rem" }}>🔮 MASTER</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>📅 {currentCampaign.temporal.date}</span>
                      </div>
                        <div 
                          className="markdown-content" 
                          dangerouslySetInnerHTML={renderMarkdown(currentCampaign.narrative)} 
                          style={{ fontSize: "1.05rem", lineHeight: "1.65", color: "var(--text-primary)" }}
                        />
                    </div>
                  </div>
                )}

                {isLlmLoading && !isRolling && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
                    <span style={{ fontSize: "0.9rem" }}>✍️</span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>El Master está narrando en ChatGPT...</span>
                  </div>
                )}

                <div ref={narrativeEndRef} />
              </div>

              {/* Action Selection Board */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                
                {!apiKey ? (
                  <div className="glass-panel" style={{ padding: "20px", border: "1px solid var(--accent-primary)", display: "flex", flexDirection: "column", gap: "12px", background: "rgba(168,85,247,0.03)", boxShadow: "var(--accent-glow)" }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                      🔑 Se requiere una OpenAI API Key para Jugar
                    </span>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Introduce tu clave de API (sk-proj-...) para habilitar la narrativa e imágenes. Se guardará localmente de forma segura en tu navegador.
                    </p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input 
                        type="password" 
                        placeholder="sk-proj-..."
                        style={{ flexGrow: 1 }}
                        id="inlineApiKeyInput"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = e.target.value.trim();
                            if (val) {
                              setApiKey(val);
                              localStorage.setItem("openai_api_key", val);
                            }
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const val = document.getElementById("inlineApiKeyInput")?.value?.trim();
                          if (val) {
                            setApiKey(val);
                            localStorage.setItem("openai_api_key", val);
                          }
                        }}
                        style={{ padding: "10px 20px", background: "var(--accent-gradient)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer", boxShadow: "var(--accent-glow)" }}
                      >
                        Activar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {!isQueryMode && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        {currentCampaign.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAction(action)}
                            disabled={isLlmLoading}
                            className="glass-panel"
                            style={{ 
                              padding: "12px", 
                              cursor: isLlmLoading ? "not-allowed" : "pointer", 
                              textAlign: "left", 
                              fontSize: "0.85rem", 
                              fontWeight: "500", 
                              background: "rgba(168, 85, 247, 0.05)",
                              border: "1px solid var(--card-border)",
                              color: "var(--text-primary)"
                            }}
                          >
                            <span style={{ color: "var(--accent-primary)", marginRight: "6px" }}>{["A", "B", "C", "D"][idx]}.</span>
                            {action}
                          </button>
                        ))}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "8px" }}>
                      <input 
                        type="text" 
                        value={customAction}
                        onChange={(e) => setCustomAction(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAction(customAction)}
                        placeholder={isQueryMode ? "Consulta tu duda al Master directamente..." : "Escribe tu propia acción personalizada aquí..."}
                        disabled={isLlmLoading}
                        style={{ flexGrow: 1 }}
                      />
                      <button 
                        onClick={() => handleAction(customAction)}
                        disabled={isLlmLoading || !customAction.trim()}
                        style={{ 
                          padding: "10px 20px", 
                          background: "var(--accent-gradient)", 
                          color: "#fff", 
                          border: "none", 
                          borderRadius: "6px", 
                          cursor: isLlmLoading ? "not-allowed" : "pointer",
                          fontWeight: "700" 
                        }}
                      >
                        {isQueryMode ? "Preguntar" : "➔"}
                      </button>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "4px" }}>
                      <input 
                        type="checkbox" 
                        id="queryCheckbox"
                        checked={isQueryMode}
                        onChange={(e) => setIsQueryMode(e.target.checked)}
                        style={{ cursor: "pointer", width: "16px", height: "16px" }}
                      />
                      <label htmlFor="queryCheckbox" style={{ fontSize: "0.8rem", color: "var(--text-secondary)", cursor: "pointer", userSelect: "none" }}>
                        💡 <strong>Consulta al Master</strong> (Preguntas descriptivas: no consume turno, fatiga, hambre ni lanza dados)
                      </label>
                    </div>
                  </>
                )}

              </div>

            </div>

            {/* Right Column: Collapsible Sidebar */}
            <div className={`sidebar-panel ${!isSidebarOpen ? "collapsed" : ""}`}>
              
              {/* Timescale Selector Panel */}
              <div className="glass-panel" style={{ padding: "12px 15px", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--accent-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  ⏱️ Escala Temporal
                </span>
                <select
                  value={currentCampaign.timeScale}
                  onChange={(e) => {
                    const newScale = e.target.value;
                    const updated = {
                      ...currentCampaign,
                      timeScale: newScale,
                      temporal: {
                        ...currentCampaign.temporal,
                        scale: newScale
                      }
                    };
                    setCurrentCampaign(updated);
                    saveCampaignState(updated);
                  }}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  <option value="moment">⏱️ Tiempo Real (Minutos/Horas)</option>
                  <option value="day">☀️ Diario (Día a Día)</option>
                  <option value="week">📅 Semanal (Semana a Semana)</option>
                  <option value="month">🌙 Mensual (Mes a Mes)</option>
                  <option value="year">⏳ Anual (Año a Año)</option>
                </select>
              </div>

              {/* Stats HUD Panel */}
              <div className="glass-panel" style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "12px" }}>
                
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px", fontWeight: "600" }}>
                    <span style={{ color: "var(--color-health)" }}>❤️ Salud</span>
                    <span style={{ color: "var(--text-primary)" }}>{currentCampaign.physical.health}/100</span>
                  </div>
                  <div style={{ background: "var(--panel-bg-hover)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${currentCampaign.physical.health}%`, background: "var(--color-health)", height: "100%", transition: "width 0.4s ease" }} />
                  </div>
                  {currentCampaign.physical.health < 50 && (
                    <span style={{ fontSize: "0.7rem", color: "var(--color-fail)", display: "block", marginTop: "2px" }}>
                      ⚠️ Salud baja: Penalización de tirada aplicada.
                    </span>
                  )}
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px", fontWeight: "600" }}>
                    <span style={{ color: "var(--color-fatigue)" }}>⚡ Fatiga</span>
                    <span style={{ color: "var(--text-primary)" }}>{currentCampaign.physical.fatigue}/100</span>
                  </div>
                  <div style={{ background: "var(--panel-bg-hover)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${currentCampaign.physical.fatigue}%`, background: "var(--color-fatigue)", height: "100%", transition: "width 0.4s ease" }} />
                  </div>
                  {currentCampaign.physical.fatigue > 45 && (
                    <span style={{ fontSize: "0.7rem", color: "var(--color-fatigue)", display: "block", marginTop: "2px" }}>
                      ⚠️ Fatiga alta: Penalización de tirada activa.
                    </span>
                  )}
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px", fontWeight: "600" }}>
                    <span style={{ color: "var(--color-hunger)" }}>🍖 Hambre</span>
                    <span style={{ color: "var(--text-primary)" }}>{currentCampaign.physical.hunger}/100</span>
                  </div>
                  <div style={{ background: "var(--panel-bg-hover)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${currentCampaign.physical.hunger}%`, background: "var(--color-hunger)", height: "100%", transition: "width 0.4s ease" }} />
                  </div>
                  {currentCampaign.physical.hunger > 80 && (
                    <span style={{ fontSize: "0.7rem", color: "var(--color-fail)", display: "block", marginTop: "2px" }}>
                      ⚠️ Hambruna extrema: Pierdes salud automáticamente cada turno.
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--card-border)", paddingTop: "8px" }}>
                  <span style={{ color: "var(--color-money)", fontWeight: "600", fontSize: "0.95rem" }}>💰 Riqueza</span>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "1.1rem" }}>
                      {currentCampaign.wealth.money} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{currentCampaign.wealth.currency}</span>
                    </span>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      Ingresos/turno: +{currentCampaign.wealth.income || 0} | Gastos: {currentCampaign.wealth.expenses || 0}
                    </div>
                  </div>
                </div>

              </div>

              {/* Tab Selector */}
              <div style={{ display: "flex", gap: "2px", borderBottom: "1px solid var(--card-border)", overflowX: "auto" }}>
                {["personaje", "memoria", "mundo", "patrimonio", "inventario", "npcs", "diario"].map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    style={{ 
                      padding: "8px 12px", 
                      fontSize: "0.75rem", 
                      cursor: "pointer", 
                      fontWeight: "600",
                      background: activeTab === t ? "rgba(168,85,247,0.1)" : "transparent",
                      border: "none",
                      borderBottom: activeTab === t ? "2px solid var(--accent-primary)" : "none",
                      color: activeTab === t ? "var(--accent-primary)" : "var(--text-secondary)",
                      textTransform: "capitalize"
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Tab Display Panel */}
              <div className="glass-panel" style={{ height: "355px", overflowY: "auto", padding: "15px" }}>
                
                {/* T1: PERSONAJE */}
                {activeTab === "personaje" && (
                  <div>
                    <h3 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px", marginBottom: "10px" }}>
                      Ficha de Personaje (Edad: {currentCampaign.character.age} años)
                    </h3>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", marginBottom: "12px", textAlign: "center" }}>
                      {Object.keys(currentCampaign.character.attrs).map(attr => {
                        const val = currentCampaign.character.attrs[attr];
                        const mod = Math.floor((val - 10) / 2);
                        return (
                          <div key={attr} style={{ background: "var(--panel-bg-subtle)", padding: "6px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                            <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "var(--text-muted)", display: "block" }}>{attr.substring(0, 3)}</span>
                            <span style={{ fontSize: "0.9rem", fontWeight: "700", display: "block", color: "var(--text-primary)" }}>{val}</span>
                            <span style={{ fontSize: "0.7rem", color: "var(--accent-primary)" }}>{mod >= 0 ? `+${mod}` : mod}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Habilidades de Campaña:</span>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {currentCampaign.character.skills.length === 0 ? (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Ninguna habilidad adquirida aún.</span>
                        ) : (
                          currentCampaign.character.skills.map((s, idx) => (
                            <span key={idx} style={{ fontSize: "0.75rem", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", padding: "2px 8px", borderRadius: "12px", color: "var(--accent-primary)" }}>
                              {s.name} nv{s.level}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Rasgos:</span>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {currentCampaign.character.traits.map((t, idx) => (
                          <span key={idx} style={{ fontSize: "0.75rem", background: "var(--panel-bg-hover)", border: "1px solid var(--card-border)", padding: "2px 8px", borderRadius: "12px", color: "var(--text-primary)" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* T2: MEMORIA */}
                {activeTab === "memoria" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600" }}>Resumen Narrativo Acumulado:</span>
                      <button 
                        onClick={handleMemoryCompression}
                        disabled={isLlmLoading}
                        style={{ padding: "2px 6px", fontSize: "0.7rem", cursor: "pointer" }}
                        title="Sintetizar historia reciente en el resumen principal"
                      >
                        ↺ Comprimir
                      </button>
                    </div>

                    <textarea
                      value={currentCampaign.memory.summary}
                      onChange={(e) => {
                        const updated = {
                          ...currentCampaign,
                          memory: {
                            ...currentCampaign.memory,
                            summary: e.target.value
                          }
                        };
                        setCurrentCampaign(updated);
                      }}
                      onBlur={() => saveCampaignState(currentCampaign)}
                      rows="10"
                      style={{ width: "100%", fontSize: "0.85rem", lineHeight: "1.4", background: "var(--input-bg)" }}
                    />
                  </div>
                )}

                {/* T3: MUNDO */}
                {activeTab === "mundo" && (
                  <div>
                    <h4 style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "4px" }}>Zonas de Mundo Descubiertas:</h4>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                      {currentCampaign.world.zones.map((zone, idx) => (
                        <span key={idx} style={{ fontSize: "0.75rem", background: "rgba(6, 182, 212, 0.1)", border: "1px solid rgba(6, 182, 212, 0.3)", color: "var(--color-mental)", padding: "2px 8px", borderRadius: "12px" }}>
                          📍 {zone}
                        </span>
                      ))}
                    </div>

                    <h4 style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "4px" }}>Eventos Activos:</h4>
                    <ul style={{ paddingLeft: "15px", fontSize: "0.8rem" }}>
                      {currentCampaign.world.events.length === 0 ? (
                        <li style={{ color: "var(--text-muted)" }}>Ningún evento de mundo activo.</li>
                      ) : (
                        currentCampaign.world.events.map((e, idx) => (
                          <li key={idx} style={{ color: "var(--text-primary)" }}>{e}</li>
                        ))
                      )}
                    </ul>
                  </div>
                )}

                {/* T4: PATRIMONIO */}
                {activeTab === "patrimonio" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div>
                      <h4 style={{ fontSize: "0.8rem", color: "var(--text-secondary)", borderBottom: "1px solid var(--card-border)", paddingBottom: "2px", marginBottom: "8px" }}>Balance Financiero</h4>
                      <ul style={{ listStyle: "none", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <li style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text-muted)" }}>Dinero Líquido:</span>
                          <strong style={{ color: "var(--color-money)" }}>{currentCampaign.wealth.money} 💰</strong>
                        </li>
                        <li style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text-muted)" }}>Ingresos / Turno:</span>
                          <strong style={{ color: "var(--color-hunger)" }}>+{currentCampaign.wealth.income || 0} 💰</strong>
                        </li>
                        <li style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text-muted)" }}>Gastos / Turno:</span>
                          <strong style={{ color: "var(--color-health)" }}>-{currentCampaign.wealth.expenses || 0} 💰</strong>
                        </li>
                        <li style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text-muted)" }}>Deudas Acumuladas:</span>
                          <strong style={{ color: "var(--color-fatigue)" }}>{currentCampaign.wealth.debts || 0} 💰</strong>
                        </li>
                      </ul>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div>
                        <h4 style={{ fontSize: "0.8rem", color: "var(--text-secondary)", borderBottom: "1px solid var(--card-border)", paddingBottom: "2px", marginBottom: "4px" }}>Propiedades</h4>
                        {(!currentCampaign.wealth.properties || currentCampaign.wealth.properties.length === 0) ? (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Sin propiedades inmobiliarias.</span>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {currentCampaign.wealth.properties.map((p, idx) => (
                              <div key={idx} style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.03)", padding: "2px 6px", borderRadius: "4px", display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--text-primary)" }}>🏠 {p.name}</span>
                                <span style={{ color: "var(--color-money)" }}>{p.value} 💰</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 style={{ fontSize: "0.8rem", color: "var(--text-secondary)", borderBottom: "1px solid var(--card-border)", paddingBottom: "2px", marginBottom: "4px" }}>Negocios / Activos</h4>
                        {(!currentCampaign.wealth.businesses || currentCampaign.wealth.businesses.length === 0) ? (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Sin negocios activos.</span>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {currentCampaign.wealth.businesses.map((b, idx) => (
                              <div key={idx} style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.03)", padding: "2px 6px", borderRadius: "4px", display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--text-primary)" }}>⚙️ {b.name}</span>
                                <span style={{ color: "var(--color-hunger)" }}>+{b.income}/turno</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* T5: INVENTARIO */}
                {activeTab === "inventario" && (
                  <div>
                    <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--card-border)", color: "var(--text-muted)" }}>
                          <th style={{ textAlign: "left", paddingBottom: "4px" }}>Nombre</th>
                          <th style={{ textAlign: "center", paddingBottom: "4px" }}>Cant.</th>
                          <th style={{ textAlign: "left", paddingBottom: "4px" }}>Categoría</th>
                          <th style={{ textAlign: "right", paddingBottom: "4px" }}>Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentCampaign.inventory.length === 0 ? (
                          <tr>
                            <td colSpan="4" style={{ textAlign: "center", padding: "10px", color: "var(--text-muted)" }}>
                              Inventario vacío.
                            </td>
                          </tr>
                        ) : (
                          currentCampaign.inventory.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                              <td style={{ padding: "6px 0", color: "var(--text-primary)" }}>{item.name}</td>
                              <td style={{ textAlign: "center", color: "var(--accent-primary)" }}>{item.qty}</td>
                              <td style={{ color: "var(--text-secondary)" }}>{item.cat}</td>
                              <td style={{ textAlign: "right", color: "var(--color-money)" }}>{item.value} 💰</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* T6: PNJs */}
                {activeTab === "npcs" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {currentCampaign.npcs.length === 0 ? (
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center" }}>No conoces a ningún personaje todavía.</span>
                    ) : (
                      currentCampaign.npcs.map((npc, idx) => (
                        <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "8px" }}>
                          
                          <div style={{ width: "42px", height: "42px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--card-border)", borderRadius: "4px", overflow: "hidden", flexShrink: 0 }}>
                            {npc.image ? (
                              <img src={npc.image} alt={npc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", color: "var(--text-primary)" }}>
                                👤
                              </div>
                            )}
                          </div>

                          <div style={{ flexGrow: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>{npc.name}</span>
                              {!npc.image && (
                                <button 
                                  onClick={() => generateNpcPortrait(npc.name, `Portrait character: ${npc.name}, who is a ${npc.role} located in ${npc.location}`)}
                                  style={{ padding: "2px 4px", fontSize: "0.6rem", cursor: "pointer" }}
                                >
                                  🎨 Avatar
                                </button>
                              )}
                            </div>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>{npc.role} ({npc.location}) | {npc.status}</span>
                            
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                              <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>Relación:</span>
                              <div style={{ flexGrow: 1, background: "var(--panel-bg-hover)", height: "4px", borderRadius: "2px", overflow: "hidden" }}>
                                <div style={{ width: `${(npc.relation + 100) / 2}%`, background: npc.relation >= 0 ? "var(--color-hunger)" : "var(--color-fail)", height: "100%" }} />
                              </div>
                              <span style={{ fontSize: "0.65rem", fontWeight: "600", color: "var(--text-primary)" }}>{npc.relation >= 0 ? `+${npc.relation}` : npc.relation}</span>
                            </div>
                          </div>

                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* T7: DIARIO */}
                {activeTab === "diario" && (
                  <div>
                    <ul style={{ paddingLeft: "10px", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {currentCampaign.memory.keyEvents.length === 0 ? (
                        <li style={{ color: "var(--text-muted)", listStyle: "none" }}>Ningún hito registrado.</li>
                      ) : (
                        currentCampaign.memory.keyEvents.map((e, idx) => (
                          <li key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "4px" }}>
                            <span style={{ color: "var(--text-primary)" }}>
                              <span style={{ color: "var(--accent-primary)", marginRight: "6px", fontWeight: "600" }}>[{e.date}]</span>
                              {e.desc}
                            </span>
                            <button
                              onClick={() => {
                                const updatedEvents = currentCampaign.memory.keyEvents.filter((_, i) => i !== idx);
                                const updated = {
                                  ...currentCampaign,
                                  memory: { ...currentCampaign.memory, keyEvents: updatedEvents }
                                };
                                setCurrentCampaign(updated);
                                saveCampaignState(updated);
                              }}
                              style={{ border: "none", background: "transparent", color: "var(--color-fail)", cursor: "pointer", fontSize: "0.85rem" }}
                            >
                              🗑️
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}

              </div>

            </div>

          </div>

          {/* 5. ADMIN CONTROL PANEL MODAL OVERLAY */}
          {showAdminPanel && (
            <div className="glass-panel" style={{ border: "1px solid var(--accent-primary)", padding: "20px", marginTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--card-border)", paddingBottom: "8px", marginBottom: "15px" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--accent-primary)" }}>🛠️ Modo Administrador (Cheat Console & Sandbox)</h3>
                <button onClick={() => setShowAdminPanel(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>✕</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginBottom: "15px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Salud:</label>
                  <input 
                    type="number" 
                    value={currentCampaign.physical.health}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      handleAdminSave({
                        physical: { ...currentCampaign.physical, health: Math.max(0, Math.min(100, val)) }
                      });
                    }}
                    style={{ width: "100%", padding: "4px 8px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Fatiga:</label>
                  <input 
                    type="number" 
                    value={currentCampaign.physical.fatigue}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      handleAdminSave({
                        physical: { ...currentCampaign.physical, fatigue: Math.max(0, Math.min(100, val)) }
                      });
                    }}
                    style={{ width: "100%", padding: "4px 8px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Hambre:</label>
                  <input 
                    type="number" 
                    value={currentCampaign.physical.hunger}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      handleAdminSave({
                        physical: { ...currentCampaign.physical, hunger: Math.max(0, Math.min(100, val)) }
                      });
                    }}
                    style={{ width: "100%", padding: "4px 8px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Dinero:</label>
                  <input 
                    type="number" 
                    value={currentCampaign.wealth.money}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      handleAdminSave({
                        wealth: { ...currentCampaign.wealth, money: Math.max(0, val) }
                      });
                    }}
                    style={{ width: "100%", padding: "4px 8px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Turno:</label>
                  <input 
                    type="number" 
                    value={currentCampaign.turn}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      handleAdminSave({ turn: Math.max(0, val) });
                    }}
                    style={{ width: "100%", padding: "4px 8px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "15px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Ingresos / Turno:</label>
                  <input 
                    type="number" 
                    value={currentCampaign.wealth.income || 0}
                    onChange={(e) => handleAdminSave({ wealth: { ...currentCampaign.wealth, income: Math.max(0, parseInt(e.target.value, 10)) } })}
                    style={{ width: "100%", padding: "4px 8px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Gastos / Turno:</label>
                  <input 
                    type="number" 
                    value={currentCampaign.wealth.expenses || 0}
                    onChange={(e) => handleAdminSave({ wealth: { ...currentCampaign.wealth, expenses: Math.max(0, parseInt(e.target.value, 10)) } })}
                    style={{ width: "100%", padding: "4px 8px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Deudas:</label>
                  <input 
                    type="number" 
                    value={currentCampaign.wealth.debts || 0}
                    onChange={(e) => handleAdminSave({ wealth: { ...currentCampaign.wealth, debts: Math.max(0, parseInt(e.target.value, 10)) } })}
                    style={{ width: "100%", padding: "4px 8px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px", borderTop: "1px dashed var(--card-border)", paddingTop: "12px" }}>
                
                <div>
                  <h4 style={{ fontSize: "0.8rem", color: "var(--accent-primary)", marginBottom: "6px" }}>Añadir Propiedad</h4>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input 
                      type="text" 
                      placeholder="Nombre"
                      value={adminPropName}
                      onChange={(e) => setAdminPropName(e.target.value)}
                      style={{ padding: "4px 8px", fontSize: "0.8rem", flexGrow: 1 }}
                    />
                    <input 
                      type="number" 
                      placeholder="Valor"
                      value={adminPropVal}
                      onChange={(e) => setAdminPropVal(parseInt(e.target.value, 10))}
                      style={{ padding: "4px 8px", fontSize: "0.8rem", width: "70px" }}
                    />
                    <button 
                      onClick={() => {
                        if (!adminPropName.trim()) return;
                        const props = currentCampaign.wealth.properties ? [...currentCampaign.wealth.properties] : [];
                        props.push({ name: adminPropName, value: adminPropVal || 0 });
                        handleAdminSave({ wealth: { ...currentCampaign.wealth, properties: props } });
                        setAdminPropName("");
                        setAdminPropVal(0);
                      }}
                      style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                    >
                      +
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
                    {currentCampaign.wealth.properties && currentCampaign.wealth.properties.map((p, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", background: "rgba(255,255,255,0.02)", padding: "2px" }}>
                        <span>{p.name} ({p.value})</span>
                        <button 
                          onClick={() => {
                            const props = currentCampaign.wealth.properties.filter((_, i) => i !== idx);
                            handleAdminSave({ wealth: { ...currentCampaign.wealth, properties: props } });
                          }}
                          style={{ border: "none", background: "transparent", color: "var(--color-fail)", cursor: "pointer", fontSize: "0.7rem" }}
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.8rem", color: "var(--accent-primary)", marginBottom: "6px" }}>Añadir Negocio</h4>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input 
                      type="text" 
                      placeholder="Nombre"
                      value={adminBizName}
                      onChange={(e) => setAdminBizName(e.target.value)}
                      style={{ padding: "4px 8px", fontSize: "0.8rem", flexGrow: 1 }}
                    />
                    <input 
                      type="number" 
                      placeholder="Ingreso"
                      value={adminBizInc}
                      onChange={(e) => setAdminBizInc(parseInt(e.target.value, 10))}
                      style={{ padding: "4px 8px", fontSize: "0.8rem", width: "70px" }}
                    />
                    <button 
                      onClick={() => {
                        if (!adminBizName.trim()) return;
                        const biz = currentCampaign.wealth.businesses ? [...currentCampaign.wealth.businesses] : [];
                        biz.push({ name: adminBizName, income: adminBizInc || 0 });
                        handleAdminSave({ wealth: { ...currentCampaign.wealth, businesses: biz } });
                        setAdminBizName("");
                        setAdminBizInc(0);
                      }}
                      style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                    >
                      +
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
                    {currentCampaign.wealth.businesses && currentCampaign.wealth.businesses.map((b, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", background: "rgba(255,255,255,0.02)", padding: "2px" }}>
                        <span>{b.name} (+{b.income})</span>
                        <button 
                          onClick={() => {
                            const biz = currentCampaign.wealth.businesses.filter((_, i) => i !== idx);
                            handleAdminSave({ wealth: { ...currentCampaign.wealth, businesses: biz } });
                          }}
                          style={{ border: "none", background: "transparent", color: "var(--color-fail)", cursor: "pointer", fontSize: "0.7rem" }}
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", borderTop: "1px dashed var(--card-border)", paddingTop: "12px" }}>
                <div style={{ flexGrow: 1 }}>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Añadir Objeto al Inventario:</label>
                  <input 
                    type="text" 
                    id="adminItemName"
                    placeholder="Nombre del objeto"
                    style={{ width: "100%", padding: "6px" }}
                  />
                </div>
                <button 
                  onClick={() => {
                    const inputEl = document.getElementById("adminItemName");
                    const name = inputEl?.value;
                    if (name) {
                      const updatedInv = [...currentCampaign.inventory];
                      const idx = updatedInv.findIndex(i => i.name === name);
                      if (idx !== -1) {
                        updatedInv[idx].qty += 1;
                      } else {
                        updatedInv.push({ name, qty: 1, cat: "Admin", value: 10 });
                      }
                      handleAdminSave({ inventory: updatedInv });
                      inputEl.value = "";
                    }
                  }}
                  style={{ padding: "6px 12px", background: "var(--accent-secondary)", border: "none", color: "#fff", cursor: "pointer", borderRadius: "4px" }}
                >
                  Añadir
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* 6. CHARACTER DEATH SCREEN */}
      {currentScreen === "dead" && currentCampaign && (
        <div className="animate-fade" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "1px solid var(--card-border)", paddingBottom: "15px" }}>
            <h1 style={{ fontFamily: "var(--font-title)", fontSize: "1.8rem", fontWeight: "800", color: "var(--color-fail)" }}>
              💀 El Fin de una Era
            </h1>
            <button 
              onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
              className="glass-panel"
              style={{ padding: "8px 12px", cursor: "pointer", fontSize: "1.1rem" }}
              title="Cambiar Modo Día / Noche"
            >
              {theme === "dark" ? "☀️ Día" : "🌙 Noche"}
            </button>
          </header>
          <div className="glass-panel" style={{ padding: "40px", border: "1px solid var(--color-fail)", textAlign: "center" }}>
            <span style={{ fontSize: "4rem", display: "block", marginBottom: "15px" }}>💀</span>
            <h1 style={{ fontFamily: "var(--font-title)", fontSize: "1.8rem", color: "var(--color-fail)", fontWeight: "800", marginBottom: "15px" }}>
              LA HISTORIA HA TERMINADO
            </h1>
            
            <div style={{ background: "var(--panel-bg-darker)", padding: "20px", borderRadius: "8px", border: "1px solid var(--card-border)", marginBottom: "25px", textAlign: "left" }}>
              <h3 style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: "600" }}>Causa de la muerte:</h3>
              <div 
                className="markdown-content" 
                dangerouslySetInnerHTML={renderMarkdown(currentCampaign.narrative)} 
                style={{ fontSize: "0.95rem", lineHeight: "1.5", color: "var(--text-primary)" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button 
                onClick={handleHeritage}
                style={{ 
                  padding: "12px 24px", 
                  background: "var(--accent-gradient)", 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: "6px", 
                  cursor: "pointer", 
                  fontWeight: "700",
                  boxShadow: "var(--accent-glow)",
                  fontSize: "1rem"
                }}
              >
                🧬 Continuar Legado (Heredar)
              </button>
              <button 
                onClick={() => setCurrentScreen("campaigns")}
                style={{ 
                  padding: "10px 20px", 
                  background: "transparent", 
                  border: "1px solid var(--card-border)", 
                  cursor: "pointer", 
                  borderRadius: "6px",
                  fontSize: "0.9rem" 
                }}
              >
                Volver al Menú Principal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
