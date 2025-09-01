// File: wwwroot/js/esami-main.js
// Script principale per la gestione degli esami

$(document).ready(function () {

    let esamiSelezionati = [];
    let inModalitaRicerca = false;
    let tuttiEsami = [];

    // ==================== INIZIALIZZAZIONE ====================

    // Carica configurazioni predefinite se presenti
    applicaConfigurazioniPredefinite();

    // Seleziona primo ambulatorio al caricamento
    if ($('#selectAmbulatori option').length > 0) {
        $('#selectAmbulatori').prop('selectedIndex', 0);
        $('#selectAmbulatori').trigger('change');
    }

    // ==================== EVENT HANDLERS ====================

    // Cambio selezione ambulatorio
    $('#selectAmbulatori').on('change', function () {
        const ambulatorioSelezionato = $(this).val();

        if (!ambulatorioSelezionato) return;

        // Se in modalità ricerca, resetta
        if (inModalitaRicerca) {
            resetRicerca();
        }

        caricaPartiCorpo(ambulatorioSelezionato);
    });

    // Cambio selezione parte del corpo
    $('#selectPartiCorpo').on('change', function () {
        const ambulatorio = $('#selectAmbulatori').val();
        const parteCorpo = $(this).val();

        if (!ambulatorio || !parteCorpo) return;

        // Se in modalità ricerca, resetta
        if (inModalitaRicerca) {
            resetRicerca();
        }

        caricaEsami(ambulatorio, parteCorpo);
    });

    // Cambio selezione esame (solo in modalità ricerca)
    $('#selectEsami').on('change', function () {
        if (!inModalitaRicerca) return;

        const esameSelezionato = $(this).find('option:selected');
        if (esameSelezionato.length === 0) return;

        const ambulatorio = esameSelezionato.data('ambulatorio');
        const parteCorpo = esameSelezionato.data('parte-corpo');

        if (ambulatorio && parteCorpo) {
            aggiornaListBoxPerRicerca(ambulatorio, parteCorpo);
        }
    });

    // Ricerca con pulsante
    $('#btnCerca').on('click', function () {
        eseguiRicerca();
    });

    // Ricerca con Enter
    $('#testoRicerca').on('keypress', function (e) {
        if (e.which === 13) { // Enter
            e.preventDefault();
            eseguiRicerca();
        }
    });

    // Reset ricerca
    $('#btnVediTutti').on('click', function () {
        resetRicerca();
        ricaricaDatiCompleti();
    });

    // Conferma selezione esame
    $('#btnConfermaEsame').on('click', function () {
        aggiungiEsameSelezionato();
    });

    // Gestione tabella esami selezionati
    $('#btnEliminaRiga').on('click', function () {
        eliminaRigaSelezionata();
    });

    $('#btnSpostaSu').on('click', function () {
        spostaRiga(-1);
    });

    $('#btnSpostaGiu').on('click', function () {
        spostaRiga(1);
    });

    // Selezione riga tabella
    $(document).on('click', '#tabellaEsamiSelezionati tbody tr', function () {
        $('#tabellaEsamiSelezionati tbody tr').removeClass('table-active');
        $(this).addClass('table-active');
    });

    // ==================== FUNZIONI CARICAMENTO DATI ====================

    function caricaPartiCorpo(ambulatorio) {
        $.post('/Home/GetPartiCorpo', { ambulatorio: ambulatorio })
            .done(function (response) {
                if (response.success) {
                    popolaSelect('#selectPartiCorpo', response.data);

                    // Auto-seleziona prima parte se disponibile
                    if (response.data.length > 0) {
                        $('#selectPartiCorpo').prop('selectedIndex', 0);
                        $('#selectPartiCorpo').trigger('change');
                    } else {
                        $('#selectEsami').empty();
                    }
                } else {
                    mostraErrore(response.message);
                }
            })
            .fail(function () {
                mostraErrore('Errore durante il caricamento delle parti del corpo');
            });
    }

    function caricaEsami(ambulatorio, parteCorpo) {
        $.post('/Home/GetEsami', {
            ambulatorio: ambulatorio,
            parteCorpo: parteCorpo
        })
            .done(function (response) {
                if (response.success) {
                    popolaSelectEsami(response.data);

                    // Auto-seleziona primo esame se disponibile
                    if (response.data.length > 0) {
                        $('#selectEsami').prop('selectedIndex', 0);
                    }
                } else {
                    mostraErrore(response.message);
                }
            })
            .fail(function () {
                mostraErrore('Errore durante il caricamento degli esami');
            });
    }

    function ricaricaDatiCompleti() {
        $.post('/Home/GetDatiCompleti')
            .done(function (response) {
                if (response.success) {
                    popolaSelect('#selectAmbulatori', response.data.ambulatori);
                    popolaSelect('#selectPartiCorpo', response.data.parti);
                    popolaSelectEsami(response.data.esami);

                    // Auto-seleziona primi elementi
                    if (response.data.ambulatori.length > 0) {
                        $('#selectAmbulatori').prop('selectedIndex', 0);
                    }
                    if (response.data.parti.length > 0) {
                        $('#selectPartiCorpo').prop('selectedIndex', 0);
                    }
                    if (response.data.esami.length > 0) {
                        $('#selectEsami').prop('selectedIndex', 0);
                    }
                } else {
                    mostraErrore(response.message);
                }
            })
            .fail(function () {
                mostraErrore('Errore durante il caricamento dei dati');
            });
    }

    // ==================== FUNZIONI RICERCA ====================

    function eseguiRicerca() {
        const filtro = $('#testoRicerca').val().trim();
        const campo = $('#campoRicerca').val();

        if (!filtro) {
            mostraErrore('Inserire un testo di ricerca');
            return;
        }

        $.post('/Home/RicercaEsami', {
            filtro: filtro,
            campo: campo
        })
            .done(function (response) {
                if (response.success) {
                    if (response.data.length === 0) {
                        mostraMessaggio('Nessun risultato trovato.', 'warning');
                        resetRicerca();
                        ricaricaDatiCompleti();
                        return;
                    }

                    inModalitaRicerca = true;
                    tuttiEsami = response.data;

                    // Popola solo la lista esami con i risultati
                    popolaSelectEsami(response.data);

                    // Svuota le altre liste
                    $('#selectAmbulatori').empty();
                    $('#selectPartiCorpo').empty();

                    // Auto-seleziona primo risultato se presente
                    if (response.data.length > 0) {
                        $('#selectEsami').prop('selectedIndex', 0);
                        $('#selectEsami').trigger('change');
                    }
                } else {
                    mostraErrore(response.message);
                }
            })
            .fail(function () {
                mostraErrore('Errore durante la ricerca');
            });
    }

    function resetRicerca() {
        $('#testoRicerca').val('');
        inModalitaRicerca = false;
        tuttiEsami = [];
    }

    function aggiornaListBoxPerRicerca(ambulatorio, parteCorpo) {
        // Aggiorna ambulatori e parti corpo con i dati dell'esame selezionato
        $('#selectAmbulatori').empty().append($('<option>', {
            value: ambulatorio,
            text: ambulatorio,
            selected: true
        }));

        $('#selectPartiCorpo').empty().append($('<option>', {
            value: parteCorpo,
            text: parteCorpo,
            selected: true
        }));
    }

    // ==================== GESTIONE ESAMI SELEZIONATI ====================

    function aggiungiEsameSelezionato() {
        const esameSelezionato = $('#selectEsami').find('option:selected');
        const ambulatorioSelezionato = $('#selectAmbulatori').find('option:selected');
        const parteCorpoSelezionata = $('#selectPartiCorpo').find('option:selected');

        if (esameSelezionato.length === 0 || ambulatorioSelezionato.length === 0 || parteCorpoSelezionata.length === 0) {
            mostraErrore('Selezionare un esame completo prima di confermare');
            return;
        }

        const esame = {
            codiceMinisteriale: esameSelezionato.data('codice-ministeriale') || '',
            codiceInterno: esameSelezionato.data('codice-interno') || '',
            descrizioneEsame: esameSelezionato.text(),
            ambulatorio: ambulatorioSelezionato.text(),
            parteCorpo: parteCorpoSelezionata.text()
        };

        // Aggiungi alla tabella
        const nuovaRiga = `
            <tr>
                <td>${esame.codiceMinisteriale}</td>
                <td>${esame.codiceInterno}</td>
                <td>${esame.descrizioneEsame}</td>
                <td>${esame.ambulatorio}</td>
                <td>${esame.parteCorpo}</td>
            </tr>`;

        $('#tabellaEsamiSelezionati tbody').append(nuovaRiga);

        mostraMessaggio('Esame aggiunto con successo!', 'success');
    }

    function eliminaRigaSelezionata() {
        const rigaSelezionata = $('#tabellaEsamiSelezionati tbody tr.table-active');

        if (rigaSelezionata.length === 0) {
            mostraErrore('Selezionare una riga da eliminare');
            return;
        }

        rigaSelezionata.remove();
    }

    function spostaRiga(direzione) {
        const rigaSelezionata = $('#tabellaEsamiSelezionati tbody tr.table-active');

        if (rigaSelezionata.length === 0) {
            mostraErrore('Selezionare una riga da spostare');
            return;
        }

        const righe = $('#tabellaEsamiSelezionati tbody tr');
        const indiceCorrente = righe.index(rigaSelezionata);
        const nuovoIndice = indiceCorrente + direzione;

        // Verifica limiti
        if (nuovoIndice < 0 || nuovoIndice >= righe.length) {
            return;
        }

        // Esegui spostamento
        if (direzione === -1) {
            rigaSelezionata.insertBefore(righe.eq(nuovoIndice));
        } else {
            rigaSelezionata.insertAfter(righe.eq(nuovoIndice));
        }

        // Mantieni la selezione
        rigaSelezionata.addClass('table-active');
    }

    // ==================== FUNZIONI HELPER ====================

    function popolaSelect(selector, items) {
        const select = $(selector);
        select.empty();

        items.forEach(function (item) {
            select.append($('<option>', {
                value: item,
                text: item
            }));
        });
    }

    function popolaSelectEsami(esami) {
        const select = $('#selectEsami');
        select.empty();

        esami.forEach(function (esame) {
            const option = $('<option>', {
                value: esame.id,
                text: esame.descrizioneEsame,
                'data-codice-ministeriale': esame.codiceMinisteriale,
                'data-codice-interno': esame.codiceInterno,
                'data-ambulatorio': esame.ambulatorio,
                'data-parte-corpo': esame.parteCorpo
            });
            select.append(option);
        });
    }

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

    function applicaConfigurazioniPredefinite() {
        // Applica ricerca predefinita se presente nel campo hidden o tramite AJAX
        const testoRicerca = $('#testoRicerca').val();
        if (testoRicerca) {
            setTimeout(function () {
                eseguiRicerca();
            }, 500);
        }
    }

    // ==================== GESTIONE CONFIGURAZIONI PREDEFINITE ====================

    function applicaConfigurazioniPredefinite() {
        // Verifica se c'è una ricerca predefinita
        const ricercaPredefinita = $('#ricercaPredefinita').val();
        const inRicerca = $('#inModalitaRicerca').val() === 'true';

        if (ricercaPredefinita && ricercaPredefinita.trim() !== '') {
            setTimeout(function () {
                $('#testoRicerca').val(ricercaPredefinita);
                eseguiRicerca();
            }, 500); // Aspetta che la pagina sia completamente caricata
        }
    }

    // ==================== REPLICA LOGICA WINFORMS ====================

    function caricaPartiCorpo(ambulatorio) {
        if (!ambulatorio) {
            $('#selectPartiCorpo').empty();
            $('#selectEsami').empty();
            return;
        }

        $.post('/Home/GetPartiCorpo', { ambulatorio: ambulatorio })
            .done(function (response) {
                if (response.success) {
                    popolaSelect('#selectPartiCorpo', response.data);

                    // Auto-seleziona prima parte se disponibile (logica WinForms)
                    if (response.data.length > 0) {
                        $('#selectPartiCorpo').prop('selectedIndex', 0);
                        $('#selectPartiCorpo').trigger('change');
                    } else {
                        $('#selectEsami').empty();
                    }
                } else {
                    mostraErrore(response.message || 'Errore caricamento parti del corpo');
                    $('#selectPartiCorpo').empty();
                    $('#selectEsami').empty();
                }
            })
            .fail(function (xhr, status, error) {
                mostraErrore('Errore di comunicazione durante il caricamento delle parti del corpo');
                $('#selectPartiCorpo').empty();
                $('#selectEsami').empty();
            });
    }

    function caricaEsami(ambulatorio, parteCorpo) {
        if (!ambulatorio || !parteCorpo) {
            $('#selectEsami').empty();
            return;
        }

        $.post('/Home/GetEsami', {
            ambulatorio: ambulatorio,
            parteCorpo: parteCorpo
        })
            .done(function (response) {
                if (response.success) {
                    popolaSelectEsami(response.data);

                    // Auto-seleziona primo esame se disponibile (logica WinForms)
                    if (response.data.length > 0) {
                        $('#selectEsami').prop('selectedIndex', 0);
                    }
                } else {
                    mostraErrore(response.message || 'Errore caricamento esami');
                    $('#selectEsami').empty();
                }
            })
            .fail(function (xhr, status, error) {
                mostraErrore('Errore di comunicazione durante il caricamento degli esami');
                $('#selectEsami').empty();
            });
    }

    function eseguiRicerca() {
        const filtro = $('#testoRicerca').val().trim();
        const campo = $('#campoRicerca').val();

        if (!filtro) {
            mostraErrore('Inserire un testo di ricerca');
            return;
        }

        $.post('/Home/RicercaEsami', {
            filtro: filtro,
            campo: campo
        })
            .done(function (response) {
                if (response.success) {
                    if (response.data.length === 0) {
                        mostraMessaggio('Nessun risultato trovato per la ricerca.', 'warning');
                        resetRicerca();
                        ricaricaDatiCompleti();
                        return;
                    }

                    // Entra in modalità ricerca
                    inModalitaRicerca = true;
                    tuttiEsami = response.data;

                    // Popola solo la lista esami con i risultati (logica WinForms)
                    popolaSelectEsami(response.data);

                    // Svuota le altre liste come nel WinForms
                    $('#selectAmbulatori').empty();
                    $('#selectPartiCorpo').empty();

                    // Auto-seleziona primo risultato se presente
                    if (response.data.length > 0) {
                        $('#selectEsami').prop('selectedIndex', 0);
                        $('#selectEsami').trigger('change');
                    }

                    log('Ricerca completata', { risultati: response.data.length });
                } else {
                    mostraErrore(response.message || 'Errore durante la ricerca');
                }
            })
            .fail(function (xhr, status, error) {
                mostraErrore('Errore di comunicazione durante la ricerca');
            });
    }

    function resetRicerca() {
        $('#testoRicerca').val('');
        inModalitaRicerca = false;
        tuttiEsami = [];
        log('Ricerca resettata');
    }

    function aggiornaListBoxPerRicerca(ambulatorio, parteCorpo) {
        // Logica identica al WinForms per aggiornare le liste durante la ricerca
        $('#selectAmbulatori').empty().append($('<option>', {
            value: ambulatorio,
            text: ambulatorio,
            selected: true
        }));

        $('#selectPartiCorpo').empty().append($('<option>', {
            value: parteCorpo,
            text: parteCorpo,
            selected: true
        }));

        log('Liste aggiornate per ricerca', { ambulatorio, parteCorpo });
    }

    function ricaricaDatiCompleti() {
        log('Ricaricamento dati completi iniziato');

        $.post('/Home/GetDatiCompleti')
            .done(function (response) {
                if (response.success) {
                    popolaSelect('#selectAmbulatori', response.data.ambulatori);
                    popolaSelect('#selectPartiCorpo', response.data.parti);
                    popolaSelectEsami(response.data.esami);

                    // Auto-seleziona primi elementi (logica WinForms)
                    if (response.data.ambulatori.length > 0) {
                        $('#selectAmbulatori').prop('selectedIndex', 0);
                    }
                    if (response.data.parti.length > 0) {
                        $('#selectPartiCorpo').prop('selectedIndex', 0);
                    }
                    if (response.data.esami.length > 0) {
                        $('#selectEsami').prop('selectedIndex', 0);
                    }

                    log('Dati completi ricaricati con successo');
                } else {
                    mostraErrore(response.message || 'Errore durante il caricamento dei dati');
                }
            })
            .fail(function (xhr, status, error) {
                mostraErrore('Errore di comunicazione durante il caricamento dei dati');
            });
    }

    function popolaSelectEsami(esami) {
        const select = $('#selectEsami');
        select.empty();

        esami.forEach(function (esame) {
            const option = $('<option>', {
                value: esame.id,
                text: esame.descrizioneEsame, // Come nel WinForms, mostra solo la descrizione
                'data-codice-ministeriale': esame.codiceMinisteriale,
                'data-codice-interno': esame.codiceInterno,
                'data-ambulatorio': esame.ambulatorio,
                'data-parte-corpo': esame.parteCorpo
            });
            select.append(option);
        });

        log('Select esami popolato', { count: esami.length });
    }

    function aggiungiEsameSelezionato() {
        const esameOption = $('#selectEsami').find('option:selected');
        const ambulatorioSelezionato = $('#selectAmbulatori').find('option:selected');
        const parteCorpoSelezionata = $('#selectPartiCorpo').find('option:selected');

        // Validazione completa come nel WinForms
        if (esameOption.length === 0 || ambulatorioSelezionato.length === 0 || parteCorpoSelezionata.length === 0) {
            mostraErrore('Selezionare un esame completo prima di confermare la selezione');
            return;
        }

        const esame = {
            codiceMinisteriale: esameOption.data('codice-ministeriale') || '',
            codiceInterno: esameOption.data('codice-interno') || '',
            descrizioneEsame: esameOption.text(),
            ambulatorio: ambulatorioSelezionato.text(),
            parteCorpo: parteCorpoSelezionata.text()
        };

        // Aggiungi alla tabella (replica DataGridView del WinForms)
        const nuovaRiga = `
            <tr class="table-row-added">
                <td>${esame.codiceMinisteriale}</td>
                <td>${esame.codiceInterno}</td>
                <td>${esame.descrizioneEsame}</td>
                <td>${esame.ambulatorio}</td>
                <td>${esame.parteCorpo}</td>
            </tr>`;

        $('#tabellaEsamiSelezionati tbody').append(nuovaRiga);

        // Animazione di aggiunta
        const ultimaRiga = $('#tabellaEsamiSelezionati tbody tr:last');
        ultimaRiga.hide().fadeIn(300);

        mostraMessaggio('Esame aggiunto con successo!', 'success');
        log('Esame aggiunto alla tabella', esame);
    }

    function eliminaRigaSelezionata() {
        const rigaSelezionata = $('#tabellaEsamiSelezionati tbody tr.table-active');

        if (rigaSelezionata.length === 0) {
            mostraErrore('Selezionare una riga da eliminare');
            return;
        }

        // Animazione di rimozione
        rigaSelezionata.fadeOut(300, function () {
            $(this).remove();
            log('Riga eliminata dalla tabella');
        });
    }

    function spostaRiga(direzione) {
        const rigaSelezionata = $('#tabellaEsamiSelezionati tbody tr.table-active');

        if (rigaSelezionata.length === 0) {
            mostraErrore('Selezionare una riga da spostare');
            return;
        }

        const righe = $('#tabellaEsamiSelezionati tbody tr');
        const indiceCorrente = righe.index(rigaSelezionata);
        const nuovoIndice = indiceCorrente + direzione;

        // Verifica limiti (logica identica al WinForms)
        if (nuovoIndice < 0 || nuovoIndice >= righe.length) {
            return;
        }

        // Esegui spostamento con animazione
        rigaSelezionata.fadeOut(200, function () {
            if (direzione === -1) {
                rigaSelezionata.insertBefore(righe.eq(nuovoIndice));
            } else {
                rigaSelezionata.insertAfter(righe.eq(nuovoIndice));
            }

            rigaSelezionata.fadeIn(200);
            // Mantieni la selezione sulla riga spostata
            setTimeout(function () {
                rigaSelezionata.addClass('table-active');
            }, 250);
        });

        log('Riga spostata', { direzione, indiceCorrente, nuovoIndice });
    }

    // ==================== DEBUG E LOGGING ====================

    function log(messaggio, oggetto = null) {
        console.log(`[EsamiMain] ${messaggio}`, oggetto || '');
    }

    log('Script esami-main.js caricato correttamente');
    log('Configurazione iniziale', {
        ambulatori: $('#selectAmbulatori option').length,
        partiCorpo: $('#selectPartiCorpo option').length,
        esami: $('#selectEsami option').length,
        ricercaPredefinita: $('#ricercaPredefinita').val()
    });
});