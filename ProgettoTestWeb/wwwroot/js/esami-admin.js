atorio').focus();
    });

$('#btnAggiungiParteCorpo').on('click', function () {
    $('#modalAggiungiParteCorpo').modal('show');
    $('#nomeParteCorpo').focus();
});

$('#btnAggiungiEsame').on('click', function () {
    $('#modalAggiungiEsame').modal('show');
});

// Pulsanti elimina
$('#btnEliminaAmbulatorio').on('click', function () {
    eliminaRecord('ambulatorio', '#tabellaAmbulatori', '/Admin/EliminaAmbulatorio');
});

$('#btnEliminaParteCorpo').on('click', function () {
    eliminaRecord('parte del corpo', '#tabellaPartiCorpo', '/Admin/EliminaParteCorpo');
});

$('#btnEliminaEsame').on('click', function () {
    eliminaRecord('esame', '#tabellaEsami', '/Admin/EliminaEsame');
});

// Salvataggio ambulatorio
$('#btnSalvaAmbulatorio').on('click', function () {
    const nome = $('#nomeAmbulatorio').val().trim();

    if (!nome) {
        mostraErrore('Inserire il nome dell\'ambulatorio');
        return;
    }

    salvaAmbulatorio(nome);
});

// Salvataggio parte del corpo
$('#btnSalvaParteCorpo').on('click', function () {
    const nome = $('#nomeParteCorpo').val().trim();

    if (!nome) {
        mostraErrore('Inserire il nome della parte del corpo');
        return;
    }

    salvaParteCorpo(nome);
});

// Selezione righe tabelle
setupSelezioneTabelle();

// Enter sui campi input dei modal
$('#nomeAmbulatorio').on('keypress', function (e) {
    if (e.which === 13) {
        $('#btnSalvaAmbulatorio').click();
    }
});

$('#nomeParteCorpo').on('keypress', function (e) {
    if (e.which === 13) {
        $('#btnSalvaParteCorpo').click();
    }
});

// ==================== FUNZIONI SALVATAGGIO ====================

function salvaAmbulatorio(nome) {
    $.ajax({
        url: '/Admin/AggiungiAmbulatorio',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ nome: nome }),
        success: function (response) {
            if (response.success) {
                $('#modalAggiungiAmbulatorio').modal('hide');
                $('#nomeAmbulatorio').val('');
                mostraSuccesso(response.message);
                ricaricaPagina();
            } else {
                mostraErrore(response.message);
            }
        },
        error: function () {
            mostraErrore('Errore durante il salvataggio dell\'ambulatorio');
        }
    });
}

function salvaParteCorpo(nome) {
    $.ajax({
        url: '/Admin/AggiungiParteCorpo',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ nome: nome }),
        success: function (response) {
            if (response.success) {
                $('#modalAggiungiParteCorpo').modal('hide');
                $('#nomeParteCorpo').val('');
                mostraSuccesso(response.message);
                ricaricaPagina();
            } else {
                mostraErrore(response.message);
            }
        },
        error: function () {
            mostraErrore('Errore durante il salvataggio della parte del corpo');
        }
    });
}

// ==================== FUNZIONI ELIMINAZIONE ====================

function eliminaRecord(tipoRecord, selectorTabella, urlEndpoint) {
    const rigaSelezionata = $(selectorTabella + ' tbody tr.table-active');

    if (rigaSelezionata.length === 0) {
        mostraErrore(`Selezionare un ${tipoRecord} da eliminare`);
        return;
    }

    const id = rigaSelezionata.data('id');

    if (!confermaEliminazione()) return;

    $.ajax({
        url: urlEndpoint,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ id: id }),
        success: function (response) {
            if (response.success) {
                mostraSuccesso(response.message);
                ricaricaPagina();
            } else {
                mostraErrore(response.message);
            }
        },
        error: function () {
            mostraErrore(`Errore durante l'eliminazione del ${tipoRecord}`);
        }
    });
}

function confermaEliminazione() {
    return confirm('Sei sicuro di voler eliminare il record selezionato?');
}

// ==================== FUNZIONI TABELLE ====================

function setupSelezioneTabelle() {
    // Gestione selezione righe tabelle
    $('#tabellaAmbulatori tbody tr, #tabellaPartiCorpo tbody tr, #tabellaEsami tbody tr').on('click', function () {
        // Rimuovi selezione da tutte le tabelle
        $('#tabellaAmbulatori tbody tr, #tabellaPartiCorpo tbody tr, #tabellaEsami tbody tr').removeClass('table-active');
        // Aggiungi selezione alla riga cliccata
        $(this).addClass('table-active');
    });
}

// ==================== FUNZIONI UTILITY ====================

function mostraMessaggio(messaggio, tipo = 'info') {
    const modal = $('#messaggiModal');
    const body = $('#messaggiModalBody');
    const title = $('#messaggiModalLabel');

    switch (tipo) {
        case 'success':
            title.text('Successo');
            body.html(`<div class="alert alert-success">${messaggio}</div>`);
            break;
        case 'warning':
            title.text('Avviso');
            body.html(`<div class="alert alert-warning">${messaggio}</div>`);
            break;
        case 'error':
            title.text('Errore');
            body.html(`<div class="alert alert-danger">${messaggio}</div>`);
            break;
        default:
            title.text('Informazione');
            body.html(`<div class="alert alert-info">${messaggio}</div>`);
    }

    modal.modal('show');
}

function mostraErrore(messaggio) {
    mostraMessaggio(messaggio, 'error');
}

function mostraSuccesso(messaggio) {
    mostraMessaggio(messaggio, 'success');
}

function ricaricaPagina() {
    setTimeout(function () {
        location.reload();
    }, 1500);
}

// ==================== VALIDAZIONE FORM ESAME ====================

$('form[action="/Admin/AggiungiEsame"]').on('submit', function (e) {
    const ambulatoriSelezionati = $('input[name="NuovoEsame.AmbulatoriSelezionati"]:checked');

    if (ambulatoriSelezionati.length === 0) {
        e.preventDefault();
        $('#ambulatoriError').text('Selezionare almeno un ambulatorio');
        mostraErrore('Selezionare almeno un ambulatorio');
        return false;
    }

    $('#ambulatoriError').text('');
    return true;
});

// ==================== DEBUG ====================

console.log('[EsamiAdmin] Script esami-admin.js caricato correttamente');
});