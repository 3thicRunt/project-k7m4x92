const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzHJVlJu9l1MbWyTumSj_vmUFyJliwXOYJ9PSZuI0CVqmqTli9X3WOU4OqOVT70BkEh/exec"; // o teu URL

async function carregarDestaques() {
    try {
        const response = await fetch(APPS_SCRIPT_URL);
        const dados = await response.json();

        const featuredSection = document.querySelector("#featured");
        if (!featuredSection) return;

        const top3 = dados.equipamentos.slice(0, 3);

        let html = '<h2 class="section-title">Equipamentos em Destaque</h2><div class="category-grid">';

        top3.forEach(function(equip) {
            html += `
                <a href="${equip.link}" class="category-card">
                    <img src="images/${equip.imagem}" alt="${equip.nome}">
                    <h3>${equip.nome}</h3>
                    <p>${equip.dias} dias de utilização (${equip.reservas} reservas) nos últimos 3 meses</p>
                </a>
            `;
        });

        html += '</div>';
        featuredSection.innerHTML = html;

    } catch (erro) {
        console.error("Não foi possível carregar os destaques:", erro);
    }
}

document.addEventListener("DOMContentLoaded", carregarDestaques);


//THEME
const themeToggle = document.getElementById("theme-toggle");

if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }
    });
}

// ===== FORMULÁRIO DE REQUISIÇÃO =====

const APPS_SCRIPT_REQUISICAO_URL = "https://script.google.com/macros/s/AKfycbwbi9OgnXfx00_QSOL9hyis9jz29Wgrrbrcnf1ae0y14R7IhEiH7LCb2bSctQL-vsoNfA/exec";

const formRequisicao = document.getElementById("form-requisicao");

if (formRequisicao) {

    // 1. Pré-seleciona o equipamento vindo da URL (?equipamento=uhplc)
    const params = new URLSearchParams(window.location.search);
    const equipamentoParam = params.get("equipamento");
    if (equipamentoParam) {
        const select = document.getElementById("equipamento");
        select.value = equipamentoParam;
    }

    // 2. Bloqueia requisições para os próximos 3 dias
    const inputInicio = document.getElementById("data-inicio");
    const inputFim = document.getElementById("data-fim");

    const hoje = new Date();
    const minData = new Date(hoje);
    minData.setDate(hoje.getDate() + 3); 
    const minDataStr = minData.toISOString().split("T")[0];

    inputInicio.min = minDataStr;
    inputFim.min = minDataStr;

    // 3. Garante que a data de fim nunca é anterior à de início
    inputInicio.addEventListener("change", function () {
        inputFim.min = inputInicio.value;
        if (inputFim.value && inputFim.value < inputInicio.value) {
            inputFim.value = inputInicio.value;
        }
    });

    // 4. Envio do formulário
    formRequisicao.addEventListener("submit", async function (e) {
        e.preventDefault();

        const submitBtn = document.getElementById("submit-btn");
        const statusEl = document.getElementById("form-status");

        submitBtn.disabled = true;
        statusEl.textContent = "A enviar pedido...";
        statusEl.className = "form-status";

        const dados = {
            equipamento: document.getElementById("equipamento").value,
            equipamentoTexto: document.getElementById("equipamento").selectedOptions[0].text,
            dataInicio: inputInicio.value,
            dataFim: inputFim.value,
            requisitante: document.getElementById("requisitante").value,
            emailRequisitante: document.getElementById("email-requisitante").value,
            responsavel: document.getElementById("responsavel").value,
            enquadramento: document.getElementById("enquadramento").value,
            observacoes: document.getElementById("observacoes").value
        };

        try {
            const response = await fetch(APPS_SCRIPT_REQUISICAO_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain" }, // evita problemas de CORS com Apps Script
                body: JSON.stringify(dados)
            });

            const resultado = await response.json();

            if (resultado.sucesso) {
                statusEl.textContent = "Pedido enviado com sucesso!";
                statusEl.className = "form-status success";
                formRequisicao.reset();
            } else {
                throw new Error(resultado.erro || "Erro desconhecido");
            }

        } catch (erro) {
            statusEl.textContent = "Não foi possível enviar o pedido. Tente novamente ou contacte diretamente os técnicos.";
            statusEl.className = "form-status error";
            console.error(erro);
        } finally {
            submitBtn.disabled = false;
        }
    });
}


// ===== MENU MOBILE =====

const menuToggle = document.getElementById("menu-toggle");
const navbar = document.getElementById("navbar");

