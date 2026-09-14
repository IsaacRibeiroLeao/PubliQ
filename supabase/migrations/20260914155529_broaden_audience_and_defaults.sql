alter table public.profiles
  alter column profession set default 'criador';

insert into public.compliance_rules (profession, code, title, instruction) values
  ('criador', 'GERAL-1', 'Sem promessa milagrosa', 'Não garanta resultado, renda, emagrecimento ou transformação em prazo fixo. Fale em processo, consistência e contexto.'),
  ('criador', 'GERAL-2', 'Transparência', 'Deixe claro o que é opinião, o que é experiência pessoal e o que é conteúdo educativo. Evite clickbait enganoso.'),
  ('empreendedor', 'NEG-1', 'Oferta responsável', 'Não use escassez falsa, garantia irrestrita ou comparação desleal. O CTA deve convidar, não pressionar.'),
  ('empreendedor', 'NEG-2', 'Prova com honestidade', 'Números e depoimentos só quando forem reais e contextualizados. Sem “método secreto”.'),
  ('educador', 'EDU-1', 'Didática antes do hype', 'Explique o conceito com clareza. Não finja diploma, certificação ou autoridade que você não tem.'),
  ('marca', 'MARCA-1', 'Tom institucional sóbrio', 'Fale do produto com precisão. Evite superlativos vazios e reclame de concorrente.'),
  ('coach', 'COACH-1', 'Sem diagnóstico de audiência', 'Não prometa virada de vida. Convide à reflexão e deixe o próximo passo opcional.')
on conflict (profession, code) do nothing;
