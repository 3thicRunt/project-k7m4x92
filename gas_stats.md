function doGet() {
  const equipamentos = [
    { nome: "UHPLC UltiMate™ 3000", id: "1d649621a4e00f2963a3383c5b5d0b25c105a64b34d3896cf4a97a3f7ff47089@group.calendar.google.com", link: "uhplc.html", imagem:"uhplc.png" },
    { nome: "Autoclave WiseClave WAC-60", id: "04673bb96d969a19d16f73ce98389d8f88e5815b12137371a84c554d7232514d@group.calendar.google.com", link: "wac60.html", imagem:"wac60.png" },
    { nome: "DGPS Trimble R12i", id: "64cd135f0f9131a5ff45c07fe7792fd06fcd1df7e8792ba506e395aef398e299@group.calendar.google.com", link: "tr12i.html", imagem:"tr12i.png" },
    { nome: "DGPS Trimble R8s", id: "05ac2388968d9f64f3df84ca5f5fecd912e97430d01fc6cd52adbddc9efb36a8@group.calendar.google.com", link: "tr8s.html", imagem:"tr8s.png" },
    { nome: "FTIR Nicolet Summit", id: "255a897c6ca087b2a92cc168afbb8eca6fc43339d243ba40d5e6115e06209e3d@group.calendar.google.com", link: "summit.html", imagem:"summit.png" },
    { nome: "GPS Trimble R6", id: "23ae033a0a392e276dd49452af62b4b2e8edeb839840b831c41b8ba20ca5aa2b@group.calendar.google.com", link: "tr6.html", imagem:"tr6.png" },
    { nome: "Leitor de Placas Berthold Tristar 5", id: "22126bc2db83376b1535536454eb5bf34e2d85f83000eb0b66646ca5964ef61e@group.calendar.google.com", link: "tristar5.html", imagem:"tristar5.png" },
    { nome: "Mufla Thermolyne F6020C-33", id: "7ba89b0e4347fcaba3b92e63aff4752c35fa974d7c3af5782e637286060ff0e5@group.calendar.google.com", link: "f6020c.html", imagem:"f6020c.png" },
    { nome: "Respirometro ECHO ER", id: "2e35f79eee4f3c31345eb108268415496bb534a08d1d312c541a2f8812edd85f@group.calendar.google.com", link: "echoer.html", imagem:"echo.png" },
    { nome: "Sonda Multiparamétrica YSI EXO2", id: "5575d468eb452d311c6b2013aba907e630307eb5fbddae7d3681908fcc4ccbf4@group.calendar.google.com", link: "exo2.html", imagem:"exo2.png" },
    { nome: "Sonda Multiparamétrica HANNA HI98594", id: "569dcc568b79ed3d8e31191848d110019823417c608c1e552a6dda7af042b30e@group.calendar.google.com", link: "hi98594.html", imagem:"hi98594.png" },
    { nome: "Analizador de Nutrientes SEAL AQ400", id: "cbb95693b76c034f66bbdbfc8f1f1e187bdfdee85b5081b4d0327af0752d36ac@group.calendar.google.com", link: "SEAL_AQ400.html", imagem:"aq400.png" },
    { nome: "Analizador Elemental FlashSmart", id: "dc4a0bad8686605f896585e3fec31f85726ba547fb3647edacf7cf29979ca614@group.calendar.google.com", link: "flashsmart.html", imagem:"flashsmart.png" },
    { nome: "Analizador Granulométrico Malvern Mastersizer 3000", id: "12d3ae21fe9badfd832af247319a625af1f7f0cf3924de9440efbaf6d6ca9c12@group.calendar.google.com", link: "malvern.html", imagem:"malvern.png" },
    { nome: "Balança de Precisão VWR LAG 314i", id: "49423f5335ca08d7b40985acc04a3c9c5c23c11dadf47ada160afcff16dd12fc@group.calendar.google.com", link: "bvwr.html", imagem:"lag314i.png" },
    { nome: "Centrífuga Gyrozen GZ-2236 R", id: "534b2e994f4e2b544a477e95f9a1a30049603f58137b2f706d4444af6fcfeda7@group.calendar.google.com", link: "gyrozen.html", imagem:"gyrozen.png" },
    { nome: "Estufa Ventilada Labbox OVF", id: "aa740a29d7c3252b8c00dea58a8652efa071a4378a12cbea6ea84a8784222837@group.calendar.google.com", link: "ovf.html", imagem:"ovf.png" },
    { nome: "Microscópio de Fluorescência VisiScope IT600FLD", id: "1b1f905977132a85cdf5660facdf0521bcc6d2771b9478957870263ba108e2d3@group.calendar.google.com", link: "visiscope.html", imagem:"visiscope.png" },
    { nome: "Real-Time PCR Bio-Rad CFX Opus 96 Dx", id: "1ef496ce38f24b9ced706e6dffd40561de6b2d1deec9378bc30ca038b513c6d9@group.calendar.google.com", link: "cfxopus.html", imagem:"cfxopus.png" },
    { nome: "Scan de Géis Bio-Rad ChemiDoc", id: "465ff41897644cef3623267da9160e2033ce2d5f0b3b5f626c187280b9366fed@group.calendar.google.com", link: "chemidoc.html", imagem:"chemidoc.png" },
    { nome: "Sonda Multiparamétrica Hach HQ2100", id: "4cca58c61c93561adebdf8cba4a044b02df5e1c255511b8f6c282443674fe286@group.calendar.google.com", link: "hq2100.html", imagem:"hq2100.png" },
    { nome: "Sonda Oxigénio Dissolvido VWR pHenomenal OX 4110 H", id: "659380024eaf9323d6a269fd72ee270e903149aa7c0dcad0d396f0bb12f47272@group.calendar.google.com", link: "ox4110h.html", imagem:"ox4110h.png" },
    { nome: "Transdutor de Pressão JFE Infinity AWH-USB", id: "6e6f2cfdbcb22380474fd5deec18380baa74a1c9a4782fdeb4190998744e7d9a@group.calendar.google.com", link: "infinitywh.html", imagem:"infinitywh.png" },
    
    // adiciona aqui os restantes equipamentos
  ];

  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth() - 3, 1); // últimos 3 meses

  const resultados = equipamentos.map(function(equip) {
    let numReservas = 0;
    let horasTotais = 0;

    try {
      const calendario = CalendarApp.getCalendarById(equip.id);
      const eventos = calendario.getEvents(inicioMes, agora);
      numReservas = eventos.length;

      eventos.forEach(function(evento) {
        const inicio = evento.getStartTime();
        const fim = evento.getEndTime();
        const duracaoMs = fim - inicio;
        const duracaoHoras = duracaoMs / (1000 * 60 * 60); // ms → horas
        horasTotais += duracaoHoras;
      });

    } catch (e) {
      numReservas = 0;
      horasTotais = 0;
    }

    return {
      nome: equip.nome,
      link: equip.link,
      imagem: equip.imagem,
      reservas: numReservas,
      horas: Math.round(horasTotais * 10) / 10, // arredondar a 1 casa decimal
      dias: Math.max(1, Math.ceil(horasTotais / 24))
    };
  });

  // agora ordena por HORAS de utilização, não por número de reservas
  resultados.sort(function(a, b) {
    return b.horas - a.horas;
  });

  const output = {
    atualizado: agora.toISOString(),
    equipamentos: resultados,
    totalEquipamentos: equipamentos.length
  };

  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}