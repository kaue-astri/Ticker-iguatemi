
$(document).ready(function () {

    var ano = $("select[id*=filtroAnoAgenda] option:selected").text();
    if (ano != '') {
        efetuarFiltroPorAno(ano);
    }
});


function OutlookExportar(e) {
    var Exportar = e.target.parentNode.attributes.exportar.value;

    $("#_EventoExportarPraOutlook").val(Exportar);
    __doPostBack(uniqueExportarPraOutlook);
}


function GmailExportar(e) {
    var Exportar = e.target.parentNode.attributes.exportar.value;

    $("#_EventoExportarPraGmail").val(Exportar);
    __doPostBack(uniqueExportarPraGmail);
}



function filtrarAno() {
    var ano = $('select[id$=filtroAnoAgenda]').val();
    ano = parseInt(ano);
    if (!isNaN(ano)) {
        efetuarFiltroPorAno(ano);
    }
    else {
        limpaFiltroPorAno();
    }
}

function efetuarFiltroPorAno(ano) {
    $('li[data-ano]').hide();
    $('li[data-ano=' + ano + ']').show();
}

function limpaFiltroPorAno() {
    $('li[data-ano]').hide();
    $('li[data-ano]').show();
}

function initAgendaDatepicker(config) {


    if (!config || !config.datepickerSelector || !config.eventosJson || !config.dateFormat) {
        console.error("Erro Crítico: Configuração essencial faltando.", config);
        if (config && config.lblErroSelector && $(config.lblErroSelector).length) $(config.lblErroSelector).text("Erro config calendário.").show(); else alert("Erro config calendário.");
        if (config && config.datepickerSelector && $(config.datepickerSelector).length) $(config.datepickerSelector).html("<p style='color:red;'>Falha config.</p>");
        return;
    }


    config.gmailIconPath = config.gmailIconPath || './images/icon-gmail.svg';
    config.outlookIconPath = config.outlookIconPath || './images/icon-outlook.svg';

    const locale = config.locale || {};
    const defaultMonthAbbreviations = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthAbbreviations = (locale.monthAbbreviations && locale.monthAbbreviations.length === 12) ? locale.monthAbbreviations : defaultMonthAbbreviations;

    const timezoneText = locale.timezoneText || "Horário de Brasília";
    const timezoneTextEN = locale.timezoneTextEN || "Brasilia Time";

    const colorClasses = ['pink', 'yellow', 'green', 'purple']; // Usado para aplicar no link e no popover


    try {
        var eventos;
        const $datepickerContainer = $(config.datepickerSelector);

        if (!$datepickerContainer.length) { throw new Error(`Container do datepicker ('${config.datepickerSelector}') não encontrado.`); }


        if (!config.eventosJson || config.eventosJson.trim() === "" || config.eventosJson.trim() === "[]") {
            console.warn("Nenhum evento fornecido ou JSON vazio. Inicializando calendário básico.");
            eventos = [];
            $datepickerContainer.datepicker({
                dateFormat: config.dateFormat,
                showOtherMonths: false, selectOtherMonths: false,
                beforeShowDay: null,
                onSelect: handleDateSelect,
                onChangeMonthYear: null,
                prevText: '', nextText: ''
            });

            return;
        }

        try {
            eventos = JSON.parse(config.eventosJson);
        } catch (parseError) {
            console.error("Erro Fatal: Falha ao parsear JSON dos eventos.", parseError, "\nJSON:", config.eventosJson.substring(0, 500) + "...");
            throw new Error("Dados de eventos inválidos.");
        }
        if (!Array.isArray(eventos)) { throw new Error("Formato de dados de eventos inesperado (não é array)."); }



        function escapeHtml(text) {
            if (text === null || text === undefined) return '';
            return text.toString()
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        function highlightDays(date) {
            var hasEvent = false;
            var dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            for (var i = 0; i < eventos.length; i++) {
                var evento = eventos[i];
                if (!evento || !evento.Data || !evento.DataFim) continue;
                try {
                    var dI = $.datepicker.parseDate(config.dateFormat, evento.Data);
                    var dF = $.datepicker.parseDate(config.dateFormat, evento.DataFim);
                    var dIO = new Date(dI.getFullYear(), dI.getMonth(), dI.getDate());
                    var dFO = new Date(dF.getFullYear(), dF.getMonth(), dF.getDate());
                    if (dateOnly >= dIO && dateOnly <= dFO) {
                        hasEvent = true;
                        break;
                    }
                } catch (e) { }
            }
            return [true, hasEvent ? 'event-day' : '', ''];
        }

        function applyStylesAndPopovers() {
            setTimeout(function () {


                $datepickerContainer.find('td a.ui-state-default')
                    .removeClass('ui-state-active ' + colorClasses.join(' '))
                    .removeAttr('data-bs-toggle data-bs-trigger data-bs-html data-bs-content title');


                $datepickerContainer.find('td.event-day').each(function () {
                    var $td = $(this);
                    var $a = $td.find('a.ui-state-default');
                    if (!$a.length) return;


                    $a.addClass('ui-state-active');


                    var day = parseInt($a.text(), 10);
                    var month = parseInt($td.attr('data-month'), 10);
                    var year = parseInt($td.attr('data-year'), 10);
                    if (isNaN(day) || isNaN(month) || isNaN(year)) return;

                    var cellDate = new Date(year, month, day);
                    var firstEventTitle = null;
                    var colorClassForLink = 'purple';
                    var popoverContentHtml = "<div class='eventos-calendario'>";
                    var eventsOnThisDay = [];


                    for (var i = 0; i < eventos.length; i++) {
                        var evento = eventos[i];

                        if (!evento || !evento.Data || !evento.DataFim || !evento.Titulo || !evento.DescricaoHora) continue;

                        try {
                            var dI = $.datepicker.parseDate(config.dateFormat, evento.Data);
                            var dF = $.datepicker.parseDate(config.dateFormat, evento.DataFim);
                            var dIO = new Date(dI.getFullYear(), dI.getMonth(), dI.getDate());
                            var dFO = new Date(dF.getFullYear(), dF.getMonth(), dF.getDate());

                            if (cellDate >= dIO && cellDate <= dFO) {
                                eventsOnThisDay.push(evento);


                                if (firstEventTitle === null) {
                                    firstEventTitle = evento.Titulo.toLowerCase();
                                    if (firstEventTitle.includes('call') || firstEventTitle.includes('conferência') || firstEventTitle.includes('conference')) colorClassForLink = 'pink';
                                    else if (firstEventTitle.includes('divulgação') || firstEventTitle.includes('release') || firstEventTitle.includes('results')) colorClassForLink = 'yellow';
                                    else if (firstEventTitle.includes('meeting') || firstEventTitle.includes('assembleia')) colorClassForLink = 'green';

                                }
                            }
                        } catch (e) { }
                    }


                    $a.addClass(colorClassForLink);


                    if (eventsOnThisDay.length > 0) {
                        eventsOnThisDay.forEach(function (evt) {

                            popoverContentHtml += "<div class='item-evento item-" + colorClassForLink + "'>" +
                                "<span class='data'>" + escapeHtml(evt.DataTitle) + "</span>" +
                                "<p>" + escapeHtml(evt.Titulo) + "</p>" +
                                "<span class='horario'>" + escapeHtml(evt.DescricaoHora) + "</span>" +
                                "</div>";
                        });
                        popoverContentHtml += "</div>";


                        $a.attr({
                            'data-bs-toggle': 'popover',
                            'data-bs-trigger': 'hover',
                            'data-bs-html': 'true',
                            'data-bs-content': popoverContentHtml
                        });
                    } else {

                        console.warn("TD marcada como event-day, mas nenhum evento encontrado para data:", cellDate);
                    }
                });

                var popoverTriggerList = [].slice.call($datepickerContainer[0].querySelectorAll('[data-bs-toggle="popover"]'));
                popoverTriggerList.forEach(function (popoverTriggerEl) {

                    var existingPopover = bootstrap.Popover.getInstance(popoverTriggerEl);
                    if (!existingPopover) {
                        new bootstrap.Popover(popoverTriggerEl, {
                            sanitize: false,
                            fallbackPlacements: ['bottom', 'top', 'right', 'left'],
                            customClass: 'calendar-popover'
                        });
                    }
                });

            }, 50);
        }


        /**
         * Função onSelect - Apenas loga o clique.
         */
        function handleDateSelect(dateText, inst) {
            console.log("Data selecionada (onSelect):", dateText);
        }



        $datepickerContainer.datepicker({
            dateFormat: config.dateFormat,
            beforeShowDay: highlightDays,
            //onSelect: handleDateSelect,
            onChangeMonthYear: function (year, month, inst) {
                applyStylesAndPopovers();
            },
            showOtherMonths: false,
            selectOtherMonths: false,
            prevText: '',
            nextText: ''
        });


        applyStylesAndPopovers();


        const datepickerElement = $datepickerContainer.get(0); 

        if (datepickerElement) {
            datepickerElement.addEventListener('click', function (event) {
                if (event.target.matches('td a.ui-state-default') || $(event.target).closest('td a.ui-state-default').length > 0) {                   
                    event.preventDefault();
                    event.stopImmediatePropagation();

                } 
            }, true); 
        }
     



    } catch (error) {
        console.error("Erro GERAL durante a inicialização:", error);
        var errorMsg = "Ocorreu um erro inesperado ao carregar o calendário.";
        if (error instanceof Error) console.error("Detalhes:", error.message, error.stack);
        if (config && config.lblErroSelector && $(config.lblErroSelector).length) $(config.lblErroSelector).text(errorMsg).show(); else alert(errorMsg + " Verifique o console.");
        if ($(config.datepickerSelector).length) $(config.datepickerSelector).html("<p style='color:red; font-weight:bold;'>Falha ao carregar calendário.</p>");
    }
}




