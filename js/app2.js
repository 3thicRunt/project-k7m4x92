// Depois de publicar o gas2.md como Web App, substitui este valor pelo URL terminado em /exec.
const APPS_SCRIPT_AGENDAMENTO_URL = "https://script.google.com/macros/s/AKfycbypMC8D4bbmuMHC-xJ-aQZopEui5QqZwBNqpWgV939ccJaxZ9LuCpNOSv_O7j76IEQS/exec";

const equipamentosAgendamento = {
    wac60: { pt: "Autoclave MaXterile 60", en: "MaXterile 60 Autoclave" },
    bvwr: { pt: "Balança analítica VWR LAG 314i", en: "VWR LAG 314i analytical balance" },
    gyrozen: { pt: "Centrífuga Gyrozen GZ-2236 R", en: "Gyrozen GZ-2236 R centrifuge" },
    ovf: { pt: "Estufa de circulação forçada Labbox OVF", en: "Labbox OVF forced-air oven" },
    f6020c: { pt: "Mufla Thermolyne F6020C-33", en: "Thermolyne F6020C-33 muffle furnace" },
    cfxopus: { pt: "Real-Time PCR Bio-Rad CFX Opus", en: "Bio-Rad CFX Opus Real-Time PCR" },
    chemidoc: { pt: "Scan de Géis Bio-Rad ChemiDoc", en: "Bio-Rad ChemiDoc Gel Imaging System" }
};

const formAgendamento = document.getElementById("form-agendamento");

function enviarAgendamentoPorJsonp(dados) {
    return new Promise(function (resolve, reject) {
        const callback = `equipmentHubBooking_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const parametros = new URLSearchParams({ ...dados, callback });
        const script = document.createElement("script");
        const temporizador = window.setTimeout(function () {
            limpar();
            reject(new Error("O serviço de agendamento não respondeu."));
        }, 30000);

        function limpar() {
            window.clearTimeout(temporizador);
            delete window[callback];
            script.remove();
        }

        window[callback] = function (resultado) {
            limpar();
            resolve(resultado);
        };

        script.onerror = function () {
            limpar();
            reject(new Error("Não foi possível contactar o serviço de agendamento."));
        };
        script.src = `${APPS_SCRIPT_AGENDAMENTO_URL}?${parametros.toString()}`;
        document.head.appendChild(script);
    });
}

if (formAgendamento) {
    const emIngles = document.documentElement.lang === "en";
    const textos = emIngles
        ? {
            unknownEquipment: "The selected equipment is not available for direct scheduling.",
            invalidPeriod: "The end date and time must be after the start date and time.",
            configurationError: "Scheduling is not yet configured. Please contact the technicians.",
            submitting: "Creating booking...",
            success: "Booking created successfully. You will receive a confirmation email shortly.",
            error: "The booking could not be created. The selected period may no longer be available; please check the calendar and try again."
        }
        : {
            unknownEquipment: "O equipamento selecionado não está disponível para agendamento direto.",
            invalidPeriod: "A data e hora de fim devem ser posteriores à data e hora de início.",
            configurationError: "O agendamento ainda não está configurado. Contacte os técnicos.",
            submitting: "A criar agendamento...",
            success: "Agendamento criado com sucesso. Receberá um email de confirmação em breve.",
            error: "Não foi possível criar o agendamento. O período selecionado pode já não estar disponível; verifique o calendário e tente novamente."
        };
    const params = new URLSearchParams(window.location.search);
    const equipamentoId = params.get("equipamento");
    const equipamento = equipamentosAgendamento[equipamentoId];
    const equipamentoSelect = document.getElementById("equipamento");

// Preenche o <select> dinamicamente a partir de equipamentosAgendamento
Object.keys(equipamentosAgendamento).forEach(function (chave) {
    const opcao = document.createElement("option");
    opcao.value = chave;
    opcao.textContent = equipamentosAgendamento[chave][emIngles ? "en" : "pt"];
    equipamentoSelect.appendChild(opcao);
});

// Se veio um ?equipamento= válido na URL, pré-seleciona-o
if (equipamento) {
    equipamentoSelect.value = equipamentoId;
}

function atualizarLinkIdioma() {
    const langSwitch = document.querySelector(".lang-switch");
    const base = langSwitch.href.split("?")[0];
    langSwitch.href = equipamentoSelect.value
        ? `${base}?equipamento=${encodeURIComponent(equipamentoSelect.value)}`
        : base;
}

atualizarLinkIdioma();
equipamentoSelect.addEventListener("change", atualizarLinkIdioma);

    atualizarLimites();
    inicio.addEventListener("change", atualizarLimites);
    fim.addEventListener("change", atualizarLimites);

    formAgendamento.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const chaveEquipamento = equipamentoSelect.value;
    const equipamentoEscolhido = equipamentosAgendamento[chaveEquipamento];

    if (!equipamentoEscolhido) {
        statusEl.textContent = textos.unknownEquipment;
        statusEl.className = "form-status error";
        return;
    }

    if (fim.value <= inicio.value) {
        statusEl.textContent = textos.invalidPeriod;
        statusEl.className = "form-status error";
        return;
    }

    if (APPS_SCRIPT_AGENDAMENTO_URL.includes("COLE_AQUI")) {
        statusEl.textContent = textos.configurationError;
        statusEl.className = "form-status error";
        return;
    }

    submitBtn.disabled = true;
    statusEl.textContent = textos.submitting;
    statusEl.className = "form-status";

    const dados = {
        equipamento: chaveEquipamento,
        equipamentoTexto: equipamentoEscolhido[emIngles ? "en" : "pt"],
        requisitante: document.getElementById("requisitante").value.trim(),
        emailRequisitante: `${document.getElementById("email-requisitante").value.trim()}@ualg.pt`,
        dataInicio: inicio.value,
        dataFim: fim.value
    };

    try {
        const resultado = await enviarAgendamentoPorJsonp(dados);

        if (!resultado.sucesso) {
            statusEl.textContent = resultado.erro || textos.error;
            statusEl.className = "form-status error";
            return;
        }

        statusEl.textContent = textos.success;
        statusEl.className = "form-status success";
        formAgendamento.reset();
        atualizarLimites();
        atualizarLinkIdioma();
    } catch (erro) {
        statusEl.textContent = erro.message ? `${textos.error} (${erro.message})` : textos.error;
        statusEl.className = "form-status error";
        console.error(erro);
    } finally {
        submitBtn.disabled = false;
    }
});
}
