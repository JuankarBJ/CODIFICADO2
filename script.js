document.addEventListener('DOMContentLoaded', () => {
  // --- Objeto de Definiciones de Normas ---
  const normasDefiniciones = {
    "Ley 7/2020, de 31 de agosto - Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.": {
      rango: "Ley Ordinaria",
      ambito: "Autonómico"
    },
    "Ley Orgánica 4/2015, de 30 de marzo - Protección De La Seguridad Ciudadana.": {
      rango: "Ley Orgánica",
      ambito: "Estatal"
    },
    // ... el resto de tus definiciones de normas si tienes más ...
  };

  // --- Orden de los Ámbitos y Rangos (sin cambios aquí) ---
  const ambitoOrder = ["Estatal", "Autonómico", "Local"];
  const rangoOrder = ["Ley Orgánica", "Ley Ordinaria", "Real Decreto Legislativo", "Real Decreto Ley", "Reglamento", "Ordenanza"];

  // --- Tus datos de infracciones (TODO EN UN SOLO ARRAY) ---
  const infraccionesData = [
    // Infracciones del Artículo 41
    {
      tipo: "leve",
      circulo: "L",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "41",
      apartado: "1",
      importe: "De 300 a 3.000 euros",
      importe_reducido: "",
      descripcion: "No facilitar a los animales alimentación adecuada a sus necesidades, no solamente para su subsistencia, así como alimentarlos con productos o sustancias prohibidas por la legislación vigente o sin poseer la autorización en caso de que sea necesaria, siempre que con ello no se les cause trastornos graves o la muerte del animal.",
      tags: ["Animales", "Alimentación"]
    },
    {
      tipo: "leve",
      circulo: "L",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "41",
      apartado: "2",
      importe: "De 300 a 3.000 euros",
      importe_reducido: "",
      descripcion: "Mantener a los animales en condiciones inadecuadas desde el punto de vista higiénico-sanitario, desatendiendo su cuidado y atención, de acuerdo con las necesidades fisiológicas y etológicas por especie y raza, siempre que no se hayan causado lesiones, enfermedades o sufrimiento al animal.",
      tags: ["Animales", "Higiene", "Bienestar"]
    },
    {
      tipo: "leve",
      circulo: "L",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "41",
      apartado: "3",
      importe: "De 300 a 3.000 euros",
      importe_reducido: "",
      descripcion: "No educar o socializar a los animales de compañía que así lo requieran.",
      tags: ["Animales", "Educación", "Socialización"]
    },
    {
      tipo: "leve",
      circulo: "L",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "41",
      apartado: "4",
      importe: "De 300 a 3.000 euros",
      importe_reducido: "",
      descripcion: "No estar en posesión del preceptivo documento sanitario o no tenerlos adecuadamente diligenciados, en los casos que proceda.",
      tags: ["Animales", "Documentación"]
    },
    {
      tipo: "leve",
      circulo: "L",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "41",
      apartado: "5",
      importe: "De 300 a 3.000 euros",
      importe_reducido: "",
      descripcion: "No disponer, en su caso, de los archivos de las fichas clínicas de los animales objeto de vacunación o de tratamiento obligatorio, o que éstos estén incompletos.",
      tags: ["Animales", "Documentación"]
    },
    {
      tipo: "leve",
      circulo: "L",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "41",
      apartado: "6",
      importe: "De 300 a 3.000 euros",
      importe_reducido: "",
      descripcion: "La falta de comunicación a los registros de identificación de animales de compañía de las altas, bajas y cambios de titularidad de los mismos.",
      tags: ["Animales", "Registro"]
    },
    {
      tipo: "leve",
      circulo: "L",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "41",
      apartado: "7",
      importe: "De 300 a 3.000 euros",
      importe_reducido: "",
      descripcion: "El incumplimiento de las condiciones de circulación de los animales de compañía previstas en esta ley.",
      tags: ["Animales", "Circulación"]
    },
    {
      tipo: "leve",
      circulo: "L",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "41",
      apartado: "8",
      importe: "De 300 a 3.000 euros",
      importe_reducido: "",
      descripcion: "El transporte de animales con vulneración de los requisitos establecidos en la legislación vigente siempre que, como consecuencia de dicha vulneración, no se hayan producido trastornos graves, lesiones o heridas en los animales.",
      tags: ["Animales", "Transporte"]
    },
    {
      tipo: "leve",
      circulo: "L",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "41",
      apartado: "9",
      importe: "De 300 a 3.000 euros",
      importe_reducido: "",
      descripcion: "No entregar la documentación exigida en la entrega, cesión, adopción y venta de animales",
      tags: ["Animales", "Venta"]
    },
    {
      tipo: "leve",
      circulo: "L",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "41",
      apartado: "10",
      importe: "De 300 a 3.000 euros",
      importe_reducido: "",
      descripcion: "No comunicar en el tiempo establecido la desaparición de un animal.",
      tags: ["Animales", "Registro"]
    },
    {
      tipo: "leve",
      circulo: "L",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "41",
      apartado: "11",
      importe: "De 300 a 3.000 euros",
      importe_reducido: "",
      descripcion: "La manipulación artificial de los animales con objeto de hacerlos atractivos como diversión o juguete para su venta, si no se les causa sufrimiento, daño o lesión",
      tags: ["Animales", "Maltrato", "Comercio"]
    },
    {
      tipo: "leve",
      circulo: "L",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "41",
      apartado: "12",
      importe: "De 300 a 3.000 euros",
      importe_reducido: "",
      descripcion: "Exhibir a los animales de compañía en escaparates que estén en vías públicas y accesos públicos.",
      tags: ["Animales", "Comercio"]
    },
    {
      tipo: "leve",
      circulo: "L",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "41",
      apartado: "13",
      importe: "De 300 a 3.000 euros",
      importe_reducido: "",
      descripcion: "No realizar tratamientos sanitarios y vacunaciones declarados obligatorios en los animales.",
      tags: ["Animales", "Salud Animal"]
    },
    {
      tipo: "leve",
      circulo: "L",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "41",
      apartado: "14",
      importe: "De 300 a 3.000 euros",
      importe_reducido: "",
      descripcion: "No adoptar las medidas oportunas para impedir que los animales ensucien las vías, espacios públicos o establecimientos, o para eliminar las deyecciones que realicen en estos lugares.",
      tags: ["Animales", "Higiene Pública"]
    },
    {
      tipo: "leve",
      circulo: "L",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "41",
      apartado: "15",
      importe: "De 300 a 3.000 euros",
      importe_reducido: "",
      descripcion: "La carencia de los libros de registro establecidos en esta ley en los núcleos zoológicos",
      tags: ["Animales", "Registro", "Núcleos Zoológicos"]
    },
    {
      tipo: "leve",
      circulo: "L",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "41",
      apartado: "16",
      importe: "De 300 a 3.000 euros",
      importe_reducido: "",
      descripcion: "No disponer de los correspondientes certificados de competencia o cualificaciones profesionales exigidos en esta ley",
      tags: ["Animales", "Cualificaciones"]
    },
    {
      tipo: "leve",
      circulo: "L",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "41",
      apartado: "17",
      importe: "De 300 a 3.000 euros",
      importe_reducido: "",
      descripcion: "Cualquier incumplimiento de los requisitos, obligaciones o prohibiciones establecidas en esta ley que no esté calificado específicamente como grave o muy grave.",
      tags: ["Animales", "General"]
    },
    {
      tipo: "leve",
      circulo: "L",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "41",
      apartado: "18",
      importe: "De 300 a 3.000 euros",
      importe_reducido: "",
      descripcion: "La utilización y uso de objetos que causen lesión a los animales que están bajo nuestra responsabilidad (collares de pinchos o púas), collares de ahogo y collares de descarga eléctrica, fuera de lo previsto en esta ley.",
      tags: ["Animales", "Maltrato"]
    },

    // Infracciones del Artículo 42 (MEDIA)
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "1",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "Mantener a los animales en condiciones inadecuadas desde el punto de vista higiénico-sanitario, desatendiendo su cuidado y atención, de acuerdo con las necesidades fisiológicas y etológicas por especie y raza, siempre que se les cause lesiones y enfermedades a los animales.",
      tags: ["Animales", "Higiene", "Sanidad", "Maltrato"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "2",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "No facilitarles la alimentación necesaria de acuerdo a sus necesidades ocasionando trastornos graves al animal.",
      tags: ["Animales", "Alimentación", "Salud", "Maltrato"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "3",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "No disponer de las autorizaciones, permisos y licencias en cada caso necesarias, para la titularidad y posesión de un animal.",
      tags: ["Animales", "Autorizaciones", "Permisos", "Licencias"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "4",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "No facilitar a los animales la asistencia veterinaria necesaria, cuando con ello se cause una enfermedad grave, lesión en el animal o sufrimiento innecesario.",
      tags: ["Animales", "Veterinaria", "Salud", "Sufrimiento"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "5",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "Vender animales enfermos.",
      tags: ["Animales", "Venta", "Enfermedad"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "6",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "Ceder, o donar animales enfermos, sin el consentimiento de quien los recibe.",
      tags: ["Animales", "Cesión", "Donación", "Enfermedad"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "7",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "El abandono de animales.",
      tags: ["Animales", "Abandono"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "8",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "Mantener permanentemente atados o encadenados a los animales.",
      tags: ["Animales", "Atados", "Encadenados", "Maltrato"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "9",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "No registrar e identificar reglamentariamente los animales que deban estarlo de acuerdo con la legislación aplicable.",
      tags: ["Animales", "Registro", "Identificación"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "10",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "La negación de asistencia sanitaria, por parte de los veterinarios en ejercicio, a animales enfermos o heridos, salvo en las excepciones contempladas en el Código para el ejercicio de la profesión veterinaria aprobado por el Consejo General de Colegios Veterinarios de España.",
      tags: ["Animales", "Veterinarios", "Asistencia Sanitaria"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "11",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "Realizar prácticas de experimentación animal y selección animal no autorizadas.",
      tags: ["Animales", "Experimentación", "Selección"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "12",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "No evitar la huida de animales que por sus características y carácter puedan causar daños a las personas, otros animales, vías, espacios públicos y medio natural.",
      tags: ["Animales", "Huida", "Seguridad Pública", "Medio Ambiente"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "13",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "Sujeción de animales a vehículos a motor en movimiento sin que existan daños, heridas o sufrimiento en el animal.",
      tags: ["Animales", "Transporte", "Vehículos"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "14",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "Utilizar animales en atracciones de feria.",
      tags: ["Animales", "Ferias", "Espectáculos"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "15",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "Incumplimiento de registro de los núcleos zoológicos.",
      tags: ["Animales", "Núcleos Zoológicos", "Registro"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "16",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "La manipulación artificial de los animales con objeto de hacerlos atractivos como diversión o juguete para su venta, si les causa un sufrimiento, daño o lesión.",
      tags: ["Animales", "Manipulación", "Venta", "Sufrimiento"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "17",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "La práctica de mutilaciones, salvo aquellas permitidas y realizadas por veterinarios en caso de necesidad médico-quirúrgica.",
      tags: ["Animales", "Mutilaciones", "Veterinaria"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "18",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "La cría, mantenimiento, venta y comercialización de animales sin cumplir los correspondientes requisitos y sin tener las autorizaciones y registros necesarios.",
      tags: ["Animales", "Cría", "Venta", "Autorizaciones", "Registro"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "19",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "Impedir la libre inspección de los animales y sus instalaciones a las autoridades competentes, así como no suministrar la información y documentos necesarios para realizar las funciones de control.",
      tags: ["Animales", "Inspección", "Autoridades"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "20",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "El transporte de animales con vulneración de los requisitos establecidos en la legislación vigente cuando, como consecuencia de dicha vulneración, se hayan producido lesiones en los animales o muerte evitable de los mismos.",
      tags: ["Animales", "Transporte", "Lesiones", "Muerte Evitable"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "21",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "Efectuar venta ambulante de animales fuera de mercados, ferias y cualquier otro certamen autorizado.",
      tags: ["Animales", "Venta Ambulante", "Mercados", "Ferias"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "22",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "Vender o hacer donación de animales a menores de dieciséis años y a personas con capacidad modificada judicialmente.",
      tags: ["Animales", "Venta", "Donación", "Menores"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "23",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "Anular o manipular los sistemas de identificación de los animales, sin prescripción ni control veterinario.",
      tags: ["Animales", "Identificación", "Manipulación"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "24",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "Suministrar sustancias a un animal que le causen alteraciones graves de la salud o del comportamiento, salvo en los casos amparados por la normativa vigente.",
      tags: ["Animales", "Sustancias", "Salud", "Comportamiento"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "25",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "Uso de animales salvajes y fauna silvestre en circos.",
      tags: ["Animales", "Fauna Silvestre", "Circos", "Espectáculos"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "26",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "Alimentar animales con alimento animal vivo sin estar autorizado para ello.",
      tags: ["Animales", "Alimentación", "Alimento Vivo"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "27",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "Hacer donación de los animales como reclamo publicitario, recompensa o regalo de compensación por otras adquisiciones de naturaleza distinta a la transacción onerosa de animales.",
      tags: ["Animales", "Donación", "Publicidad"]
    },
    {
      tipo: "media",
      circulo: "G",
      normagris_identificador: "Ley 7/2020, de 31 de agosto",
      normagris_tematica: "Bienestar, Protección y Defensa de los Animales de Castilla-La Mancha.",
      norma: "BPDA C-LM",
      articulo: "42",
      apartado: "28",
      importe: "De 3.001 a 9.000 euros",
      importe_reducido: "",
      descripcion: "Negativa a realizar las medidas provisionales previstas en el artículo 48 de esta ley.",
      tags: ["Animales", "Medidas Provisionales", "Autoridades"]
    },
    // Otras infracciones (LOPSC)
    {
      tipo: "leve",
      circulo: "L",
      normagris_identificador: "Ley Orgánica 4/2015, de 30 de marzo",
      normagris_tematica: "Protección De La Seguridad Ciudadana.",
      norma: "LOPSC",
      articulo: "37",
      apartado: "4",
      importe: "De 100 a 600 euros",
      importe_reducido: "",
      descripcion: "Las faltas de respeto a los agentes de la autoridad.",
      tags: ["Seguridad Ciudadana", "Orden Público", "Agentes de Autoridad"]
    }
  ];

  const searchInput = document.querySelector('.buscador');
  const filterNormagrisInput = document.querySelector('.filtro-normagris');
  const filterTagsInput = document.querySelector('.filtro-tags');
  const filterRangoSelect = document.querySelector('.filtro-rango');
  const filterAmbitoSelect = document.querySelector('.filtro-ambito');

  const datalistNormagrisOptions = document.getElementById('norma-gris-options');
  const datalistTagsOptions = document.getElementById('tags-options');

  const groupedInfraccionesContainer = document.querySelector('.infracciones-agrupadas');

  function createInfraccionElement(data) {
    const infraccionDiv = document.createElement('div');
    infraccionDiv.classList.add('infraccion', data.tipo);

    const importeReducidoHtml = data.importe_reducido ? `<span class="importe-reducido">${data.importe_reducido}</span>` : '';
    const puntosHtml = data.puntos ? `<span class="puntos">${data.puntos}</span>` : '';

    const tagsHtml = data.tags && data.tags.length > 0 ?
      `<div class="infraccion-tags">${data.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : '';

    infraccionDiv.innerHTML = `
      <div class="cinta">
        <div class="circulo">${data.circulo}</div>
        <div>
          <div class="norma">Norma: <strong>${data.norma}</strong> Art: <strong>${data.articulo}</strong> Aptdo: <strong>${data.apartado}</strong></div>
          <div class="importe-info">
            <span class="importe">${data.importe}</span>
            ${importeReducidoHtml}
            ${puntosHtml}
          </div>
        </div>
      </div>
      <div class="descripcion">${data.descripcion}</div>
      ${tagsHtml}
    `;
    return infraccionDiv;
  }

  function renderGroupedInfracciones(infraccionesToDisplay) {
    groupedInfraccionesContainer.innerHTML = '';

    const groupedData = infraccionesToDisplay.reduce((acc, infraccion) => {
      const normaGrisKey = `${infraccion.normagris_identificador.trim()} - ${infraccion.normagris_tematica.trim()}`;
      if (!acc[normaGrisKey]) {
        acc[normaGrisKey] = [];
      }
      acc[normaGrisKey].push(infraccion);
      return acc;
    }, {});

    const sortedNormaGrisKeys = Object.keys(groupedData).sort((keyA, keyB) => {
      const normaInfoA = normasDefiniciones[keyA] || {};
      const normaInfoB = normasDefiniciones[keyB] || {};

      const ambitoA = normaInfoA.ambito || '';
      const ambitoB = normaInfoB.ambito || '';
      const rangoA = normaInfoA.rango || '';
      const rangoB = normaInfoB.rango || '';

      const indexA_ambito = ambitoOrder.indexOf(ambitoA);
      const indexB_ambito = ambitoOrder.indexOf(ambitoB);

      if (indexA_ambito !== indexB_ambito) {
        return indexA_ambito - indexB_ambito;
      }

      const indexA_rango = rangoOrder.indexOf(rangoA);
      const indexB_rango = rangoOrder.indexOf(rangoB);

      return indexA_rango - indexB_rango;
    });

    sortedNormaGrisKeys.forEach(normaGrisKey => {
      const groupDiv = document.createElement('div');
      groupDiv.classList.add('infraccion-group');

      const groupHeader = document.createElement('div');
      groupHeader.classList.add('infraccion-group-header');

      const [identificador, tematica] = normaGrisKey.split(' - ');

      const normaInfo = normasDefiniciones[normaGrisKey] || {};
      const rangoHtml = normaInfo.rango ? `<span class="norma-propiedad rango-tag">${normaInfo.rango}</span>` : '';
      const ambitoHtml = normaInfo.ambito ? `<span class="norma-propiedad ambito-tag">${normaInfo.ambito}</span>` : '';

      groupHeader.innerHTML = `
        <div class="norma-main-info">
          <span class="icon">▶</span>
          <span class="normagris-identificador">${identificador}</span>
          <span class="normagris-tematica">${tematica}</span>
        </div>
        <div class="norma-properties">
          ${rangoHtml}
          ${ambitoHtml}
        </div>
      `;
      groupDiv.appendChild(groupHeader);

      const infractionsContent = document.createElement('div');
      infractionsContent.classList.add('infracciones-content');
      groupDiv.appendChild(infractionsContent);

      groupedData[normaGrisKey].sort((a, b) => {
  const artA = parseInt(a.articulo, 10);
  const artB = parseInt(b.articulo, 10);

  if (artA !== artB) {
    return artA - artB;
  }

  // ✅ SOLUCIÓN: convertimos a número antes de comparar
  const aptoNumA = parseInt(a.apartado, 10) || 0;
  const aptoNumB = parseInt(b.apartado, 10) || 0;
  return aptoNumA - aptoNumB;
      }).forEach(infraccionData => {
        const infraccionElement = createInfraccionElement(infraccionData);
        infractionsContent.appendChild(infraccionElement);
      });

      // --- CÓDIGO CORREGIDO Y MEJORADO ---
groupHeader.addEventListener('click', () => {
    // El contenedor del contenido es el siguiente elemento después del header
    const content = infractionsContent; 

    // Se alterna la clase 'open' para que el icono (▶) pueda rotar
    groupDiv.classList.toggle('open');

    // Comprobamos si el grupo AHORA está abierto
    if (groupDiv.classList.contains('open')) {
        // Si está abierto, establecemos su max-height a la altura real de su contenido.
        // 'scrollHeight' mide la altura total del contenido, incluso si está oculto.
        content.style.maxHeight = content.scrollHeight + 'px';
    } else {
        // Si se está cerrando, eliminamos el max-height para que la transición CSS
        // lo devuelva a 0.
        content.style.maxHeight = null; 
    }
});
      groupedInfraccionesContainer.appendChild(groupDiv);
    });
  }

  // Función para obtener y poblar el datalist de normagris
  function populateNormagrisDatalist() {
    const uniqueNormas = new Set();
    infraccionesData.forEach(data => {
      const fullNormaGris = `${data.normagris_identificador.trim()} - ${data.normagris_tematica.trim()}`;
      if (fullNormaGris) { // Solo si fullNormaGris no está vacío
        uniqueNormas.add(fullNormaGris);
      }
    });
    datalistNormagrisOptions.innerHTML = '';
    Array.from(uniqueNormas).sort().forEach(norma => {
      const option = document.createElement('option');
      option.value = norma;
      datalistNormagrisOptions.appendChild(option);
    });
  }

  // Función para obtener y poblar el datalist de tags
  function populateTagsDatalist() {
    const uniqueTags = new Set();
    infraccionesData.forEach(data => {
      if (data.tags && Array.isArray(data.tags)) {
        data.tags.forEach(tag => uniqueTags.add(tag.trim()));
      }
    });
    datalistTagsOptions.innerHTML = '';
    Array.from(uniqueTags).sort().forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      datalistTagsOptions.appendChild(option);
    });
  }

  // Función para poblar los selects de rango y ámbito
  function populateRangoAmbitoSelects() {
    const uniqueRangos = new Set();
    const uniqueAmbitos = new Set();

    Object.values(normasDefiniciones).forEach(def => {
      if (def.rango) uniqueRangos.add(def.rango.trim());
      if (def.ambito) uniqueAmbitos.add(def.ambito.trim());
    });

    // Rango
    filterRangoSelect.innerHTML = '<option value="">🏛️ Rango</option>';
    Array.from(uniqueRangos).sort((a, b) => {
        return rangoOrder.indexOf(a) - rangoOrder.indexOf(b);
    }).forEach(rango => {
        const option = document.createElement('option');
        option.value = rango;
        option.textContent = rango;
        filterRangoSelect.appendChild(option);
    });

    // Ámbito
    filterAmbitoSelect.innerHTML = '<option value="">🌍 Ámbito</option>';
    Array.from(uniqueAmbitos).sort((a, b) => {
        return ambitoOrder.indexOf(a) - ambitoOrder.indexOf(b);
    }).forEach(ambito => {
        const option = document.createElement('option');
        option.value = ambito;
        option.textContent = ambito;
        filterAmbitoSelect.appendChild(option);
    });
  }


  // Función de filtrado principal
  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedNormaGris = filterNormagrisInput.value.toLowerCase().trim();
    const selectedTag = filterTagsInput.value.toLowerCase().trim();
    const selectedRango = filterRangoSelect.value.toLowerCase().trim();
    const selectedAmbito = filterAmbitoSelect.value.toLowerCase().trim();

    const filteredInfracciones = infraccionesData.filter(infraccion => {
      const matchesSearch = !searchTerm ||
        infraccion.descripcion.toLowerCase().includes(searchTerm) ||
        infraccion.norma.toLowerCase().includes(searchTerm) ||
        infraccion.articulo.toLowerCase().includes(searchTerm) ||
        (infraccion.apartado && infraccion.apartado.toLowerCase().includes(searchTerm)) ||
        (infraccion.importe && infraccion.importe.toLowerCase().includes(searchTerm)) ||
        (infraccion.importe_reducido && infraccion.importe_reducido.toLowerCase().includes(searchTerm)) ||
        (infraccion.tags && infraccion.tags.some(tag => tag.toLowerCase().includes(searchTerm)));

      const fullNormaGris = `${infraccion.normagris_identificador.trim()} - ${infraccion.normagris_tematica.trim()}`.toLowerCase();
      const matchesNormaGris = !selectedNormaGris || fullNormaGris.includes(selectedNormaGris);

      const matchesTag = !selectedTag || (infraccion.tags && infraccion.tags.some(tag => tag.toLowerCase().includes(selectedTag)));

      const normaDef = normasDefiniciones[fullNormaGris.charAt(0).toUpperCase() + fullNormaGris.slice(1)] || {}; // Capitalizar para la búsqueda
      const matchesRango = !selectedRango || (normaDef.rango && normaDef.rango.toLowerCase() === selectedRango);
      const matchesAmbito = !selectedAmbito || (normaDef.ambito && normaDef.ambito.toLowerCase() === selectedAmbito);


      return matchesSearch && matchesNormaGris && matchesTag && matchesRango && matchesAmbito;
    });

    renderGroupedInfracciones(filteredInfracciones);
  }

  // Inicialización de filtros y renderizado
  populateNormagrisDatalist();
  populateTagsDatalist();
  populateRangoAmbitoSelects();
  applyFilters(); // Renderiza todas las infracciones al cargar la página

  // Event Listeners para los filtros
  searchInput.addEventListener('input', applyFilters);
  filterNormagrisInput.addEventListener('input', applyFilters);
  filterTagsInput.addEventListener('input', applyFilters);
  filterRangoSelect.addEventListener('change', applyFilters);
  filterAmbitoSelect.addEventListener('change', applyFilters);

  // Clear buttons functionality
  document.querySelectorAll('.clear-button').forEach(button => {
    button.addEventListener('click', (event) => {
      const targetFilter = event.target.dataset.filterTarget;
      const inputToClear = document.querySelector(`.${targetFilter}`);

      if (inputToClear) {
        inputToClear.value = '';
        applyFilters();
        // If it's a select, ensure the default option is selected visually
        if (inputToClear.tagName === 'SELECT') {
            inputToClear.selectedIndex = 0;
        }
      }
    });
  });

   // --- ✅ LÓGICA PARA OCULTAR/MOSTRAR HEADER AL HACER SCROLL ---
    
    const header = document.querySelector('header');
    const showSearchBtn = document.getElementById('showSearchBtn');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        // Oculta el header si se hace scroll hacia abajo
        if (lastScrollY < window.scrollY && window.scrollY > 150) {
            header.classList.add('hidden');
            if (showSearchBtn) showSearchBtn.classList.remove('hidden');
        } 
        // Muestra el header si se hace scroll hacia arriba
        else {
            header.classList.remove('hidden');
            if (showSearchBtn) showSearchBtn.classList.add('hidden');
        }

        // Actualiza la última posición de scroll
        lastScrollY = window.scrollY;
    });

    // Funcionalidad para el botón flotante
    if (showSearchBtn) {
        showSearchBtn.addEventListener('click', () => {
            // Sube al inicio de la página suavemente
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            // Al subir, el evento de scroll se encargará de mostrar el header
        });
    }

});