Uso pessoal
	- [X] Adicionar campos nas transactions:
		- [X] forma (débito, boleto, pix, crédito)
		- [X] destino
		- [X] id: slug do user_id, data, descricao, valor
		- [X] tags
		- [X] front-end

	- [X] Listagem de transactions
		- [X] filtro por data, tag, forma, destino, tags, etc.
		- [X] ordenação por data, valor, tag, etc.
		- [X] front-end

	- [X] search case insensitive
	
	- [X] make each field of the transactions table editable

	- [ ] add field: income/outcome

	- [ ] UI
		- [ ] lib de componentes
		- [ ] lib de icons
		- telas: listagem, home (resumo).

	- [ ] Testar com extrato pessoa física

	- [ ] possibilitar excluir transactions (sozinha ou várias de uma vez)

	- [ ] filter by date (range)

	Gráfico de pizza com % de gasto por tag (Real)

	Gráfico de pizza com % de gasto por tag (Meta)

	Meta de gastos por tag (planejamento)

	Barra de progressão em % de gasto / planejado

	Gráfico de linha com receitas por mês

MVP
	definir tags padrão: alimentação, transporte, saúde, lazer, educação, moradia, outros
	cadastro, login, recuperar senha, etc.
	sem login: tela de trial

V2 (consultar anotacões físicas):
	Extrato do cartão
	- forma = crédito (adicionar)
	- transactions where forma = crédito

	Caixinhas:
		- descr, valor meta, valor atual, valor depositado, prazo
		- retorno, % atingida, aporte mensal necessário
		- % tempo corrido vs % % atingida
	Investimentos