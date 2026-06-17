INSERT INTO ms_gerente.gerente (cpf, nome, email, tipo, telefone) VALUES
('98574307084', 'Geniéve',    'ger1@bantads.com.br', 'GERENTE', '(41) 91234-5678'),
('64065268052', 'Godophredo', 'ger2@bantads.com.br', 'GERENTE', '(11) 92345-6789'),
('23862179060', 'Gyândula',   'ger3@bantads.com.br', 'GERENTE', '(21) 93456-7890')
ON CONFLICT (cpf) DO NOTHING;
