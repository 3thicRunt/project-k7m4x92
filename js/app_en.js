const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzHJVlJu9l1MbWyTumSj_vmUFyJliwXOYJ9PSZuI0CVqmqTli9X3WOU4OqOVT70BkEh/exec"; // o teu URL

async function carregarDestaques() {
    try {
        const response = await fetch(APPS_SCRIPT_URL);
        const dados = await response.json();

        const featuredSection = document.querySelector("#featured");
        if (!featuredSection) return;

        const top3 = dados.equipamentos.slice(0, 3);

        let html = '<h2 class="section-title">Equipment Highlights</h2><div class="category-grid">';

        top3.forEach(function(equip) {
            html += `
                <a href="${equip.link}" class="category-card">
                    <img src="../images/${equip.imagem}" alt="${equip.nome}">
                    <h3>${equip.nome}</h3>
                    <p>${equip.dias} days of usage (${equip.reservas} reservations) in the last 3 months</p>
                </a>
            `;
        });

        html += '</div>';
        featuredSection.innerHTML = html;

    } catch (erro) {
        console.error("Highlights were not able to load:", erro);
    }
}

document.addEventListener("DOMContentLoaded", carregarDestaques);

// THEME
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
        statusEl.textContent = "Submitting request...";
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
                statusEl.textContent = "Request submitted successfully!";
                statusEl.className = "form-status success";
                formRequisicao.reset();
            } else {
                throw new Error(resultado.erro || "Unknown Error");
            }

        } catch (erro) {
            statusEl.textContent = "Request not submitted. Please try again or contact the technicians directly.";
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

const APP_SCRIPT_SRC = document.currentScript
    ? document.currentScript.getAttribute("src")
    : "js/app_en.js";

const BASE_PATH = APP_SCRIPT_SRC.replace(/js\/app_en\.js$/, "");

function getBasePath() {
    return BASE_PATH;
}

const searchIndex = [
// EQUIPAMENTOS
    
    { nome: "Berthold TriStar 5 Microplate Reader", link: "paginas/tristar5.html", categoria: "Equipment", keywords: ["plate reader", "multiplate", "microplate", "absorbance", "spectrum", "spectrophoto", "fluorescence", "uv", "uv-vis", "luminescence", "berthold", "tristar"] },

    { nome: "Bio-Rad CFX Opus 96 Dx Real-Time PCR", link: "pages/cfxopus.html", categoria: "Equipment", keywords: ["PCR", "real-time PCR", "qPCR", "RT-PCR", "RT-qPCR", "quantification", "nucleic acids", "DNA", "RNA", "gene expression", "amplification", "96 wells", "multiplex", "melting curve", "allele discrimination", "molecular biology", "molecular diagnostics", "Peltier", "CFX", "CFX Opus", "CFX Opus 96 Dx", "Bio-Rad"] },

    { nome: "Bio-Rad ChemiDoc Gel Imaging System", link: "pages/chemidoc.html", categoria: "Equipment", keywords: ["gel scanner", "gel imaging", "gel documentation", "gel electrophoresis", "electrophoresis", "gels", "agarose gels", "polyacrylamide gels", "Western blot", "Western blotting", "chemiluminescence", "CCD", "densitometry", "densitometric analysis", "Image Lab", "Bio-Rad", "ChemiDoc"] },

    { nome: "DGPS Trimble R8s", link: "paginas/tr8s.html", categoria: "Equipment", keywords: ["gps", "topography", "geolocation", "trimble"] },

    { nome: "DGPS Trimble R12i", link: "paginas/tr12i.html", categoria: "Equipment", keywords: ["gps", "topography", "geolocation", "trimble"] },

    { nome: "DJI Mavic 2 Pro Drone", link: "pages/mavic2.html", categoria: "Equipment", keywords: ["drone", "UAV", "UAS", "unmanned aerial vehicle", "aerial imaging", "aerial photography", "aerial video", "aerial surveying", "environmental monitoring", "mapping", "photogrammetry", "cartography", "GIS", "GNSS", "GPS", "gimbal", "3-axis", "Hasselblad", "20 MP", "Mavic 2", "Mavic 2 Pro", "DJI"] },

    { nome: "DJI P4 Multispectral Drone", link: "pages/p4multi.html", categoria: "Equipment", keywords: ["drone", "UAV", "UAS", "multispectral", "multispectral imaging", "RGB", "NDVI", "NDRE", "GNDVI", "vegetation", "habitats", "environmental monitoring", "agriculture", "precision agriculture", "mapping", "cartography", "photogrammetry", "GIS", "RTK", "GNSS", "GPS", "red", "red edge", "near infrared", "NIR", "450 nm", "560 nm", "650 nm", "730 nm", "840 nm", "P4 Multispectral", "Phantom 4 Multispectral", "DJI"] },

    { nome: "ECHO ER Respirometer", link: "paginas/echoer.html", categoria: "Equipment", keywords: ["Echo", "ER Series", "Respirometer", "respirometry", "biological activity", "oxygen", "carbon dioxide", "CO2", "methane", "sulfide", "ammonia", "CH4", "H2S", "H2", "hydrogen", "NH3", "ammonia", "O2", "biodegradation", "biodegradability", "aerobic", "anaerobic", "plastic"] },

    { nome: "Fiocchetti BF80A Ice Maker", link: "paginas/pgsice.html", categoria: "Equipment", keywords: ["ice", "ice maker", "flake ice", "granular ice", "ice production", "68 kg", "cooling", "sample preservation", "laboratory", "research", "Fiocchetti", "BF80A"] },

    { nome: "Fiocchetti Medika 200 Touch Refrigerator", link: "paginas/medika200.html", categoria: "Equipment", keywords: ["refrigerator", "refrigeration", "laboratory refrigerator", "2 to 15", "2 °C", "15 °C", "samples", "reagents", "vaccines", "cultures", "biological materials", "temperature controlled", "monitoring", "touchscreen", "Fiocchetti", "Medika 200", "Medika 200 Touch"] },

    { nome: "Fiocchetti Superpolo 480 -20°C Freezer", link: "paginas/superpolo.html", categoria: "Equipment", keywords: ["freezer", "chest freezer", "freezing", "cold storage", "-20 freezer", "-40 freezer", "Superpolo", "Fiocchetti", "Fiocchetti Superpolo", "samples", "reagents", "biological materials", "storage", "temperature"] },

    { nome: "FlashSmart Elemental Analyzer", link: "paginas/flashsmart.html", categoria: "Equipment", keywords: ["elemental", "chns", "carbon", "hydrogen", "nitrogen", "sulfur", "oxygen", "elemental", "thermo scientific", "thermo fisher"] },

    { nome: "DGPS Trimble R6", link: "paginas/tr6.html", categoria: "Equipment", keywords: ["gps", "topography", "geolocation", "trimble"] },

    { nome: "Gyrozen GZ-2236R Centrifuge", link: "paginas/gyrozen.html", categoria: "Equipment", keywords: ["centrifuge", "centrifugation", "sample separation", "samples", "biomass", "sediments", "Falcon tubes", "50 mL Falcon", "250 mL bottles", "50 mL", "250 mL", "refrigerated", "refrigeration", "phase separation", "Gyrozen", "GZ-2236R"] },

    { nome: "Hanna HI98594 Multiparameter Probe", link: "paginas/hi98594.html", categoria: "Equipment", keywords: ["probe", "multiparameter", "hanna", "sensor", "temperature", "conductivity", "salinity", "dissolved oxygen", "pH", "ORP", "redox", "turbidity", "tds", "total dissolved solids", "resistivity", "density"] },

    { nome: "Labbox OVF Ventilated Oven", link: "paginas/ovf.html", categoria: "Equipment", keywords: ["oven", "drying oven", "ventilated oven", "drying", "heating", "thermal treatment", "forced air circulation", "hot air", "temperature", "incubation", "laboratory", "Labbox", "OVF"] },

    { nome: "Malvern Mastersizer 3000 Particle Size Analyzer", link: "paginas/malvern.html", categoria: "Equipment", keywords: ["particle size", "particle sizing", "particle size distribution", "particles", "laser diffraction", "sediments", "soils", "microalgae", "biomass", "environmental particles", "D10", "D50", "D90", "Hydro EV", "wet dispersion", "Malvern", "Malvern Panalytical", "Mastersizer 3000"] },

    { nome: "MaXterile 60 Autoclave", link: "paginas/wac60.html", categoria: "Equipment", keywords: ["sterilize", "sterilization", "moist heat", "autoclave", "daihan"] },

    { nome: "Meling Biomedical -80°C Ultra-Low Temperature Freezer", link: "paginas/meling80.html", categoria: "Equipment", keywords: ["ultra-low temperature freezer", "ULT freezer", "ultra-low freezer", "-80 freezer", "-80°C", "ULT", "ultra-low temperature", "cold storage", "sample storage", "biological samples", "reagents", "extracts", "cultures", "biomass", "Meling", "Meling Biomedical", "DW-HL678HC"] },

    { nome: "MilliporeSigma Synergy Ultrapure Water System", link: "paginas/milliq.html", categoria: "Equipment", keywords: ["ultrapure water", "water purification", "Type I water", "18.2 MOhm", "18.2 megohm", "TOC", "deionized water", "demineralized water", "SynergyPak", "polishing", "laboratory", "reagents", "solutions", "HPLC", "UHPLC", "molecular biology", "Millipore", "MilliporeSigma", "Merck", "Synergy"] },

    { nome: "FTIR Nicolet Summit", link: "paginas/summit.html", categoria: "Equipment", keywords: ["fourier", "infrared", "identification", "thermo scientific", "thermo fisher", "FTIR", "summit x", "nicolet", "spectrophoto", "spectral fingerprint", "atr", "diamond crystal", "transmission", "omnic paradigm", "plastics", "structural analysis", "polymers", "characterization", "library", "spectrum"] },

    { nome: "SEAL AQ400 Nutrient Analyzer", link: "paginas/SEAL_AQ400.html", categoria: "Equipment", keywords: ["nutrients", "nitrates", "nitrites", "ammonia", "phosphates", "silicates", "NH4", "NO3", "NO2", "PO4", "SiO2", "spectrophoto", "seal", "aq400"] },

    { nome: "Thermolyne F6020C-33 Muffle Furnace", link: "paginas/f6020c.html", categoria: "Equipment", keywords: ["muffle", "muffle furnace", "furnace", "laboratory furnace", "calcination", "incineration", "thermal treatment", "heating", "ash", "organic matter", "gravimetric analysis", "Thermolyne", "F6020C-33"] },

    { nome: "Thermo Scientific TDE Series -80°C Ultra-Low Temperature Freezer", link: "paginas/tdeseries80.html", categoria: "Equipment", keywords: ["ultra-low temperature freezer", "ULT freezer", "ultra-low freezer", "-80 freezer", "-80°C", "ULT", "ultra-low temperature", "TDE", "TDE Series", "Thermo Scientific", "Thermo Fisher", "cold storage", "sample storage", "biological samples", "reagents", "cultures", "cryopreservation", "temperature-controlled storage"] },

    { nome: "Thermo Scientific TSX Series -80°C Ultra-Low Temperature Freezer", link: "paginas/tsxseries80.html", categoria: "Equipment", keywords: ["ultra-low temperature freezer", "ULT freezer", "ultra-low freezer", "-80 freezer", "-80°C", "ULT", "ultra-low temperature", "TSX", "TSX Series", "V-drive", "Thermo Scientific", "Thermo Fisher", "cold storage", "sample storage", "biological samples", "reagents", "cultures", "cryopreservation", "temperature-controlled storage", "Instrument Connect"] },

    { nome: "Thermo Scientific UltiMate 3000 UHPLC", link: "pages/ultimate3000.html", categoria: "Equipment", keywords: ["UHPLC", "HPLC", "chromatography", "liquid chromatography", "high performance liquid chromatography", "high-performance liquid chromatography", "liquid chromatograph", "analytical chromatography", "chromatographic separation", "quantitative analysis", "qualitative analysis", "compound identification", "organic compounds", "metabolites", "pharmaceuticals", "proteins", "peptides", "environmental samples", "biological samples", "DAD", "FLD", "RI", "MS", "MS/MS", "mass spectrometry", "UV detector", "fluorescence detector", "refractive index detector", "Thermo Scientific", "Thermo Fisher", "Dionex", "UltiMate 3000", "Ultimate 3000"] },

    { nome: "TOH Echotrac CV100 Echo Sounder", link: "pages/echotrac.html", categoria: "Equipment", keywords: ["echo sounder", "echosounder", "single beam", "single-beam", "bathymetry", "marine bathymetry", "coastal bathymetry", "depth", "seafloor", "riverbed", "sediments", "seafloor mapping", "hydrographic surveying", "hydrography", "coastal monitoring", "environmental monitoring", "sonar", "Echotrac", "CV 100", "Echotrac CV 100", "Teledyne"] },

    { nome: "VisiScope IT600 FLD Fluorescence Microscope", link: "paginas/visiscope.html", categoria: "Equipment", keywords: ["microscope", "microscopy", "fluorescence", "fluorescence microscopy", "brightfield", "darkfield", "phase contrast", "fluorophores", "FITC", "GFP", "YFP", "DAPI", "Hoechst", "Rhodamine", "TRITC", "Texas Red", "cells", "microalgae", "microorganisms", "cell biology", "VisiScope", "IT600 FLD", "VWR"] },

    { nome: "VWR LAG 314i Precision Balance", link: "paginas/bvwr.html", categoria: "Equipment", keywords: ["balance", "precision", "precision balance", "analytical balance", "weighing", "mass", "scale", "310 g", "0.1 mg", "internal calibration", "GLP", "formulation", "totalization", "parts counting", "VWR", "LAG 314i"] },

    { nome: "YSI EXO2 Multiparameter Probe", link: "paginas/exo2.html", categoria: "Equipment", keywords: ["probe", "multiparameter", "ysi", "sensor", "temperature", "conductivity", "salinity", "dissolved oxygen", "pH", "ORP", "redox", "turbidity", "chlorophyll", "phycocyanin", "phycoerythrin", "exo", "fdom", "cdom"] },

    

    
    //ANALYSES
    { nome: "CHNS Elemental Analysis", link: "paginas/a-chns.html", categoria: "Analysis", keywords: ["carbon", "nitrogen", "sulfur", "hydrogen", "elemental", "flashsmart", "elemental"] },
    { nome: "Oxygen Elemental Analysis", link: "paginas/a-oxigen.html", categoria: "Analysis", keywords: ["oxygen", "elemental", "flashsmart", "elemental"] },

    //TECHNICIANS
    { nome: "Margarida Ramires", link: "paginas/margarida.html", categoria: "Technician", keywords: ["technician", "staff"]},
    { nome: "Rodrigo Borges", link: "paginas/rodrigo.html", categoria: "Technician", keywords: ["technician", "staff"]},
    
    //DOCUMENTATION
    { nome: "Available Analyses", link: "paginas/analises.html", categoria: "Page" },
    { nome: "Equipment Manuals", link: "paginas/manuais.html", categoria: "Page", keywords: ["manuals", "datasheet", "documents"] },
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
        container.innerHTML = '<div class="search-no-results">No results for "' + termo + '"</div>';
        container.classList.add("active");
        return;
    }

    const base = getBasePath(); 

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