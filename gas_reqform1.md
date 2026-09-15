function doPost(e) {
  try {
    const dados = JSON.parse(e.postData.contents);

    const emailIntroduzido = String(dados.emailRequisitante || "").trim();
    const emailRequisitante = emailIntroduzido.includes("@")
    ? emailIntroduzido
    : `${emailIntroduzido}@ualg.pt`;

    const periodos = Array.isArray(dados.periodos) && dados.periodos.length
      ? dados.periodos
      : [{ dataInicio: dados.dataInicio, dataFim: dados.dataFim }];

    const periodosTexto = periodos
      .map((periodo, indice) => `Período ${indice + 1}: ${formatarDataHoraTexto(periodo.dataInicio)} a ${formatarDataHoraTexto(periodo.dataFim)}`)
      .join("\n");
    const periodosConfirmacaoPt = periodos
      .map((periodo) => `${formatarDataHoraTexto(periodo.dataInicio)} a ${formatarDataHoraTexto(periodo.dataFim)}`)
      .join("; ");
    const periodosConfirmacaoEn = periodos
      .map((periodo) => `${formatarDataHoraTexto(periodo.dataInicio)} to ${formatarDataHoraTexto(periodo.dataFim)}`)
      .join("; ");

    const destinatario = "roborges@ualg.pt"; // <-- substitui pelo teu email

    const assunto = `Nova Requisição: ${dados.equipamentoTexto}`;

    const corpo = `
Nova requisição de equipamento recebida:

Equipamento: ${dados.equipamentoTexto}
Períodos:
${periodosTexto}

Requisitante: ${dados.requisitante}
Email do Requisitante: ${emailRequisitante}
Responsável: ${dados.responsavel || "(não indicado)"}

Enquadramento da utilização:
${dados.enquadramento}

Observações:
${dados.observacoes || "(nenhuma)"}
    `.trim();

    MailApp.sendEmail(destinatario, assunto, corpo);

    const assuntoConfirmacao = "EquipmentHUB - Confirmação de Requisição / Request Confirmation";
    const corpoConfirmacao = `
Estimado(a) ${dados.requisitante},

Confirmamos que recebemos o seu pedido para:
Equipamento: ${dados.equipamentoTexto}
Para o(s) período(s): ${periodosConfirmacaoPt}

Assim que a requisição for aceite e registada pelos técnicos receberá um email de confirmação.

Com os melhores cumprimentos,
CIMA EquipmentHUB.

__________________________________________________________________________________

Dear ${dados.requisitante},

We have received your request for:
Equipment: ${dados.equipamentoTexto}
For the period(s): ${periodosConfirmacaoEn}

As soon as the request is accepted and registered by the technicians, you will receive a confirmation email.

Best regards,
CIMA EquipmentHUB.
    `.trim();

    MailApp.sendEmail(emailRequisitante, assuntoConfirmacao, corpoConfirmacao);

    return ContentService
      .createTextOutput(JSON.stringify({ sucesso: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (erro) {
    return ContentService
      .createTextOutput(JSON.stringify({ sucesso: false, erro: erro.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function formatarDataHoraTexto(valor) {
  const correspondencia = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!correspondencia) return String(valor);
  const [, ano, mes, dia, hora, minuto] = correspondencia;
  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}