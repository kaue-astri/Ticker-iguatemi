function limpaFiltroPorAno() {
    window.location = "ListGroup.aspx?idCanal=" + getIdCanal();

}

function efetuarFiltroPorAno(ano) {

    var idCanal = $('input[id*=hdCanal]').val();
    var linguagem = $('input[class*=hidLinguagem]').val();
    $('div[id*=pills-tabContent]').attr('style', 'display:none;');
    $('div[class*=loader]').attr('style', 'display:block;');

    $.ajax({
        type: "POST",
        url: "filtroListGroup.asmx/RefreshContent",
        data: JSON.stringify({
            "ano": ano,
            "idCanal": idCanal,
            "linguagem": linguagem
        }),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: onSuccess,
        error: function (result) {
        }
    });


    //PageMethods.RefreshContent(ano, idCanal, linguagem, onSuccess, onError);

}

function efetuarFiltroCategoria() {
    var categoria = $('select[id*=ddlCategoriaFiltro] option:selected').val();
    var ano = new Date().getFullYear();

    var idCanal = $('input[id*=hdCanal]').val();
    var linguagem = $('input[class*=hidLinguagem]').val();
    $('div[id*=pills-tabContent]').attr('style', 'display:none;');
    $('div[class*=loader]').attr('style', 'display:block;');

    $.ajax({
        type: "POST",
        url: "filtroListGroup.asmx/RefreshCategoria",
        data: JSON.stringify({
            "categoria": categoria,
            "ano": ano,
            "idCanal": idCanal,
            "linguagem": linguagem
        }),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: onSuccess,
        error: function (result) {
        }
    });


    //PageMethods.RefreshCategoria(ano, categoria, idCanal, linguagem, onSuccess, onError);

}

function efetuarFiltroCategoriaAno() {

    var categoria = $('select[id*=ddlCategoriaFiltro] option:selected').val();
    var ano = $('select[id*=ddlAnoFiltro] option:selected').val();

    var idCanal = $('input[id*=hdCanal]').val();
    var linguagem = $('input[class*=hidLinguagem]').val();
    $('div[id*=pills-tabContent]').attr('style', 'display:none;');
    $('div[class*=loader]').attr('style', 'display:block;');

    $.ajax({
        type: "POST",
        url: "filtroListGroup.asmx/RefreshCategoriaAno",
        data: JSON.stringify({
            "categoria": categoria,
            "ano": ano,
            "idCanal": idCanal,
            "linguagem": linguagem
        }),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: onSuccess,
        error: function (result) {
        }
    });


    //PageMethods.RefreshCategoriaAno(ano, categoria, idCanal, linguagem, onSuccess, onError);
}

function getIdCanal() {
    var strHref = window.location.href;
    var strQueryString = strHref.substr(strHref.indexOf("=") + 1);
    var aQueryString = strQueryString.split("&");
    return aQueryString[0];
}

function onError(result) {
    alert(result._message);
}

