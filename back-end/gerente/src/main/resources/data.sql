INSERT INTO ms_gerente.gerente (cpf, nome, email, tipo) VALUES
('98574307084', 'Geniéve',     'ger1@bantads.com.br', 'GERENTE'),
('64065268052', 'Godophredo',   'ger2@bantads.com.br', 'GERENTE'),
('23862179060', 'Gyândula',     'ger3@bantads.com.br', 'GERENTE'),
('40501740066', 'Adamântio',    'adm1@bantads.com.br', 'ADMINISTRADOR')
ON CONFLICT (cpf) DO NOTHING;
