UPDATE plugin_directory.fields
SET options = '[
  {"value":"pt","label":[{"locale":"pt-BR","value":"Português"},{"locale":"en","value":"Portuguese"}]},
  {"value":"en","label":[{"locale":"pt-BR","value":"Inglês"},{"locale":"en","value":"English"}]},
  {"value":"es","label":[{"locale":"pt-BR","value":"Espanhol"},{"locale":"en","value":"Spanish"}]},
  {"value":"fr","label":[{"locale":"pt-BR","value":"Francês"},{"locale":"en","value":"French"}]},
  {"value":"de","label":[{"locale":"pt-BR","value":"Alemão"},{"locale":"en","value":"German"}]},
  {"value":"it","label":[{"locale":"pt-BR","value":"Italiano"},{"locale":"en","value":"Italian"}]},
  {"value":"nl","label":[{"locale":"pt-BR","value":"Holandês"},{"locale":"en","value":"Dutch"}]},
  {"value":"zh","label":[{"locale":"pt-BR","value":"Chinês"},{"locale":"en","value":"Chinese"}]},
  {"value":"ja","label":[{"locale":"pt-BR","value":"Japonês"},{"locale":"en","value":"Japanese"}]},
  {"value":"ko","label":[{"locale":"pt-BR","value":"Coreano"},{"locale":"en","value":"Korean"}]},
  {"value":"ru","label":[{"locale":"pt-BR","value":"Russo"},{"locale":"en","value":"Russian"}]},
  {"value":"ar","label":[{"locale":"pt-BR","value":"Árabe"},{"locale":"en","value":"Arabic"}]}
]'::jsonb
WHERE name = 'languages';