if (menuToggle && navbar) {

    menuToggle.addEventListener("click", function () {
        menuToggle.classList.toggle("active");
        navbar.classList.toggle("open");
    });

    // Nos dropdowns, em mobile, o clique no título abre/fecha o submenu
    // (em vez de depender do :hover, que não existe em toque)
    const dropdownLinks = document.querySelectorAll(".dropdown > a");

    dropdownLinks.forEach(function (link) {
        link.addEventListener("click", function (e) {
            // só intercepta o clique em ecrãs pequenos (mobile)
            if (window.innerWidth <= 1050) {
                e.preventDefault(); // impede de seguir o href="#"
                const parentLi = link.parentElement;
                parentLi.classList.toggle("open");
            }
        });
    });

    // Fecha o menu automaticamente ao clicar num link real (não nos dropdowns)
    const menuLinks = document.querySelectorAll(".navbar .menu > li > a[href]:not([href='#'])");
    const dropdownItemLinks = document.querySelectorAll(".dropdown-menu a");

    [...menuLinks, ...dropdownItemLinks].forEach(function (link) {
        link.addEventListener("click", function () {
            menuToggle.classList.remove("active");
            navbar.classList.remove("open");
        });
    });
}

// ===== LIGHTBOX DE IMAGENS =====

const lightboxOverlay = document.getElementById("lightbox-overlay");
const lightboxImg = document.getElementById("lightbox-img");

if (lightboxOverlay && lightboxImg) {

    // Abre o lightbox ao clicar em qualquer imagem com a classe "zoomable"
    document.querySelectorAll(".zoomable").forEach(function (img) {
        img.addEventListener("click", function () {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxOverlay.classList.add("active");
        });
    });

    // Fecha ao clicar em qualquer sítio do overlay (incluindo a própria imagem ampliada)
    lightboxOverlay.addEventListener("click", function () {
        lightboxOverlay.classList.remove("active");
    });

    // Fecha também com a tecla Esc
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            lightboxOverlay.classList.remove("active");
        }
    });
}


// ===== SLIDER DE INTRODUÇÃO =====

const slides = document.querySelectorAll("#intro-slide .slide");
const dotsContainer = document.getElementById("slide-dots");
const slidePrev = document.getElementById("slide-prev");
const slideNext = document.getElementById("slide-next");

