$(document).ready(function() {
	buscarTimes();
});

function buscarTimes() {
	$.when(
		$.ajax(dadosMercadoRodada()),
		$.ajax(dadosRequisicaoParciais()),
		$.ajax(dadosRequisicaoLiga(1)),
		$.ajax(dadosRequisicaoLiga(2))
	).then(function(mercado_rodada, parciais, ligaPagina1, ligaPagina2) {
		usufruirDadosColetados(mercado_rodada, parciais, ligaPagina1, ligaPagina2);
	});
}

function usufruirDadosColetados(mercado_rodada, parciais, ligaPagina1, ligaPagina2) {
	obterInformacoesRodadaMercado(mercado_rodada);
	exibirInformacoesRodadaMercado();
	obterTimesNaLiga(ligaPagina1, ligaPagina2);
	
	if(statusAtualMercado == 2) {
		obterParciaisJogadores(parciais);
	}

	coletarTimesDoSite();
	obterInformacoesDosTimes();
	ordenarPorPontuacaoGeral();
	exibirInformacoesDosTimes();
}

function obterInformacoesRodadaMercado(mercado_rodada) {
	statusAtualMercado = mercado_rodada[0].status_mercado;
    rodadaAtual = mercado_rodada[0].rodada_atual;
}

function obterParciaisJogadores(parciais) {
	jogadoresPontuadosSite = parciais[0].atletas;
}

function obterTimesNaLiga(pagina1, pagina2) {
	timesLiga = pagina1[0].times;
	
	for(var x in pagina2[0].times) {
		timesLiga.push(pagina2[0].times[x]);
	}
}

function coletarTimesDoSite() {
	for(var time in timesLiga) {
		dadosRequisicaoTime(timesLiga[time].slug);
    }
}

function obterInformacoesDosTimes() {
	var timeSite = null;
	
	for(var x in timesColetadosSite) {
		var timeMontado = null,
			pontuacaoTime = 0;
		
		timeSite = timesColetadosSite[x];
		pontuacaoTime = obterPontuacaoTime(timeSite);
		timeMontado = obterTimeMontado(timeSite, pontuacaoTime);
		timesTabela.push(timeMontado);
	}
}

function obterPontuacaoTime(time) {
	var pontuacaoTime = 0,
		qtdJogadoresPontuados = 0,
		pontuacaoJogador = 0,
		jogadores = time.atletas,
		retorno = {pontuacao: 0, quantidade: 0};

	for(var y in jogadores) {
		pontuacaoJogador = obterPontuacaoJogador(jogadores[y]);
		
		if(pontuacaoJogador != null && pontuacaoJogador != 0) {
			pontuacaoTime += pontuacaoJogador;
			qtdJogadoresPontuados += 1;
		} else if(statusAtualMercado != 1 && partidaIniciada(jogadores[y])) {
			pontuacaoTime += 0.00;
			qtdJogadoresPontuados += 1;
		}
	}
	
	retorno.pontuacao = pontuacaoTime;
	retorno.quantidade = qtdJogadoresPontuados;
	
	return retorno;
}

function obterPontuacaoJogador(jogador) {
	var pontuacao = null,
		jogadorPossuiPontuacao = jogadoresPontuadosSite[jogador.atleta_id] != null;
	
	if(jogadorPossuiPontuacao) {
		pontuacao = jogadoresPontuadosSite[jogador.atleta_id].pontuacao;
	}
	
	return pontuacao;
}

function partidaIniciada(jogador) {
	var iniciou = false,
		dataBruta = jogador.partida.partida_data,
		dataPartida = "",
		dataAgora = new Date();
	
	if(dataBruta == null || dataBruta == "") {
		iniciou = true;
	} else {
		dataPartida = new Date(dataBruta);
	
		if(dataPartida <= dataAgora) {
			iniciou = true;
		}
	}

	return iniciou;
}

function obterTimeMontado(time, pontuacao) {
	var timeMontado = {};
	
	timeMontado.id = time.time.slug;
	timeMontado.nome = time.time.nome;
	timeMontado.qtdPontuados = pontuacao.quantidade;
	timeMontado.pontuacaoParcial = pontuacao.pontuacao;
	timeMontado.pontuacaoAnterior = obterPontuacaoNoTurno(time);
	timeMontado.pontuacaoGeral = timeMontado.pontuacaoParcial + timeMontado.pontuacaoAnterior;
	
	return timeMontado;
}

function obterPontuacaoNoTurno(time) {
	var id = time.time.slug,
		pontos = 0;
	
	// In�cio de segundo turno
	if(rodadaAtual == 20) {
		pontos = 0;
	} else {
		for(var x in timesColetadosSite) {
			if(timesLiga[x].slug == id) {
				pontos = timesLiga[x].pontos.turno;
				pontos = parseFloat(pontos);
				break;
			}
		}
	}
	
	return pontos;
}

