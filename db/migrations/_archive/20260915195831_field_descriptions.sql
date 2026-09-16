-- Short help under each seed field. Skip rows that already have copy.

UPDATE plugin_directory.fields AS f
SET description = v.description::jsonb
FROM (
  VALUES
    ('full_name', '[{"locale":"pt-BR","value":"Como você aparece na comunidade."},{"locale":"en","value":"How you appear in the community."}]'),
    ('avatar_url', '[{"locale":"pt-BR","value":"Uma foto nítida, de preferência só você."},{"locale":"en","value":"A clear photo, preferably just you."}]'),
    ('gender', '[{"locale":"pt-BR","value":"Como você se identifica."},{"locale":"en","value":"How you identify."}]'),
    ('birth_city', '[{"locale":"pt-BR","value":"Onde você nasceu."},{"locale":"en","value":"Where you were born."}]'),
    ('current_city', '[{"locale":"pt-BR","value":"Onde você mora agora."},{"locale":"en","value":"Where you live now."}]'),
    ('languages', '[{"locale":"pt-BR","value":"Os idiomas que você usa."},{"locale":"en","value":"Languages you use."}]'),
    ('linkedin', '[{"locale":"pt-BR","value":"Cole o endereço do seu perfil."},{"locale":"en","value":"Paste the URL of your profile."}]'),
    ('github', '[{"locale":"pt-BR","value":"Cole o endereço do seu perfil."},{"locale":"en","value":"Paste the URL of your profile."}]'),
    ('portfolio', '[{"locale":"pt-BR","value":"Site ou página com o seu trabalho."},{"locale":"en","value":"A site or page with your work."}]'),
    ('headline', '[{"locale":"pt-BR","value":"Uma linha sobre o que você faz."},{"locale":"en","value":"One line about what you do."}]'),
    ('bio', '[{"locale":"pt-BR","value":"Um texto curto para a comunidade."},{"locale":"en","value":"A short note for the community."}]'),
    ('availability_status', '[{"locale":"pt-BR","value":"Como as pessoas podem te procurar."},{"locale":"en","value":"How people can reach out."}]'),
    ('public_showcase', '[{"locale":"pt-BR","value":"Se o seu cartão entra na vitrine pública."},{"locale":"en","value":"Whether your card appears on the public showcase."}]'),
    ('host_at_home', '[{"locale":"pt-BR","value":"Se você topa receber visitas da comunidade."},{"locale":"en","value":"Whether you would host people from the community."}]')
) AS v(name, description)
WHERE f.name = v.name
  AND NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(coalesce(f.description, '[]'::jsonb)) AS el
    WHERE btrim(coalesce(el->>'value', '')) <> ''
  );