if (slides.length > 0 && dotsContainer) {

    let current = 0;

    slides.forEach(function (_, index) {
        const dot = document.createElement("button");
        dot.classList.add("slide-dot");
        dot.setAttribute("aria-label", "Ir para o slide " + (index + 1));
        if (index === 0) dot.classList.add("active");

        dot.addEventListener("click", function () {
            goToSlide(index);
        });

        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll(".slide-dot");

    function goToSlide(index) {
        slides[current].classList.remove("active");
        dots[current].classList.remove("active");

        current = (index + slides.length) % slides.length;
        
        slides[current].classList.add("active");
        dots[current].classList.add("active");
    }

    if (slidePrev) {
        slidePrev.addEventListener("click", function () {
            goToSlide(current - 1);
        });
    }

    if (slideNext) {
        slideNext.addEventListener("click", function () {
            goToSlide(current + 1);
        });
    }

    // Opcional: avança automaticamente a cada 6 segundos
    setInterval(function () {
        goToSlide(current + 1);
    }, 15000);
}



// ===== ÍNDICE DE PESQUISA =====

function getBasePath() {
    const path = window.location.pathname;
    const semFicheiro = path.substring(0, path.lastIndexOf("/") + 1);
    const partes = semFicheiro.split("/").filter(function (p) { return p.length > 0; });
    return "../".repeat(partes.length);
}

const searchIndex = [

    // EQUIPAMENTOS
    
    { nome: "Analizador Elementar FlashSmart", link: "paginas/flashsmart.html", categoria: "Equipamento", keywords: ["elementar", "chns", "carbono", "hidrogenio", "nitrogenio", "enxofre", "oxigenio", "elemental", "thermo scientific", "thermo fisher"] },

    { nome: "Analizador de Nutrientes SEAL AQ400", link: "paginas/SEAL_AQ400.html", categoria: "Equipamento", keywords: ["nutrientes", "nitratos", "nitritos", "amonia", "fosfatos", "silicatos", "NH4", "NO3", "NO2", "PO4", "SiO2", "espectrofoto", "seal", "aq400"] },

    { nome: "Analisador Granulométrico Malvern Mastersizer 3000", link: "paginas/malvern.html", categoria: "Equipamento", keywords: ["granulometria", "granulometrico", "tamanho de particulas", "distribuicao granulometrica", "particulas", "difracao laser", "laser diffraction", "particle size", "particle size distribution", "sedimentos", "solos", "microalgas", "biomassa", "particulas ambientais", "D10", "D50", "D90", "Hydro EV", "dispersao humida", "malvern", "malvern panalytical", "mastersizer 3000"] },

    { nome: "Arca -20°C Fiocchetti Superpolo 480", link: "paginas/superpolo.html", categoria: "Equipamento", keywords: ["congelador", "arca congeladora", "congelacao", "conservacao", "congelador -20", "congelador -40", "superpolo", "fiocchetti", "fiocchetti superpolo", "amostras", "reagentes", "materiais biologicos", "armazenamento", "temperatura"] },

    { nome: "Arca -80°C Meling Biomedical", link: "paginas/meling80.html", categoria: "Equipamento", keywords: ["ultracongelador", "ultracongelacao", "arca -80", "congelador -80", "ultra low temperature", "ULT", "ultra low freezer", "conservacao", "armazenamento", "amostras biologicas", "reagentes", "extratos", "culturas", "biomassa", "temperatura ultrabaixa", "Meling", "Meling Biomedical", "DW-HL678HC"] },

    { nome: "Arca -80°C Thermo Scientific TDE Series", link: "paginas/tdeseries80.html", categoria: "Equipamento", keywords: ["ultracongelador", "ultracongelacao", "arca -80", "congelador -80", "ultra low temperature", "ULT", "ultra low freezer", "TDE", "TDE Series", "thermo scientific", "thermo fisher", "conservacao", "armazenamento", "amostras biologicas", "reagentes", "culturas", "criopreservacao", "criopreservação", "temperatura ultrabaixa"] },

    { nome: "Arca -80°C Thermo Scientific TSX Series", link: "paginas/tsxseries80.html", categoria: "Equipamento", keywords: ["ultracongelador", "ultracongelacao", "arca -80", "congelador -80", "ultra low temperature", "ULT", "ultra low freezer", "TSX", "TSX Series", "V-drive", "thermo scientific", "thermo fisher", "conservacao", "armazenamento", "amostras biologicas", "reagentes", "culturas", "criopreservacao", "criopreservação", "temperatura ultrabaixa", "Instrument Connect"] },

    { nome: "Autoclave WiseClave WAC-60", link: "paginas/wac60.html", categoria: "Equipamento", keywords: ["esterilizar", "esterilizacao", "calor humido", "autoclave", "daihan"] },

    { nome: "Balança de Precisão VWR LAG 314i", link: "paginas/bvwr.html", categoria: "Equipamento", keywords: ["balanca", "balança", "precisao", "precisão", "balanca analitica", "balança analítica", "pesagem", "massa", "310 g", "0,1 mg", "calibracao interna", "calibração interna", "GLP", "formulacao", "formulação", "totalizacao", "totalização", "contagem de pecas", "contagem de peças", "VWR", "LAG 314i"] },

    { nome: "Centrífuga Gyrozen GZ-2236R", link: "paginas/gyrozen.html", categoria: "Equipamento", keywords: ["centrifuga", "centrífuga", "centrifugacao", "centrifugação", "separacao", "separação", "amostras", "biomassa", "sedimentos", "tubos falcon", "falcon 50 ml", "frascos 250 ml", "50 ml", "250 ml", "refrigerada", "refrigeracao", "refrigeração", "separacao de fases", "separação de fases", "gyrozen", "GZ-2236R"] },
    
    { nome: "DGPS Trimble R8s", link: "paginas/tr8s.html", categoria: "Equipamento", keywords: ["gps", "topografia", "geolocalizacao", "trimble"] },

    { nome: "DGPS Trimble R12i", link: "paginas/tr12i.html", categoria: "Equipamento", keywords: ["gps", "topografia", "geolocalizacao", "trimble"] },

    { nome: "Drone DJI Mavic 2 Pro", link: "paginas/mavic2.html", categoria: "Equipamento", keywords: ["drone", "UAV", "UAS", "veiculo aereo nao tripulado", "veículo aéreo não tripulado", "aerial imaging", "imagem aerea", "imagem aérea", "fotografia aerea", "fotografia aérea", "video aereo", "vídeo aéreo", "levantamento aereo", "levantamento aéreo", "monitorizacao ambiental", "monitorização ambiental", "mapeamento", "fotogrametria", "cartografia", "GIS", "SIG", "GNSS", "GPS", "gimbal", "3 eixos", "Hasselblad", "20 MP", "Mavic 2", "Mavic 2 Pro", "DJI"] },

    { nome: "Drone DJI P4 Multispectral", link: "paginas/p4multi.html", categoria: "Equipamento", keywords: ["drone", "UAV", "UAS", "multiespectral", "multispectral", "imagem multiespectral", "multispectral imaging", "RGB", "NDVI", "NDRE", "GNDVI", "vegetacao", "vegetação", "habitats", "monitorizacao ambiental", "monitorização ambiental", "agricultura", "agricultura de precisao", "agricultura de precisão", "mapeamento", "cartografia", "fotogrametria", "SIG", "GIS", "RTK", "GNSS", "GPS", "red", "red edge", "near infrared", "NIR", "infravermelho proximo", "infravermelho próximo", "450 nm", "560 nm", "650 nm", "730 nm", "840 nm", "P4 Multispectral", "Phantom 4 Multispectral", "DJI"] },

    { nome: "Ecosonda Echotrac CV 100", link: "paginas/echotrac.html", categoria: "Equipamento", keywords: ["ecosonda", "ecobatimetro", "ecobatímetro", "echosounder", "echo sounder", "single beam", "single-beam", "batimetria", "batimetria marinha", "batimetria costeira", "bathymetry", "levantamento batimetrico", "levantamento batimétrico", "profundidade", "depth", "fundo marinho", "fundo aquático", "sedimentos", "mapeamento do fundo", "levantamento hidrografico", "levantamento hidrográfico", "hidrografia", "monitorizacao costeira", "monitorização costeira", "monitorizacao ambiental", "monitorização ambiental", "Sonar", "Echotrac", "CV 100", "Echotrac CV 100", "Teledyne"] },

    { nome: "Estufa Ventilada Labbox OVF", link: "paginas/ovf.html", categoria: "Equipamento", keywords: ["estufa", "estufa ventilada", "estufa de secagem", "secagem", "aquecimento", "tratamento termico", "tratamento térmico", "circulacao forcada", "circulação forçada", "ar quente", "temperatura", "incubacao", "incubação", "laboratorio", "laboratório", "labbox", "OVF"] },

    { nome: "Frigorífico Fiocchetti Medika 200 Touch", link: "paginas/medika200.html", categoria: "Equipamento", keywords: ["frigorifico", "frigorífico", "refrigeracao", "refrigeração", "refrigerador", "2 a 15", "2 °C", "15 °C", "amostras", "reagentes", "vacinas", "culturas", "materiais biologicos", "materiais biológicos", "temperatura controlada", "monitorizacao", "monitorização", "ecrã touch", "touchscreen", "Fiocchetti", "Medika 200", "Medika 200 Touch"] },

    { nome: "FTIR Nicolet Summit", link: "paginas/summit.html", categoria: "Equipamento", keywords: ["fourier", "infravermelho", "identificacao", "thermo scientific", "thermo fisher", "FTIR", "summit x", "nicolet", "espectrofoto", "impressao digital espectral", "atr", "cristal de diamante", "transmissao", "omnic paradigm", "plasticos", "analise estrutural", "polimeros", "caracterização", "biblioteca", "espectro"] },

    { nome: "DGPS Trimble R6", link: "paginas/tr6.html", categoria: "Equipamento", keywords: ["gps", "topografia", "geolocalizacao", "trimble"] },

    { nome: "Leitor de Placas Tristar 5", link: "paginas/tristar5.html", categoria: "Equipamento", keywords: ["leitor de placas", "multiplacas", "microplacas", "absorvancia", "espectro", "espectrofoto", "fluorescencia", "uv", "uv-vis", "luminescencia", "berthold", "tristar"] },

    { nome: "Máquina de Gelo Fiocchetti BF80A", link: "paginas/pgsice.html", categoria: "Equipamento", keywords: ["gelo", "maquina de gelo", "máquina de gelo", "gelo em flocos", "gelo granular", "flake ice", "ice maker", "producao de gelo", "produção de gelo", "68 kg", "arrefecimento", "conservacao de amostras", "conservação de amostras", "laboratorio", "laboratório", "investigacao", "investigação", "Fiocchetti", "BF80A"] },

    { nome: "Mufla Thermolyne F6020C-33", link: "paginas/f6020c.html", categoria: "Equipamento", keywords: ["mufla", "forno mufla", "forno", "forno de laboratorio", "forno de laboratório", "calcinacao", "calcinação", "incineracao", "incineração", "tratamento termico", "tratamento térmico", "aquecimento", "cinzas", "materia organica", "matéria orgânica", "analise gravimetrica", "análise gravimétrica", "Thermolyne", "F6020C-33"] },

    { nome: "Microscópio de Fluorescência VisiScope IT600 FLD", link: "paginas/visiscope.html", categoria: "Equipamento", keywords: ["microscopio", "microscópio", "microscopia", "fluorescencia", "fluorescência", "microscopia de fluorescencia", "microscopia de fluorescência", "campo claro", "campo escuro", "contraste de fase", "fluorocromos", "FITC", "GFP", "YFP", "DAPI", "Hoechst", "Rhodamine", "TRITC", "Texas Red", "celulas", "células", "microalgas", "microrganismos", "biologia celular", "VisiScope", "IT600 FLD", "VWR"] },

    { nome: "Real-Time PCR Bio-Rad CFX Opus 96 Dx", link: "paginas/cfxopus.html", categoria: "Equipamento", keywords: ["PCR", "PCR em tempo real", "qPCR", "RT-PCR", "RT-qPCR", "real time PCR", "real-time PCR", "quantificacao", "quantificação", "acidos nucleicos", "ácidos nucleicos", "DNA", "RNA", "expressao genica", "expressão génica", "gene expression", "amplificacao", "amplificação", "96 poços", "96 wells", "multiplex", "melting curve", "curva de melting", "discriminacao alelica", "discriminação alélica", "biologia molecular", "diagnostico molecular", "diagnóstico molecular", "Peltier", "CFX", "CFX Opus", "CFX Opus 96 Dx", "Bio-Rad"] },

    { nome: "Respirometro ECHO ER", link: "paginas/echoer.html", categoria: "Equipamento", keywords: ["Echo", "ER Series", "Respirometro", "respirometria", "atividade biologica", "oxigenio", "dioxido de carbono", "CO2", "metano", "Sulfureto", "Amoniaco", "CH4", "H2S", "H2", "hidrogenio", "NH3", "Amonia", "O2", "biodegradacao", "biodegradibilidade", "aerobia", "anaerobia", "plastico"] },

    { nome: "Scan de Géis Bio-Rad ChemiDoc", link: "paginas/chemidoc.html", categoria: "Equipamento", keywords: ["scan de géis", "scanner de géis", "gel scanner", "gel imaging", "gel documentation", "documentacao de géis", "documentação de géis", "imagem de géis", "imaging", "eletroforese", "electrophoresis", "géis", "géis de agarose", "géis de poliacrilamida", "Western blot", "western blotting", "quimioluminescencia", "quimioluminescência", "chemiluminescence", "CCD", "densitometria", "analise densitometrica", "análise densitométrica", "Image Lab", "Bio-Rad", "ChemiDoc"] },

    { nome: "Sistema de Água Ultrapura MilliporeSigma Synergy", link: "paginas/milliq.html", categoria: "Equipamento", keywords: ["agua ultrapura", "água ultrapura", "purificacao de agua", "purificação de água", "agua tipo I", "água tipo I", "18,2 MOhm", "18.2 MOhm", "18,2 megaohm", "TOC", "agua desionizada", "água desionizada", "agua deionizada", "água deionizada", "SynergyPak", "polimento", "polishing", "laboratorio", "laboratório", "reagentes", "solucoes", "soluções", "HPLC", "UHPLC", "biologia molecular", "Millipore", "MilliporeSigma", "Merck", "Synergy"] },

    { nome: "Sonda Hanna HI98594", link: "paginas/hi98594.html", categoria: "Equipamento", keywords: ["sonda", "multiparametrica", "hanna", "sensor", "temperatura", "condutividade", "salinidade", "oxigenio dissolvido", "pH", "ORP", "redox", "turbidez", "tds", "solidos totais dissolvidos", "resistividade", "densidade"] },

    { nome: "Sonda YSI EXO2", link: "paginas/exo2.html", categoria: "Equipamento", keywords: ["sonda", "multiparametrica", "ysi", "sensor", "temperatura", "condutividade", "salinidade", "oxigenio dissolvido", "pH", "ORP", "redox", "turbidez", "clorofila", "ficocianina", "ficoeritrina", "exo", "fdom", "cdom"] },

    { nome: "UHPLC Thermo Scientific UltiMate 3000", link: "paginas/ultimate3000.html", categoria: "Equipamento", keywords: ["UHPLC", "HPLC", "cromatografia", "cromatografia liquida", "cromatografia líquida", "cromatografia liquida de alta eficiencia", "cromatografia líquida de alta eficiência", "cromatografo", "cromatógrafo", "cromatografia analitica", "cromatografia analítica", "separacao cromatografica", "separação cromatográfica", "analise quantitativa", "análise quantitativa", "analise qualitativa", "análise qualitativa", "identificacao de compostos", "identificação de compostos", "compostos organicos", "compostos orgânicos", "metabolitos", "metabólitos", "farmacos", "fármacos", "proteinas", "proteínas", "peptideos", "péptidos", "amostras ambientais", "amostras biologicas", "amostras biológicas", "DAD", "FLD", "RI", "MS", "MS/MS", "espectrometria de massa", "detetor UV", "detetor de fluorescencia", "detetor de fluorescência", "detetor de indice de refracao", "detetor de índice de refração", "Thermo Scientific", "Thermo Fisher", "Dionex", "UltiMate 3000", "Ultimate 3000"] },

    
    
    //ANALISES
    { nome: "Análise Elementar CHNS", link: "paginas/a-chns.html", categoria: "Análise", keywords: ["carbono", "nitrogenio", "enxofre", "hidrogenio", "elemental", "flashsmart", "elementar"] },
    { nome: "Análise Elementar Oxigénio", link: "paginas/a-oxigen.html", categoria: "Análise", keywords: ["oxigenio", "elemental", "flashsmart", "elementar"] },

    //TECNICOS
    { nome: "Margarida Ramires", link: "paginas/margarida.html", categoria: "Técnico", keywords: ["tecnico", "tecnica"]},
    { nome: "Rodrigo Borges", link: "paginas/rodrigo.html", categoria: "Técnico", keywords: ["tecnico", "tecnica"]},
    
    //DOCUMENTACAO
    { nome: "Análises Disponíveis", link: "paginas/analises.html", categoria: "Página" },
    { nome: "Manuais de Equipamentos", link: "paginas/manuais.html", categoria: "Página", keywords: ["manuais", "datasheet", "documentos"] },
];


function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // remove os acentos, mantém as letras base
}


function pesquisar(termo) {
    const termoNorm = normalizar(termo.trim());
    if (termoNorm.length === 0) return [];

    return searchIndex.filter(function (item) {
        const nomeMatch = normalizar(item.nome).includes(termoNorm);
        const keywordMatch = item.keywords && item.keywords.some(function (kw) {
            return normalizar(kw).includes(termoNorm);
        });
        return nomeMatch || keywordMatch;
    });
}

function renderizarResultados(resultados, container, termo) {
    if (termo.trim().length === 0) {
        container.classList.remove("active");
        container.innerHTML = "";
        return;
    }

    if (resultados.length === 0) {
        container.innerHTML = '<div class="search-no-results">Sem resultados para "' + termo + '"</div>';
        container.classList.add("active");
        return;
    }

    const base = getBasePath(); // <-- calculado uma vez, aqui

    let html = "";
    resultados.forEach(function (item) {
        html += `<a href="${base}${item.link}" class="search-result-item">${item.nome} <span class="search-result-tag">${item.categoria}</span></a>`;
    });
    container.innerHTML = html;
    container.classList.add("active");
}

function ligarPesquisa(inputId, resultsId) {
    const input = document.getElementById(inputId);
    const results = document.getElementById(resultsId);
    if (!input || !results) return;

    input.addEventListener("input", function () {
        renderizarResultados(pesquisar(input.value), results, input.value);
    });

    document.addEventListener("click", function (e) {
        if (!input.contains(e.target) && !results.contains(e.target)) {
            results.classList.remove("active");
        }
    });
}

ligarPesquisa("main-search-input", "main-search-results");
ligarPesquisa("search-mini-input", "search-mini-results");

// Clique no ícone de lupa foca o campo (essencial para funcionar em mobile, onde não há :hover)
const searchIconBtn = document.getElementById("search-icon-btn");
const searchMiniInput = document.getElementById("search-mini-input");
if (searchIconBtn && searchMiniInput) {
    searchIconBtn.addEventListener("click", function () {
        searchMiniInput.focus();
    });
}