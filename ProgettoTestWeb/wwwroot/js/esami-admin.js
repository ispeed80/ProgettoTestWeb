$(document).ready(function () {
    // Inizializzazione
    inizializzaAdmin();

    function inizializzaAdmin() {
        // Event listeners per i pulsanti
        $('#btnAggiungiAmbulatorio').click(mostraModalAggiungiAmbulatorio);
        $('#btnAggiungiParteCorpo').click(mostraModalAggiungiParteCorpo);
        $('#btnAggiungiEsame').click(mostraModalAggiungiEsame);

        $('#btnEliminaAmbulatorio').click(() => eliminaRecord('ambulatorio'));
        $('#btnEliminaParteCorpo').click(() => eliminaRecord('parteCorpo'));
        $('#btnEliminaEsame').click(() => eliminaRecord('esame'));

        // Event listeners per i modali
        $('#btnSalvaAmbulatorio').click(salvaAmbulatorio);
        $('#btnSalvaParteCorpo').click(salvaParteCorpo);

        // Event listeners per selezione righe
        $('#tabellaAmbulatori').on('click', 'tr', function () {
            selezionaRiga(this, '#tabellaAmbulatori');
        });

        $('#tabellaPartiCorpo').on('click', 'tr', function () {
            selezionaRiga(this, '#tabellaPartiCorpo');
        });

        $('#tabellaEsami').on('click', 'tr', function () {
            selezionaRiga(this, '#tabellaEsami');
        });

        // Enter per salvare nei modali
        $('#nomeAmbulatorio').keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                salvaAmbulatorio();
            }
        });

        $('#nomeParteCorpo').keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                salvaParteCorpo();
            }
        });

        // Validazione form esame
        $('form[asp-action="AggiungiEsame"]').submit(function (e) {
            if (!validaFormEsame()) {
                e.preventDefault();
                return false;
            }
        });
    }

    // Gestione modali
    function mostraModalAggiungiAmbulatorio() {
        $('#nomeAmbulatorio').val('');
        const modal = new bootstrap.Modal('#modalAggiungiAmbulatorio');
        modal.show();

        // Focus sul campo input
        $('#modalAggiungiAmbulatorio').on('shown.bs.modal', function () {
            $('#nomeAmbulatorio').focus();
        });
    }

    function mostraModalAggiungiParteCorpo() {
        $('#nomeParteCorpo').val('');
        const modal = new bootstrap.Modal('#modalAggiungiParteCorpo');
        modal.show();

        $('#modalAggiungiParteCorpo').on('shown.bs.modal', function () {
            $('#nomeParteCorpo').focus();
        });
    }

    function mostraModalAggiungiEsame() {
        // Reset del form
        $('form[asp-action="AggiungiEsame"]')[0].reset();
        $('input[name="NuovoEsame.AmbulatoriSelezionati"]').prop('checked', false);
        $('#ambulatoriError').empty();

        const modal = new bootstrap.Modal('#modalAggiungiEsame');
        modal.show();
    }

    // Funzioni di salvataggio
    function salvaAmbulatorio() {
        const nome = $('#nomeAmbulatorio').val().trim();

        if (!nome) {
            mostraMessaggio('Errore', 'Il nome dell\'ambulatorio è richiesto', 'danger');
            return;
        }

        const request = { nome: nome };

        $.ajax({
            url: '/Admin/AggiungiAmbulatorio',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request)
        })
            .done(function (response) {
                if (response.success) {
                    bootstrap.Modal.getInstance('#modalAggiungiAmbulatorio').hide();
                    mostraMessaggio('Successo', response.message, 'success');
                    ricaricaDati();
                } else {
                    mostraMessaggio('Errore', response.message, 'danger');
                }
            })
            .fail(function (xhr, textStatus, errorThrown) {
                gestisciErroreAjax(xhr, textStatus, errorThrown);
            });
    }

    function salvaParteCorpo() {
        const nome = $('#nomeParteCorpo').val().trim();

        if (!nome) {
            mostraMessaggio('Errore', 'Il nome della parte del corpo è richiesto', 'danger');
            return;
        }

        const request = { nome: nome };

        $.ajax({
            url: '/Admin/AggiungiParteCorpo',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request)
        })
            .done(function (response) {
                if (response.success) {
                    bootstrap.Modal.getInstance('#modalAggiungiParteCorpo').hide();
                    mostraMessaggio('Successo', response.message, 'success');
                    ricaricaDati();
                } else {
                    mostraMessaggio('Errore', response.message, 'danger');
                }
            })
            .fail(function (xhr, textStatus, errorThrown) {
                gestisciErroreAjax(xhr, textStatus, errorThrown);
            });
    }

    // Funzioni di eliminazione
    function eliminaRecord(tipo) {
        let tabella, endpoint;

        switch (tipo) {
            case 'ambulatorio':
                tabella = '#tabellaAmbulatori';
                endpoint = '/Admin/EliminaAmbulatorio';
                break;
            case 'parteCorpo':
                tabella = '#tabellaPartiCorpo';
                endpoint = '/Admin/EliminaParteCorpo';
                break;
            case 'esame':
                tabella = '#tabellaEsami';
                endpoint = '/Admin/EliminaEsame';
                break;
            default:
                return;
        }

        const rigaSelezionata = $(tabella + ' tr.table-active');
        if (rigaSelezionata.length === 0) {
            mostraMessaggio('Selezione richiesta', 'Seleziona prima un record da eliminare', 'warning');
            return;
        }

        const id = rigaSelezionata.data('id');

        // Conferma eliminazione
        if (!confirm('Sei sicuro di voler eliminare il record selezionato?')) {
            return;
        }

        const request = { id: id };

        $.ajax({
            url: endpoint,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request)
        })
            .done(function (response) {
                if (response.success) {
                    mostraMessaggio('Successo', response.message, 'success');
                    ricaricaDati();
                } else {
                    mostraMessaggio('Errore', response.message, 'danger');
                }
            })
            .fail(function (xhr, textStatus, errorThrown) {
                gestisciErroreAjax(xhr, textStatus, errorThrown);
            });
    }

    // Funzioni di utilità
    function selezionaRiga(rigaCliccata, tabella) {
        // Rimuovi selezione precedente
        $(tabella + ' tr').removeClass('table-active');
        // Aggiungi selezione alla riga cliccata
        $(rigaCliccata).addClass('table-active');
    }

    function validaFormEsame() {
        const ambulatoriSelezionati = $('input[name="NuovoEsame.AmbulatoriSelezionati"]:checked');

        if (ambulatoriSelezionati.length === 0) {
            $('#ambulatoriError').text('Seleziona almeno un ambulatorio');
            mostraMessaggio('Validazione', 'Seleziona almeno un ambulatorio per l\'esame', 'warning');
            return false;
        }

        $('#ambulatoriError').empty();
        return true;
    }

    function ricaricaDati() {
        $.get('/Admin/CaricaDati')
            .done(function (response) {
                if (response.success) {
                    aggiornaTabelle(response.data);
                } else {
                    mostraMessaggio('Errore', 'Errore nel caricamento dei dati', 'danger');
                }
            })
            .fail(function (xhr, textStatus, errorThrown) {
                console.error('Errore nel caricamento dati:', xhr.responseText);
                // In caso di errore, ricarica la pagina
                location.reload();
            });
    }

    function aggiornaTabelle(data) {
        // Aggiorna tabella ambulatori
        const tabellaAmb = $('#tabellaAmbulatori');
        tabellaAmb.empty();
        data.ambulatori.forEach(ambulatorio => {
            const row = $(`
                <tr data-id="${ambulatorio.id}">
                    <td>${ambulatorio.id}</td>
                    <td>${ambulatorio.nomeAmbulatorio}</td>
                </tr>
            `);
            row.click(function () {
                selezionaRiga(this, '#tabellaAmbulatori');
            });
            tabellaAmb.append(row);
        });

        // Aggiorna tabella parti corpo
        const tabellaParti = $('#tabellaPartiCorpo');
        tabellaParti.empty();
        data.partiCorpo.forEach(parte => {
            const row = $(`
                <tr data-id="${parte.id}">
                    <td>${parte.id}</td>
                    <td>${parte.nomeParte}</td>
                </tr>
            `);
            row.click(function () {
                selezionaRiga(this, '#tabellaPartiCorpo');
            });
            tabellaParti.append(row);
        });

        // Aggiorna tabella esami
        const tabellaEsami = $('#tabellaEsami');
        tabellaEsami.empty();
        data.esami.forEach(esame => {
            const row = $(`
                <tr data-id="${esame.id}">
                    <td>${esame.id}</td>
                    <td>${esame.codiceMinisteriale}</td>
                    <td>${esame.codiceInterno}</td>
                    <td>${esame.descrizioneEsame}</td>
                    <td>${esame.parteCorpo}</td>
                    <td>${esame.ambulatoriString || ''}</td>
                </tr>
            `);
            row.click(function () {
                selezionaRiga(this, '#tabellaEsami');
            });
            tabellaEsami.append(row);
        });

        // Aggiorna anche le opzioni nel modal esame
        aggiornaOpzioniModalEsame(data);
    }

    function aggiornaOpzioniModalEsame(data) {
        // Aggiorna select parti corpo
        const selectParti = $('select[name="NuovoEsame.ParteCorpo"]');
        const parteSelezionata = selectParti.val();
        selectParti.empty().append('<option value="">Seleziona...</option>');

        data.partiCorpo.forEach(parte => {
            const selected = parte.nomeParte === parteSelezionata ? 'selected' : '';
            selectParti.append(`<option value="${parte.nomeParte}" ${selected}>${parte.nomeParte}</option>`);
        });

        // Aggiorna checkbox ambulatori
        const containerAmbulatori = $('.form-check').first().parent();
        if (containerAmbulatori.length > 0) {
            const ambulatoriSelezionati = $('input[name="NuovoEsame.AmbulatoriSelezionati"]:checked').map(function () {
                return $(this).val();
            }).get();

            containerAmbulatori.empty();
            data.ambulatori.forEach((ambulatorio, index) => {
                const checked = ambulatoriSelezionati.includes(ambulatorio.nomeAmbulatorio) ? 'checked' : '';
                containerAmbulatori.append(`
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" 
                               name="NuovoEsame.AmbulatoriSelezionati" 
                               value="${ambulatorio.nomeAmbulatorio}" 
                               id="amb_${index}" ${checked}>
                        <label class="form-check-label" for="amb_${index}">
                            ${ambulatorio.nomeAmbulatorio}
                        </label>
                    </div>
                `);
            });
        }
    }

    function mostraMessaggio(titolo, messaggio, tipo) {
        $('#messaggiModalLabel').text(titolo);
        $('#messaggiModalBody').html(`<div class="alert alert-${tipo} mb-0">${messaggio}</div>`);

        const modal = new bootstrap.Modal('#messaggiModal');
        modal.show();

        // Auto-hide per messaggi di successo dopo 3 secondi
        if (tipo === 'success') {
            setTimeout(() => {
                modal.hide();
            }, 3000);
        }
    }

    function gestisciErroreAjax(xhr, textStatus, errorThrown) {
        let messaggio = 'Errore di comunicazione con il server';

        if (xhr.responseJSON && xhr.responseJSON.message) {
            messaggio = xhr.responseJSON.message;
        } else if (xhr.responseText) {
            try {
                const response = JSON.parse(xhr.responseText);
                if (response.message) {
                    messaggio = response.message;
                }
            } catch (e) {
                // Mantieni il messaggio di default
            }
        }

        switch (xhr.status) {
            case 400:
                messaggio = 'Richiesta non valida: ' + messaggio;
                break;
            case 404:
                messaggio = 'Risorsa non trovata';
                break;
            case 500:
                messaggio = 'Errore interno del server';
                break;
            case 0:
                messaggio = 'Errore di connessione. Verificare la connessione di rete.';
                break;
        }

        mostraMessaggio('Errore', messaggio, 'danger');
    }

    // Funzioni di utilità aggiuntive
    function confermaAzione(messaggio) {
        return confirm(messaggio);
    }

    function validaInput(valore, lunghezzaMax, nomeCampo) {
        if (!valore || valore.trim() === '') {
            mostraMessaggio('Campo richiesto', `Il campo ${nomeCampo} è obbligatorio`, 'warning');
            return false;
        }

        if (valore.length > lunghezzaMax) {
            mostraMessaggio('Lunghezza eccessiva', `Il campo ${nomeCampo} non può superare ${lunghezzaMax} caratteri`, 'warning');
            return false;
        }

        return true;
    }

    // Esporta funzioni per uso globale se necessario
    window.AdminUtils = {
        mostraMessaggio: mostraMessaggio,
        ricaricaDati: ricaricaDati,
        confermaAzione: confermaAzione,
        validaInput: validaInput
    };
});