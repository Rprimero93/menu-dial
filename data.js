// ===== Contenido del dial (Fase 3) =====
// Fuente: hoja de vida de Ricardo Villamil Martínez (2026). Este es el único archivo que hay que
// editar para cambiar el contenido: agregar o quitar una opción de `items` recalcula anillo y lista.
// Privacidad: el sitio es público, por eso no se incluye el teléfono ni el PDF de la hoja de vida.
// Cada opción: label, icon (nombre de ICONS en script.js), desc y content { type, ... } — un tipo por renderizador.
const PORTFOLIO = {
  header: {
    title: 'PORTAFOLIO',
    role: 'Ricardo Villamil Martínez · Automatización de procesos',
    hint: 'Gira el dial para explorar mi perfil.',
    hintOpen: 'Gira el medio dial para cambiar de sección.',
  },

  // Versión móvil (Fase 4, por debajo de 700 px): tarjeta-menú. Nombre e iniciales salen de «Sobre mí».
  mobile: {
    pill: 'Portafolio',
    subtitle: 'Automatización de procesos',
    badge: '+9 años',
    lower: ['skills', 'contact'], // ids que van en el grupo inferior (Contacto muestra sus enlaces directos)
    footer: { handle: '@Rprimero93', role: 'Automatización de procesos', href: 'https://github.com/Rprimero93' },
  },

  items: [
    {
      id: 'about', label: 'Sobre mí', icon: 'user',
      desc: 'Perfil profesional.',
      content: {
        type: 'profile',
        initials: 'RV',
        name: 'Ricardo Villamil Martínez',
        role: 'Automatización de procesos',
        location: 'Bogotá, Colombia',
        text: 'Experto en TI con más de 9 años de experiencia. Automatizo procesos y construyo microaplicaciones de control, análisis y seguimiento para los sectores público y privado.',
        // Cifras de la tarjeta: [valor, texto]; un valor '#<id>' se calcula contando esa sección
        stats: [
          ['+9', 'años de experiencia'],
          ['#certifications', 'certificaciones'],
          ['6', 'herramientas web'],
        ],
        // Botones: [texto, enlace, ícono]; el primero va relleno en azul y el segundo con borde
        actions: [
          ['Escríbeme', 'mailto:villamil76@gmail.com', 'mail'],
          ['GitHub', 'https://github.com/Rprimero93', 'github'],
        ],
        // Habilidades más relevantes (debajo del texto). Mientras un espacio esté vacío ('') se muestra como «Skill N» punteado.
        skillsTitle: 'Habilidades destacadas',
        skills: ['Excel Avanzado · Pontificia Universidad Javeriana', 'Auditor ISO 27001 SGSI · CertiProf', 'Project Management Essentials · CertiProf'],
      },
    },
    {
      id: 'education', label: 'Formación', icon: 'graduation',
      desc: 'Formación académica y diplomados.',
      content: {
        type: 'list',
        sections: [
          ['Formación académica', [
            ['Ingeniería de Sistemas', 'Fundación Universitaria San José', 'En curso · 8.º semestre'],
            ['Tecnólogo en Análisis de Sistemas y Programación de Computadores', 'Fundación Politécnica Tequendama (Fundesa)'],
            ['Técnico en Mantenimiento de Equipos de Cómputo', 'SENA'],
          ]],
          ['Diplomados', [
            ['Gerencia de Proyectos', 'Politécnico de Colombia'],
            ['Interventoría y Auditoría de Proyectos', 'Politécnico de Colombia'],
            ['Auditoría de Sistemas de Gestión ISO 19011:2018', 'Politécnico de Colombia'],
          ]],
        ],
      },
    },
    {
      id: 'certifications', label: 'Certificaciones', icon: 'award',
      desc: 'Certificaciones profesionales.',
      content: {
        type: 'list',
        sections: [
          [null, [
            ['Excel Avanzado', 'Pontificia Universidad Javeriana'],
            ['Auditor ISO 27001 SGSI', 'CertiProf'],
            ['ITIL 4 Foundation', 'PeopleCert'],
            ['Scrum Foundation Certification (SFC™)', 'SCRUMstudy'],
            ['Project Management Essentials (PME)', 'CertiProf'],
            ['Cyber Security Foundation', 'CertiProf'],
            ['Lean Six Sigma White Belt Professional', 'CertiProf'],
          ]],
        ],
      },
    },
    {
      id: 'experience', label: 'Experiencia', icon: 'briefcase',
      desc: 'Trayectoria profesional.',
      content: {
        type: 'timeline',
        rows: [
          {
            role: 'Coordinador Wallbox', org: 'Los Coches S.A.S.', dates: 'Mar 2026 – Ago 2026',
            points: [
              'Coordiné la logística de la línea de cargadores Wallbox para vehículos eléctricos y sus accesorios.',
              'Gestioné la facturación de los cargadores y sus accesorios.',
              'Estandaricé y automaticé procesos operativos del área y los documenté en manuales de operación para que se ejecuten de forma consistente y el conocimiento quede en la empresa.',
            ],
          },
          {
            role: 'Automatizador de Procesos', org: 'Escuela Superior de Administración Pública (ESAP)', dates: 'Dic 2020 – Dic 2025',
            points: [
              'Diseñé e implementé 6 herramientas web integradas con Excel, SharePoint y Power Automate para el control operativo del área de infraestructura (arrendamientos, comodatos y mantenimiento de sedes a nivel nacional).',
              'Monté tableros de seguimiento diario con indicadores de avance (incluido el SPI, índice de desempeño del cronograma) que sirvieron para priorizar los contratos pendientes.',
              'Adapté la herramienta GLPI para las solicitudes de mantenimiento locativo a nivel nacional.',
              'Implementé controles de acceso y respaldos de información siguiendo las buenas prácticas de ITIL 4 y la norma ISO 27001.',
              'Administré la información inmobiliaria de las sedes de la entidad en todo el país como fuente única para la toma de decisiones.',
            ],
          },
          {
            role: 'Frontdesk', org: 'Sonda (Proyecto Hocol)', dates: 'Ene 2020 – May 2020',
            points: [
              'Gestioné incidentes y requerimientos en la herramienta ITSM del proyecto según el ciclo de vida ITIL.',
              'Construí y reporté los indicadores de operación del servicio.',
              'Di soporte a usuarios y gestioné el cableado de comunicaciones en racks.',
            ],
          },
          {
            role: 'Técnico de Soporte en Sitio', org: 'Selcomp (Proyecto Capital Salud)', dates: 'Jun 2018 – Nov 2019',
            points: [
              'Hice mantenimiento preventivo y correctivo de equipos de cómputo y atendí casos de soporte de nivel 1.',
              'Administré los cuartos técnicos de las sedes del proyecto.',
            ],
          },
          {
            role: 'Técnico de Soporte en Sitio', org: 'Secretaría de Gobierno de Bogotá', dates: 'Dic 2016 – Abr 2018',
            points: ['Di soporte técnico a usuarios y gestioné tickets y solicitudes en la herramienta ITSM y por correo.'],
          },
        ],
      },
    },
    {
      id: 'projects', label: 'Proyectos', icon: 'folder',
      desc: 'Trabajo destacado.',
      content: {
        type: 'projects',
        rows: [
          {
            name: 'Herramientas de control operativo — ESAP',
            text: '6 herramientas web integradas con Excel, SharePoint y Power Automate para el control operativo del área de infraestructura:',
            points: ['Plan de pagos (macros en Excel)', 'GLPI (sistema de solicitudes de requerimientos logísticos)',
              'Matriz de aseo', 'Matriz de ingreso vehicular', 'Matriz de servicios públicos', 'Matriz de viáticos'],
            tags: ['Excel', 'SharePoint', 'Power Automate'],
          },
        ],
      },
    },
    {
      id: 'achievements', label: 'Logros', icon: 'trophy',
      desc: 'Resultados medibles como Automatizador de Procesos en la ESAP.',
      content: {
        type: 'kpis',
        tiles: [
          ['Reducción del tiempo de gestión', '87,5 %', 'de 4 horas a 30 minutos por proceso'],
          ['Herramientas web', '6', 'con Excel, SharePoint y Power Automate'],
          ['Usuarios internos', '21', 'capacitación, soporte y continuidad'],
          ['Experiencia en TI', '+9 años', 'en los sectores público y privado'],
        ],
        compare: {
          title: 'Tiempo de gestión por proceso',
          rows: [['Antes', '4 horas', 240], ['Después', '30 minutos', 30]],
        },
      },
    },
    {
      id: 'skills', label: 'Competencias', icon: 'code',
      desc: 'Competencias técnicas.',
      content: {
        type: 'tags',
        groups: [
          ['Automatización y low-code', ['Power Automate', 'SharePoint', 'Microsoft 365']],
          ['Datos y reportes', ['Excel avanzado', 'Tablas dinámicas', 'Fórmulas', 'VBA', 'Power BI', 'Tableros de indicadores']],
          ['Desarrollo', ['HTML', 'CSS', 'JavaScript', 'Python']],
          ['Gestión de servicios y gobierno de TI', ['ITIL 4', 'Herramientas ITSM', 'ANS', 'Gestión de incidentes']],
          ['Seguridad y auditoría', ['ISO 27001 (SGSI)', 'ISO 19011 (auditoría de sistemas de gestión)']],
          ['Gestión de proyectos', ['Scrum', 'Seguimiento de cronograma (SPI)', 'Gestión de riesgos', 'Interventoría']],
        ],
      },
    },
    {
      id: 'contact', label: 'Contacto', icon: 'mail',
      desc: 'Hablemos.',
      content: {
        type: 'contact',
        rows: [
          ['mapPin', 'Ubicación', 'Bogotá, Colombia', null],
          ['mail', 'Correo', 'villamil76@gmail.com', 'mailto:villamil76@gmail.com'],
          ['github', 'GitHub', 'github.com/Rprimero93', 'https://github.com/Rprimero93'],
        ],
      },
    },
  ],
};