function acionarBotoesOrdenacao() {
	$("#ordenacaoParcial").click(function() {
		ordenarPorParciais();
		exibirInformacoesDosTimes();
	});
	
	$("#ordenacaoPontuacaoGeral").click(function() {
		ordenarPorPontuacaoGeral();
		exibirInformacoesDosTimes();
	});
}

function ordenarPorParciais() {
	timesTabela.sort(function(a, b) {
	    return b.pontuacaoParcial - a.pontuacaoParcial;
	});
}

function ordenarPorPontuacaoGeral() {
	timesTabela.sort(function(a, b) {
		return b.pontuacaoGeral - a.pontuacaoGeral;
	});
}

function exibirInformacoesRodadaMercado() {
	$(".team_rodada").html("(" + rodadaAtual + "a Rodada)");
	$("#mercado_status").html(statusMercado[statusAtualMercado]);
}

function exibirInformacoesDosTimes() {
	var index = 1;
	
	$("#tabela-pontos tbody").empty();
	
	for(var x in timesTabela) {
		var id_nome = timesTabela[x].id + "_nome",
			id_pontuacao_parcial = timesTabela[x].id + "_pontuacao_parcial",
			id_qtd_pontuados = timesTabela[x].id + "_pontuados",
			id_pontuacao_geral = timesTabela[x].id + "_pontuacao_geral",
			id_pontuacao_soma = timesTabela[x].id + "_pontuacao_soma",
			linha = (index % 2 != 0) ? "<tr>" : "<tr class='pure-table-odd'>";
		
		linha += "<td>" + index + "</td><td id=" + id_nome + "></td><td id=" + id_qtd_pontuados + "></td><td id=" + id_pontuacao_parcial + "></td><td id=" + id_pontuacao_geral + "></td><td id=" + id_pontuacao_soma + "></td></tr>";
		$("#tabela-pontos tbody").append(linha);
		
		var _team_nome = $("#"+id_nome),
			_team_pontuacao_parcial = $("#"+id_pontuacao_parcial),
			_team_qtd_pontuados = $("#"+id_qtd_pontuados),
		    _team_pontuacao_geral = $("#"+id_pontuacao_geral),
			_team_pontuacao_soma = $("#"+id_pontuacao_soma);
		
		_team_nome.html(timesTabela[x].nome);
	    _team_pontuacao_parcial.html(timesTabela[x].pontuacaoParcial.toFixed(2));
	    _team_qtd_pontuados.html(timesTabela[x].qtdPontuados);
	    _team_pontuacao_geral.html(timesTabela[x].pontuacaoAnterior.toFixed(2));
	    _team_pontuacao_soma.html(timesTabela[x].pontuacaoGeral.toFixed(2));
	    
	    index += 1;
	}
	
	acionarBotoesOrdenacao();
}

function dadosRequisicaoTime(slug) {
	$.ajax({
		type: "GET",
		contentType: "application/json",
		cache: false,
		url: "load-api-v2.php",
		timeout: 20000,
		async: false,
		data: {
    		api: "busca-atletas",
    		team_slug: slug
    	},
    	success: function(timeSite) {
    		timesColetadosSite.push(timeSite);      
	    },
    	error: function(jqXHR, textStatus, errorThrown) {
    		exibirMensagemErro();
    		return false;
    	}
	});
}

function dadosRequisicaoParciais() {
	return {
	    type: "GET",
	    contentType: "application/json",
	    dataType: "json",
	    cache: false,
	    url: "load-api-v2.php?api=parciais-atletas",
	timeout: 20000,
    	error: function(jqXHR, textStatus, errorThrown) {
    		exibirMensagemErro();
    		return false;
    	}
	}
}

function dadosRequisicaoLiga(pagina) { 
	return {
    	type: "GET",
	    contentType: "application/json",
	    cache: false,
	    url: "load-api-auth-v2.php",
	    data: {
			api: "liga",
			page: pagina,
			liga_slug: "ases-fortaleza-ceara"
	    },
	    timeout: 20000,
	    error: function (jqXHR, textStatus, errorThrown) {
	    	exibirMensagemErro();
	    	return false;
	    }
    }
}

function dadosMercadoRodada() {
	return {
	    type: "GET",
	    contentType: "application/json",
	    dataType: "json",
	    cache: false,
	    url: "load-api-v2.php?api=mercado-status",
	    timeout: 20000,
		error: function(jqXHR, textStatus, errorThrown) {
			exibirMensagemErro();
			return false;
		}
	};
}

function exibirMensagemErro() {
	if(!existeFalha) {
		existeFalha = true;
		alert("Globo.com - Desculpe-nos, nossos servidores est\xE3o sobrecarregados.");
	}
}

var rodadaAtual = 0,
	statusAtualMercado = 0,
	jogadoresPontuadosSite = {},
	timesColetadosSite = [],
	timesLiga = [],
	timesTabela = [],
	existeFalha = false,
	statusMercado = {
		1:'Mercado aberto!',
	  	2:'Mercado fechado!',
	  	3:'Mercado em atualiza��o!',
	  	4:'Mercado em manuten��o!'
	};
	