function onSuccess(result) {
    $('div.accordion').empty();


    var i;
    var c;
    var text = "";
    var conteudos = "";
    for (i = 0; i < result.d.length; i++) {
        if (!(typeof result.d[i].Titulo === "undefined")) {
            var corpoHtmlBase = '<div class="accordion-item" data-aos="fade-up" data-aos-delay="200"> <h3 class="accordion-header" id="heading"> <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"  aria-expanded="false" > #TituloCanal </button> </h3> <div id="collapse" class="accordion-collapse collapse"  data-bs-parent="#accordionEstatuto"> <div class="accordion-body"> <ul class="list-com-data"> #RecebeConteudos </ul> </div> </div> </div>'
            corpoHtmlBase = corpoHtmlBase.replaceAll('#TituloCanal', result.d[i].Titulo);
            var corpoConteudos = "";

            for (c = 0; c < result.d[i].Materia.length; c++) {
                if (!(typeof result.d[i].Materia[c].Titulo === "undefined")) {
                    corpoConteudos = '<li class="ajusteLista"> <div class="item"> <span class="data"> #trocaData </span> <a href="#trocaLink" class="recebeLink"> <span class="recebeTexto"> #trocaTitulo </span> <div class="icones"> <img class="icon-pdf" src="images/icon-pdf.svg" alt="Download"> <img class="icon-download" src="images/icon-download.svg" alt="Download"> </div> </a> </div> </li>	';
                    corpoConteudos = corpoConteudos.replaceAll('#trocaData', result.d[i].Materia[c].Data);
                    corpoConteudos = corpoConteudos.replaceAll('#trocaTitulo', result.d[i].Materia[c].Titulo);
                    corpoConteudos = corpoConteudos.replaceAll('#trocaLink', result.d[i].Materia[c].Link);
                    conteudos += corpoConteudos;
                }
            }
            corpoHtmlBase = corpoHtmlBase.replaceAll('#RecebeConteudos', conteudos);
            conteudos = "";

           

        }
        text += corpoHtmlBase;
    }

    $('div.accordion').append(text);


    $('a').each(function () {
        var link = $(this);
        var urlLink = $(this).attr('href');
        if (typeof link.attr('href') != 'undefined') {
            if ((link.attr('href').indexOf('/Download/') > -1) || (link.attr('href').indexOf('download.aspx') > -1) || (link.attr('href').indexOf('Download.aspx') > -1)) {
                var descricao = link.text().trim();
                link.attr('target', '_blank');

                if (descricao == '') {
                    descricao = urlLink.split('download.aspx?')[1];
                }

                var url = window.location.href;

                if ((url.toLowerCase().indexOf('/results') > -1) || (url.toLowerCase().indexOf('/results') > -1)) {
                    var ano = $(this).parents('div[id*=divResultados]').attr('ano');
                    if (ano != undefined) {
                        var idLink = $(this).attr('id');
                        descricao = idLink.split('_')[4];

                        if ($(".hidLinguagem").val() == "ptg") {
                            link.attr("onClick", "gtag('event', 'file_download', {'link_text' : '" + descricao + "_PT_" + ano + "','file_name' : '" + descricao + "_PT_" + ano + "'});");

                        } else {
                            link.attr("onClick", "gtag('event', 'file_download', {'link_text': '" + descricao + "_EN_" + ano + "','file_name' : '" + descricao + "_EN_" + ano + "'});");
                        }
                    }


                } else {
                    link.attr("onClick", "gtag('event', 'file_download', {'link_text' : '" + descricao + "','file_name' : '" + descricao + "'});");
                }
            }
        }
    });

    var cont1 = 0;
    $('button[class*=accordion-button]').each(function () {
        $(this).attr('data-bs-target', '#collapse' + cont1);
        $(this).attr('aria-controls', 'collapse' + cont1);
        cont1++;
    });

    var cont2 = 0;
    $('div[id*=collapse]').each(function () {
        var id = $(this).attr('id');
        $(this).attr('id', id + cont2);
        $(this).attr('aria-labelledby', 'heading' + cont2);
        cont2++;
    });

    var cont3 = 0;
    $('h3[id*=heading]').each(function () {
        var id = $(this).attr('id');
        $(this).attr('id', id + cont3);
        cont3++;
    });


    $('.list-com-data').each(function () {
        if ($.trim($(this).html()) == "") {
            $(this).parents('.accordion-item').remove();
        }
    });

    if ($('#accordionEstatuto').text().trim() === '') {
        if ($(".hidLinguagem").val() == "ptg") {
            $('#accordionEstatuto').first().html('<p>Não existem matérias com esse filtro escolhido.</p>');
        } else {
            $('#accordionEstatuto').first().html('<p>There are no articles with this filter chosen.</p>');
        }
    }

    $('div[class*=loader]').attr('style', 'display:none;');
    $('div[id*=pills-tabContent]').attr('style', 'display:block;');

}

function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}


$(document).ready(function () {

    sleep(1000);


    $('a[id*=linkListaTituloChamada]').each(function () {
        var link = $(this).attr('href');
        $(this).parents('.ajusteLista').find('a.recebeLink').attr('href', link);

        if (link.indexOf("Download") == -1) { 
            $(this).parents('.ajusteLista').find('.iconePDF').attr('src', './images/icons/icon-link.svg');
        }

        var textoLink = $(this).text();

        $(this).parents('.ajusteLista').find('.recebeTexto').append(" - " + textoLink);

        $(this).remove();
    });

    var url = window.location.search.toLowerCase();


    var idCanal = url.split("idcanal=")[1];
    if (idCanal) {
        idCanal = idCanal.toLowerCase();

        $(".nav-pills a").each(function () {
            var href = $(this).attr("href");
            var canalFiltro = href.split("idcanal=")[1];


            if (canalFiltro) {
                canalFiltro = canalFiltro.toLowerCase();
            }


            if (canalFiltro && idCanal.indexOf(canalFiltro) !== -1) {
                $(this).addClass("active");
            }
        });
    } else {
        console.error('IdCanal não encontrado na URL');
    }

    var idCanal = $('input[id*=hdCanal]').val();

    if (idCanal == "sNsuQLFhGDsEEHHmRF7wmQ==" || idCanal == "x283eaJ07xYgDmSY3BLGDA==") {

        $('.flex-filter').remove();
    }
 

    var cont1 = 0;
    $('button[class*=accordion-button]').each(function () {
        $(this).attr('data-bs-target', '#collapse' + cont1);
        $(this).attr('aria-controls', 'collapse' + cont1);
        cont1++;
    });

    var cont2 = 0;
    $('div[id*=collapse]').each(function () {
        var id = $(this).attr('id');
        $(this).attr('id', id + cont2);
        $(this).attr('aria-labelledby', 'heading' + cont2);
        cont2++;
    });

    var cont3 = 0;
    $('h3[id*=heading]').each(function () {
        var id = $(this).attr('id');
        $(this).attr('id', id + cont3);
        cont3++;
    });


    $('.list-com-data').each(function () {
        if ($.trim($(this).html()) == "") {
            $(this).parents('.accordion-item').remove();
        }
    });

    if ($('.list-com-data').text().trim() === '') {
        if ($(".hidLinguagem").val() == "ptg") {
            $('.list-com-data').first().html('<li><p>Não existem matérias com esse filtro escolhido.</p></li> ');
        } else {
            $('.list-com-data').first().html('<li><p>There are no articles with this filter chosen.</p></li> ');
        }
    }





    $('div[class*=loader]').attr('style', 'display:none;');
    $('div[id*=pills-tabContent]').attr('style', 'display:block;');
    
});