export interface ProfessionOption {
  id: string;
  label: string;
  group: string;
  emoji: string;
}

export const PROFESSIONS: ProfessionOption[] = [
  { id: "criador", label: "Criador de conteúdo", group: "Geral", emoji: "🎬" },
  { id: "empreendedor", label: "Empreendedor(a)", group: "Negócios", emoji: "💼" },
  { id: "marca", label: "Marca / negócio local", group: "Negócios", emoji: "🏪" },
  { id: "educador", label: "Educador(a)", group: "Educação", emoji: "📚" },
  { id: "coach", label: "Mentor(a)", group: "Educação", emoji: "🎯" },
  { id: "advogado", label: "Advogado(a)", group: "Regulado", emoji: "⚖️" },
  { id: "medico", label: "Médico(a)", group: "Regulado", emoji: "🩺" },
  { id: "dentista", label: "Dentista", group: "Regulado", emoji: "🦷" },
  { id: "psicologo", label: "Psicólogo(a)", group: "Regulado", emoji: "🧠" },
  { id: "contador", label: "Contador(a)", group: "Regulado", emoji: "📊" },
  { id: "corretor", label: "Corretor(a)", group: "Regulado", emoji: "🏠" },
];

export function getProfession(id: string) {
  return PROFESSIONS.find((item) => item.id === id) ?? PROFESSIONS[0];
}
