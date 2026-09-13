// Agendamento direto de equipamentos. Publicar este projeto como Web App.
// Definir o fuso horário do projeto como Europe/Lisbon nas definições do Apps Script.
const CALENDARIOS = {
  wac60: "04673bb96d969a19d16f73ce98389d8f88e5815b12137371a84c554d7232514d@group.calendar.google.com",
  gyrozen: "534b2e994f4e2b544a477e95f9a1a30049603f58137b2f706d4444af6fcfeda7@group.calendar.google.com",
  f6020c: "7ba89b0e4347fcaba3b92e63aff4752c35fa974d7c3af5782e637286060ff0e5@group.calendar.google.com",
  bvwr: "49423f5335ca08d7b40985acc04a3c9c5c23c11dadf47ada160afcff16dd12fc@group.calendar.google.com",
  ovf: "aa740a29d7c3252b8c00dea58a8652efa071a4378a12cbea6ea84a8784222837@group.calendar.google.com",
  cfxopus: "1ef496ce38f24b9ced706e6dffd40561de6b2d1deec9378bc30ca038b513c6d9@group.calendar.google.com",
  chemidoc: "465ff41897644cef3623267da9160e2033ce2d5f0b3b5f626c187280b9366fed@group.calendar.google.com"

};

const DESTINATARIOS_TECNICOS = "roborges@ualg.pt";
const FUSO_HORARIO = "Europe/Lisbon";

function doGet(e) {
  const dados = e && e.parameter ? e.parameter : {};
  const resultado = processarAgendamento(dados);
  const callback = String(dados.callback || "");

  if (/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService
      .createTextOutput(`${callback}(${JSON.stringify(resultado)});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return resposta(resultado);
}

function doPost(e) {
  const dados = JSON.parse(e.postData.contents);
  return resposta(processarAgendamento(dados));
}

function processarAgendamento(dados) {
  try {
    const calendarId = CALENDARIOS[dados.equipamento];

    if (!calendarId || calendarId.startsWith("SUBSTITUIR_")) {
      throw new Error("O calendário deste equipamento ainda não está configurado.");
    }

    const inicio = converterDataHora(dados.dataInicio);
    const fim = converterDataHora(dados.dataFim);
    if (fim <= inicio) {
      throw new Error("A data e hora de fim devem ser posteriores às de início.");
    }

    const calendario = CalendarApp.getCalendarById(calendarId);
    if (!calendario) {
      throw new Error("Não foi possível aceder ao calendário do equipamento.");
    }

    const conflitos = calendario.getEvents(inicio, fim).filter(function(evento) {
      return evento.getStartTime() < fim && evento.getEndTime() > inicio;
    });
    if (conflitos.length) {
      return { sucesso: false, erro: "O período selecionado já não está disponível." };
    }

    const emailRequisitante = normalizarEmail(dados.emailRequisitante);
    const inicioFormatado = formatarDataHora(inicio);
    const fimFormatado = formatarDataHora(fim);
    const tituloEvento = `EquipmentHUB: ${dados.equipamentoTexto} — ${dados.requisitante}`;
    const descricaoEvento = [
      `Equipamento: ${dados.equipamentoTexto}`,
      `Utilizador: ${dados.requisitante}`,
      `Email: ${emailRequisitante}`,
      `Período: ${inicioFormatado} a ${fimFormatado}`
    ].join("\n");

    calendario.createEvent(tituloEvento, inicio, fim, { description: descricaoEvento });

    const assunto = "EquipmentHUB - Confirmação de Agendamento / Booking Confirmation";
    const corpoConfirmacao = `
Estimado(a) ${dados.requisitante},

Confirmamos o agendamento para:
Equipamento: ${dados.equipamentoTexto}
Período: ${inicioFormatado} a ${fimFormatado}

Com os melhores cumprimentos,
CIMA EquipmentHUB.

__________________________________________________________________________________

Dear ${dados.requisitante},

Your booking has been confirmed:
Equipment: ${dados.equipamentoTexto}
Period: ${inicioFormatado} to ${fimFormatado}

Best regards,
CIMA EquipmentHUB.
    `.trim();
    MailApp.sendEmail(emailRequisitante, assunto, corpoConfirmacao);

    const corpoTecnicos = `
Novo agendamento criado:

Equipamento: ${dados.equipamentoTexto}
Utilizador: ${dados.requisitante}
Email: ${emailRequisitante}
Período: ${inicioFormatado} a ${fimFormatado}
    `.trim();
    MailApp.sendEmail(DESTINATARIOS_TECNICOS, `Novo agendamento: ${dados.equipamentoTexto}`, corpoTecnicos);

    return { sucesso: true };
  } catch (erro) {
    return { sucesso: false, erro: erro.toString() };
  }
}

function converterDataHora(valor) {
  const correspondencia = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!correspondencia) throw new Error("Data ou hora inválida.");

  const partes = correspondencia.slice(1).map(Number);
  const data = new Date(partes[0], partes[1] - 1, partes[2], partes[3], partes[4]);
  if (
    Number.isNaN(data.getTime()) ||
    data.getFullYear() !== partes[0] ||
    data.getMonth() !== partes[1] - 1 ||
    data.getDate() !== partes[2] ||
    data.getHours() !== partes[3] ||
    data.getMinutes() !== partes[4]
  ) {
    throw new Error("Data ou hora inválida.");
  }
  return data;
}

function normalizarEmail(email) {
  const valor = String(email || "").trim();
  return valor.endsWith("@ualg.pt") ? valor : `${valor}@ualg.pt`;
}

function formatarDataHora(data) {
  return Utilities.formatDate(data, FUSO_HORARIO, "dd/MM/yyyy HH:mm");
}

function resposta(conteudo) {
  return ContentService
    .createTextOutput(JSON.stringify(conteudo))
    .setMimeType(ContentService.MimeType.JSON);
}
