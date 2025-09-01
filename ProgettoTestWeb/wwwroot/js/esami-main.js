// File: wwwroot/js/esami-main-winforms.js
// JavaScript che replica esattamente la logica di WinForms

$(document).ready(function () {
    // ==================== VARIABILI GLOBALI ====================
    let ambulatoriData = [];
    let partiCorpoData = [];
    let esamiData = [];
    let esamiSelezionati = [];
    let rigaSelezionata = -1;
    let inModalitaRicerca = false;

    // ==================== INIZIALIZZAZIONE ====================
    inizializzaApplicazione();

    function inizializzaApplicazione() {
        console.log('Inizializzazione app WinForms-like...');

        // Setup event handlers
        setupEventHandlers();

        // Carica dati iniziali
        caricaDatiIniziali();

        // Applica configurazioni predefinite se presenti
        applicaConfigurazioniPredefinite();
    }

    function setupEventHandlers() {
        // ==================== LISTBOX EVENTS ====================

        // Ambulatori - cambio selezione
        $('#listAmbulatori').on('change', function () {
            const ambulatorioSelezionato = $(this).val();
            if (ambulatorioSelezionato && !inModalitaRicerca) {
                console.log('Ambulatorio selezionato:', ambulatorioSelezionato);
                caricaPartiCorpoPerAmbulatorio(ambulatorioSelezionato);
            }
        });

        // Parti del Corpo - cambio selezione
        $('#listPartiCorpo').on('change', function () {
            const parteSelezionata = $(this).val();
            const ambulatorioSelezionato = $('#listAmbulatori').val();

            if (parteSelezionata && ambulatorioSelezionato && !inModalitaRicerca) {
                console.log('Parte del corpo selezionata:', parteSelezionata);
                caricaEsamiPerAmbulatorioEParte(ambulatorioSelezionato, parteSelezionata);
            }
        });

        // ==================== BOTTONI NAVIGAZIONE ====================

        // Ambulatorio Successivo (equivalente a >> in WinForms)
        $('#btnAmbulatorioSuccessivo').on('click', function () {
            const ambulatorioSelezionato = $('#listAmbulatori').val();
            if (ambulatorioSelezionato && !inModalitaRicerca) {
                caricaPartiCorpoPerAmbulatorio(ambulatorioSelezionato);
            } else {
                mostraMessageBox('Attenzione', 'Seleziona un ambulatorio dalla lista', 'warning');
            }
        });

        // Ambulatorio Reset
        $('#btnAmbulatorioReset').on('click', function () {
            resetSelezioniAmbulatorio();
        });

        // Parte Corpo Precedente (equivalente a << in WinForms)
        $('#btnParteCorpoPrecedente').on('click', function () {
            $('#listPartiCorpo').empty();
            $('#listEsami').empty();
            abilitaDisabilitaBottoni();
        });

        // Parte Corpo Successivo (equivalente a >> in WinForms)
        $('#btnParteCorpoSuccessivo').on('click', function () {
            const ambulatorioSelezionato = $('#listAmbulatori').val();
            const parteSelezionata = $('#listPartiCorpo').val();

            if (ambulatorioSelezionato && parteSelezionata && !inModalitaRicerca) {
                caricaEsamiPerAmbulatorioEParte(ambulatorioSelezionato, parteSelezionata);
            } else {
                mostraMessageBox('Attenzione', 'Seleziona ambulatorio e parte del corpo', 'warning');
            }
        });

        // Parte Corpo Reset
        $('#btnParteCorpoReset').on('click', function () {
            resetSelezioniParteCorpo();
        });

        // Esame Precedente (equivalente a << in WinForms)
        $('#btnEsamePrecedente').on('click', function () {
            $('#listEsami').empty();
            abilitaDisabilitaBottoni();
        });

        // ==================== RICERCA ====================

        $('#btnCerca').on('click', function () {
            eseguiRicerca();
        });

        $('#btnVediTutti').on('click', function () {
            resetRicercaECaricaTutti();
        });

        $('#testoRicerca').on('keypress', function (e) {
            if (e.which === 13) { // Enter
                eseguiRicerca();
            }
        });

        // ==================== GESTIONE ESAMI SELEZIONATI ====================

        $('#btnAggiungiEsame').on('click', function () {
            aggiungiEsameSelezionato();
        });

        // Selezione riga nella griglia (click su riga)
        $('#dataGridEsamiSelezionati tbody').on('click', 'tr', function () {
            if (!$(this).hasClass('empty-row')) {
                selezionaRigaGriglia($(this).index());
            }
        });

        // Bottoni gestione griglia
        $('#btnSpostaSu').on('click', function () {
            spostaSu();
        });

        $('#btnSpostaGiu').on('click', function () {
            spostaGiu();
        });

        $('#btnEliminaSelezionato').on('click', function () {
            eliminaEsameSelezionato();
        });

        $('#btnPulisciLista').on('click', function () {
            pulisciListaEsami();
        });

        $('#btnSalvaEsami').on('click', function () {
            salvaListaEsami();
        });
    }

    // ==================== CARICAMENTO DATI ====================

    function caricaDatiIniziali() {
        console.log('Caricamento dati iniziali...');

        // Gli ambulatori sono già nel DOM, popoliamo l'array
        $('#listAmbulatori option').each(function () {
            ambulatoriData.push($(this).val());
        });

        // Se ci sono ambulatori, seleziona il primo
        if (ambulatoriData.length > 0) {
            $('#listAmbulatori').val(ambulatoriData[0]);
            // NON caricare automaticamente le parti del corpo - come in WinForms
        }

        abilitaDisabilitaBottoni();
        aggiornaContatori();
    }

    function caricaPartiCorpoPerAmbulatorio(ambulatorio) {
        console.log('Caricando parti del corpo per:', ambulatorio);

        mostraLoading();

        $.post('/Home/GetPartiCorpo', { ambulatorio: ambulatorio })
            .done(function (response) {
                if (response.success) {
                    partiCorpoData = response.data;
                    popolaListPartiCorpo(response.data);

                    // Pulisci lista esami
                    $('#listEsami').empty();
                    esamiData = [];
                } else {
                    mostraMessageBox('Errore', response.message || 'Errore nel caricamento parti del corpo', 'error');
                }
            })
            .fail(function () {
                mostraMessageBox('Errore', 'Errore di connessione nel caricamento parti del corpo', 'error');
            })
            .always(function () {
                nascondiLoading();
                abilitaDisabilitaBottoni();
            });
    }

    function caricaEsamiPerAmbulatorioEParte(ambulatorio, parteCorpo) {
        console.log('Caricando esami per:', ambulatorio, '-', parteCorpo);

        mostraLoading();

        $.post('/Home/GetEsami', {
            ambulatorio: ambulatorio,
            parteCorpo: parteCorpo
        })
            .done(function (response) {
                if (response.success) {
                    esamiData = response.data;
                    popolaListEsami(response.data);
                } else {
                    mostraMessageBox('Errore', response.message || 'Errore nel caricamento esami', 'error');
                }
            })
            .fail(function () {
                mostraMessageBox('Errore', 'Errore di connessione nel caricamento esami', 'error');
            })
            .always(function () {
                nascondiLoading();
                abilitaDisabilitaBottoni();
            });
    }

    // ==================== POPOLAMENTO LISTE ====================

    function popolaListPartiCorpo(parti) {
        const list = $('#listPartiCorpo');
        list.empty();

        parti.forEach(function (parte) {
            list.append(new Option(parte, parte));
        });

        console.log('Caricate', parti.length, 'parti del corpo');
    }

    function popolaListEsami(esami) {
        const list = $('#listEsami');
        list.empty();

        esami.forEach(function (esame) {
            // Mostra solo la descrizione nella lista, come in WinForms
            const option = new Option(esame.descrizioneEsame, esame.id);
            option.dataset.esame = JSON.stringify(esame);
            list.append(option);
        });

        console.log('Caricati', esami.length, 'esami');
    }

    // ==================== RICERCA ====================

    function eseguiRicerca() {
        const filtro = $('#testoRicerca').val().trim();
        const campo = $('#campoRicerca').val();

        if (!filtro) {
            mostraMessageBox('Attenzione', 'Inserire un testo di ricerca', 'warning');
            $('#testoRicerca').focus();
            return;
        }

        console.log('Eseguendo ricerca:', campo, '=', filtro);

        mostraLoading();
        inModalitaRicerca = true;

        $.post('/Home/RicercaEsami', {
            filtro: filtro,
            campo: campo
        })
            .done(function (response) {
                if (response.success) {
                    // Modalità ricerca: svuota le altre liste e mostra solo i risultati
                    $('#listAmbulatori').empty().append(new Option('*** RISULTATI RICERCA ***', ''));
                    $('#listPartiCorpo').empty().append(new Option('*** RISULTATI RICERCA ***', ''));

                    // Popola solo la lista esami con i risultati
                    popolaListEsami(response.data);

                    mostraMessageBox('Successo', `Trovati ${response.data.length} esami corrispondenti`, 'success');
                } else {
                    mostraMessageBox('Errore', response.message || 'Errore nella ricerca', 'error');
                }
            })
            .fail(function () {
                mostraMessageBox('Errore', 'Errore di connessione nella ricerca', 'error');
            })
            .always(function () {
                nascondiLoading();
                abilitaDisabilitaBottoni();
            });
    }

    function resetRicercaECaricaTutti() {
        console.log('Reset ricerca e caricamento tutti i dati');

        // Pulisci campo ricerca
        $('#testoRicerca').val('');
        inModalitaRicerca = false;

        mostraLoading();

        $.post('/Home/GetDatiCompleti')
            .done(function (response) {
                if (response.success) {
                    const data = response.data;

                    // Ripopolazione delle liste
                    ambulatoriData = data.ambulatori;
                    partiCorpoData = [];
                    esamiData = [];

                    // Riempie la lista ambulatori
                    const listAmb = $('#listAmbulatori');
                    listAmb.empty();
                    data.ambulatori.forEach(function (amb) {
                        listAmb.append(new Option(amb, amb));
                    });

                    // Pulisci le altre liste
                    $('#listPartiCorpo').empty();
                    $('#listEsami').empty();

                    // Auto-seleziona il primo ambulatorio se disponibile
                    if (data.ambulatori.length > 0) {
                        listAmb.val(data.ambulatori[0]);
                    }

                    mostraMessageBox('Successo', 'Dati ricaricati correttamente', 'success');
                } else {
                    mostraMessageBox('Errore', response.message || 'Errore nel caricamento dati', 'error');
                }
            })
            .fail(function () {
                mostraMessageBox('Errore', 'Errore di connessione nel caricamento dati', 'error');
            })
            .always(function () {
                nascondiLoading();
                abilitaDisabilitaBottoni();
            });
    }

    // ==================== GESTIONE ESAMI SELEZIONATI ====================

    function aggiungiEsameSelezionato() {
        const esameOption = $('#listEsami option:selected');

        if (esameOption.length === 0) {
            mostraMessageBox('Attenzione', 'Seleziona un esame dalla lista', 'warning');
            return;
        }

        try {
            const esameData = JSON.parse(esameOption.data('esame'));

            // Controlla se l'esame è già presente (come in WinForms)
            const esistente = esamiSelezionati.find(e => e.id === esameData.id);
            if (esistente) {
                mostraMessageBox('Attenzione', 'Esame già presente nella lista selezionati', 'warning');
                return;
            }

            // Aggiungi alla lista
            esamiSelezionati.push(esameData);
            aggiornaGrigliaEsami();
            aggiornaContatori();

            console.log('Esame aggiunto:', esameData.descrizioneEsame);
            mostraMessageBox('Successo', `Esame "${esameData.descrizioneEsame}" aggiunto alla lista`, 'success');

        } catch (error) {
            console.error('Errore nel parsing dei dati esame:', error);
            mostraMessageBox('Errore', 'Errore nell\'elaborazione dei dati esame', 'error');
        }
    }

    function aggiornaGrigliaEsami() {
        const tbody = $('#dataGridEsamiSelezionati tbody');
        tbody.empty();

        if (esamiSelezionati.length === 0) {
            // Mostra riga vuota come in WinForms
            tbody.append(`
                <tr class="empty-row">
                    <td colspan="5" class="text-center text-muted py-4">
                        <em>Nessun esame selezionato. Utilizzare "AGGIUNGI ESAME" per aggiungere esami alla lista.</em>
                    </td>
                </tr>
            `);
        } else {
            esamiSelezionati.forEach(function (esame, index) {
                const isSelected = index === rigaSelezionata;
                const row = `
                    <tr data-index="${index}" ${isSelected ? 'class="selected"' : ''}>
                        <td>${esame.codiceMinisteriale}</td>
                        <td>${esame.codiceInterno}</td>
                        <td>${esame.descrizioneEsame}</td>
                        <td>${esame.ambulatorio}</td>
                        <td>${esame.parteCorpo}</td>
                    </tr>
                `;
                tbody.append(row);
            });
        }

        abilitaDisabilitaBottoni();
    }

    function selezionaRigaGriglia(index) {
        rigaSelezionata = index;
        console.log('Riga selezionata:', index);
        aggiornaGrigliaEsami(); // Riaggiorna per evidenziare la selezione
    }

    function spostaSu() {
        if (rigaSelezionata <= 0 || esamiSelezionati.length < 2) {
            mostraMessageBox('Attenzione', 'Seleziona una riga da spostare (non la prima)', 'warning');
            return;
        }

        // Scambia elementi (come in WinForms)
        const temp = esamiSelezionati[rigaSelezionata];
        esamiSelezionati[rigaSelezionata] = esamiSelezionati[rigaSelezionata - 1];
        esamiSelezionati[rigaSelezionata - 1] = temp;

        rigaSelezionata--;
        aggiornaGrigliaEsami();

        console.log('Esame spostato su');
    }

    function spostaGiu() {
        if (rigaSelezionata < 0 || rigaSelezionata >= esamiSelezionati.length - 1) {
            mostraMessageBox('Attenzione', 'Seleziona una riga da spostare (non l\'ultima)', 'warning');
            return;
        }

        // Scambia elementi (come in WinForms)
        const temp = esamiSelezionati[rigaSelezionata];
        esamiSelezionati[rigaSelezionata] = esamiSelezionati[rigaSelezionata + 1];
        esamiSelezionati[rigaSelezionata + 1] = temp;

        rigaSelezionata++;
        aggiornaGrigliaEsami();

        console.log('Esame spostato giù');
    }

    function eliminaEsameSelezionato() {
        if (rigaSelezionata < 0 || rigaSelezionata >= esamiSelezionati.length) {
            mostraMessageBox('Attenzione', 'Seleziona una riga da eliminare', 'warning');
            return;
        }

        const esameEliminato = esamiSelezionati[rigaSelezionata];

        // Conferma eliminazione (come MessageBox.Show in WinForms)
        if (confirm(`Eliminare l'esame "${esameEliminato.descrizioneEsame}" dalla lista?`)) {
            // Rimuovi dall'array
            esamiSelezionati.splice(rigaSelezionata, 1);

            // Aggiusta la selezione
            if (rigaSelezionata >= esamiSelezionati.length) {
                rigaSelezionata = esamiSelezionati.length - 1;
            }

            aggiornaGrigliaEsami();
            aggiornaContatori();

            console.log('Esame eliminato:', esameEliminato.descrizioneEsame);
            mostraMessageBox('Successo', 'Esame eliminato dalla lista', 'success');
        }
    }

    function pulisciListaEsami() {
        if (esamiSelezionati.length === 0) {
            mostraMessageBox('Attenzione', 'La lista è già vuota', 'warning');
            return;
        }

        // Conferma pulizia (come MessageBox.Show in WinForms)
        if (confirm(`Eliminare tutti i ${esamiSelezionati.length} esami dalla lista?`)) {
            esamiSelezionati = [];
            rigaSelezionata = -1;
            aggiornaGrigliaEsami();
            aggiornaContatori();

            console.log('Lista esami pulita');
            mostraMessageBox('Successo', 'Lista esami pulita', 'success');
        }
    }

    function salvaListaEsami() {
        if (esamiSelezionati.length === 0) {
            mostraMessageBox('Attenzione', 'Nessun esame da salvare', 'warning');
            return;
        }

        // Simulazione salvataggio (in WinForms andresti su DB o file)
        console.log('Salvataggio lista esami:', esamiSelezionati);

        // Potresti implementare qui una chiamata AJAX per salvare su DB
        mostraMessageBox('Successo', `Lista di ${esamiSelezionati.length} esami salvata correttamente`, 'success');
    }

    // ==================== RESET E NAVIGAZIONE ====================

    function resetSelezioniAmbulatorio() {
        $('#listAmbulatori').val('');
        $('#listPartiCorpo').empty();
        $('#listEsami').empty();
        partiCorpoData = [];
        esamiData = [];
        abilitaDisabilitaBottoni();
        console.log('Reset selezioni ambulatorio');
    }

    function resetSelezioniParteCorpo() {
        $('#listPartiCorpo').val('');
        $('#listEsami').empty();
        esamiData = [];
        abilitaDisabilitaBottoni();
        console.log('Reset selezioni parte corpo');
    }

    // ==================== UTILITY E UI ====================

    function abilitaDisabilitaBottoni() {
        const ambulatorioSelezionato = $('#listAmbulatori').val();
        const parteSelezionata = $('#listPartiCorpo').val();
        const esameSelezionato = $('#listEsami').val();
        const hasPartiCorpo = $('#listPartiCorpo option').length > 0;
        const hasEsami = $('#listEsami option').length > 0;
        const hasEsamiSelezionati = esamiSelezionati.length > 0;
        const rigaValida = rigaSelezionata >= 0 && rigaSelezionata < esamiSelezionati.length;

        // Bottoni ambulatorio
        $('#btnAmbulatorioSuccessivo').prop('disabled', !ambulatorioSelezionato || inModalitaRicerca);
        $('#btnAmbulatorioReset').prop('disabled', false);

        // Bottoni parte corpo
        $('#btnParteCorpoPrecedente').prop('disabled', !hasPartiCorpo);
        $('#btnParteCorpoSuccessivo').prop('disabled', !parteSelezionata || inModalitaRicerca);
        $('#btnParteCorpoReset').prop('disabled', !hasPartiCorpo);

        // Bottoni esame
        $('#btnEsamePrecedente').prop('disabled', !hasEsami);
        $('#btnAggiungiEsame').prop('disabled', !esameSelezionato);

        // Bottoni griglia
        $('#btnSpostaSu').prop('disabled', !rigaValida || rigaSelezionata <= 0);
        $('#btnSpostaGiu').prop('disabled', !rigaValida || rigaSelezionata >= esamiSelezionati.length - 1);
        $('#btnEliminaSelezionato').prop('disabled', !rigaValida);
        $('#btnPulisciLista').prop('disabled', !hasEsamiSelezionati);
        $('#btnSalvaEsami').prop('disabled', !hasEsamiSelezionati);
    }

    function aggiornaContatori() {
        $('#contatoreEsami').text(esamiSelezionati.length);
    }

    function applicaConfigurazioniPredefinite() {
        // Applica configurazioni predefinite dal server se presenti
        const testoRicerca = $('#testoRicerca').val();
        if (testoRicerca && testoRicerca.trim()) {
            console.log('Applicando ricerca predefinita:', testoRicerca);
            setTimeout(function () {
                eseguiRicerca();
            }, 500);
        }
    }

    function mostraLoading() {
        if (window.AppUtils && window.AppUtils.mostraLoading) {
            window.AppUtils.mostraLoading();
        }
    }

    function nascondiLoading() {
        if (window.AppUtils && window.AppUtils.nascondiLoading) {
            window.AppUtils.nascondiLoading();
        }
    }

    function mostraMessageBox(titolo, messaggio, tipo = 'info') {
        // Simula MessageBox.Show di WinForms
        console.log(`${titolo}: ${messaggio}`);

        $('#messageBoxTitle').text(titolo);
        $('#messageBoxMessage').text(messaggio);

        // Icona in base al tipo
        const iconClass = tipo === 'error' ? 'bi-exclamation-triangle text-danger' :
            tipo === 'warning' ? 'bi-exclamation-triangle text-warning' :
                tipo === 'success' ? 'bi-check-circle text-success' :
                    'bi-info-circle text-primary';

        $('#messageBoxIcon').attr('class', `bi ${iconClass} me-2`);

        $('#messageBoxModal').modal('show');
    }

    // ==================== DEBUG E LOG ====================

    // Debug: Mostra stato corrente (utile per troubleshooting)
    window.debugEsamiApp = function () {
        console.log('=== DEBUG ESAMI APP ===');
        console.log('Ambulatori data:', ambulatoriData);
        console.log('Parti corpo data:', partiCorpoData);
        console.log('Esami data:', esamiData);
        console.log('Esami selezionati:', esamiSelezionati);
        console.log('Riga selezionata:', rigaSelezionata);
        console.log('In modalità ricerca:', inModalitaRicerca);
        console.log('========================');
    };

    console.log('App WinForms-like inizializzata correttamente');
});