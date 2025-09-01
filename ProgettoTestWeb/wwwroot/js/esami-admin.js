// File: wwwroot/js/esami-admin.js
// JavaScript per Admin che replica la logica WinForms

$(document).ready(function () {
    // ==================== VARIABILI GLOBALI ====================
    let ambulatorioSelezionato = null;
    let parteCorpoSelezionata = null;
    let esameSelezionato = null;

    // ==================== INIZIALIZZAZIONE ====================
    inizializzaAdminApp();

    function inizializzaAdminApp() {
        console.log('Inizializzazione Admin WinForms-like...');

        setupEventHandlers();
        setupDataGridSelection();
        abilitaDisabilitaBottoniAdmin();
    }

    function setupEventHandlers() {
        // ==================== BOTTONI AMBULATORI ====================
        $('#btnAggiungiAmbulatorio').on('click', function () {
            mostraFormAggiungiAmbulatorio();
        });

        $('#btnEliminaAmbulatorio').on('click', function () {
            eliminaAmbulatorioSelezionato();
        });

        $('#btnSalvaAmbulatorio').on('click', function () {
            salvaAmbulatorio();
        });

        // ==================== BOTTONI PARTI DEL CORPO ====================
        $('#btnAggiungiParteCorpo').on('click', function () {
            mostraFormAggiungiParteCorpo();
        });

        $('#btnEliminaParteCorpo').on('click', function () {
            eliminaParteCorpoSelezionata();
        });

        $('#btnSalvaParteCorpo').on('click', function () {
            salvaParteCorpo();
        });

        // ==================== BOTTONI ESAMI ====================
        $('#btnAggiungiEsame').on('click', function () {
            mostraFormAggiungiEsame();
        });

        $('#btnEliminaEsame').on('click', function () {
            eliminaEsameSelezionato();
        });

        // ==================== EVENTI TASTIERA (come WinForms) ====================
        $('#nomeAmbulatorio').on('keypress', function (e) {
            if (e.which === 13) { // Enter
                salvaAmbulatorio();
            }
        });

        $('#nomeParteCorpo').on('keypress', function (e) {
            if (e.which === 13) { // Enter
                salvaParteCorpo();
            }
        });

        // ==================== VALIDAZIONE FORM ESAME ====================
        $('#modalAggiungiEsame form').on('submit', function (e) {
            const ambulatoriSelezionati = $('input[name="NuovoEsame.AmbulatoriSelezionati"]:checked');

            if (ambulatoriSelezionati.length === 0) {
                e.preventDefault();
                $('#ambulatoriError').text('Selezionare almeno un ambulatorio');
                mostraAdminMessageBox('Errore', 'Selezionare almeno un ambulatorio per l\'esame', 'error');
                return false;
            }

            $('#ambulatoriError').text('');
            return true;
        });
    }

    function setupDataGridSelection() {
        // ==================== SELEZIONE RIGHE AMBULATORI ====================
        $('#gridAmbulatori').on('click', 'tr.admin-row-selectable', function () {
            // Rimuovi selezione precedente
            $('#gridAmbulatori tr').removeClass('selected');

            // Seleziona la riga corrente
            $(this).addClass('selected');

            // Salva dati selezionati
            ambulatorioSelezionato = {
                id: parseInt($(this).data('id')),
                nome: $(this).find('td:last').text().trim()
            };

            console.log('Ambulatorio selezionato:', ambulatorioSelezionato);
            abilitaDisabilitaBottoniAdmin();
        });

        // ==================== SELEZIONE RIGHE PARTI DEL CORPO ====================
        $('#gridPartiCorpo').on('click', 'tr.admin-row-selectable', function () {
            $('#gridPartiCorpo tr').removeClass('selected');
            $(this).addClass('selected');

            parteCorpoSelezionata = {
                id: parseInt($(this).data('id')),
                nome: $(this).find('td:last').text().trim()
            };

            console.log('Parte del corpo selezionata:', parteCorpoSelezionata);
            abilitaDisabilitaBottoniAdmin();
        });

        // ==================== SELEZIONE RIGHE ESAMI ====================
        $('#gridEsami').on('click', 'tr.admin-row-selectable', function () {
            $('#gridEsami tr').removeClass('selected');
            $(this).addClass('selected');

            esameSelezionato = {
                id: parseInt($(this).data('id'))
            };

            console.log('Esame selezionato:', esameSelezionato);
            abilitaDisabilitaBottoniAdmin();
        });

        // ==================== DOPPIO CLICK PER MODIFICA (come WinForms) ====================
        $('#gridAmbulatori').on('dblclick', 'tr.admin-row-selectable', function () {
            // In WinForms spesso il doppio click apre la form di modifica
            // Per ora apriamo la form di aggiunta pre-compilata
            const nome = $(this).find('td:last').text().trim();
            $('#nomeAmbulatorio').val(nome);
            $('#modalAggiungiAmbulatorio').modal('show');
        });

        $('#gridPartiCorpo').on('dblclick', 'tr.admin-row-selectable', function () {
            const nome = $(this).find('td:last').text().trim();
            $('#nomeParteCorpo').val(nome);
            $('#modalAggiungiParteCorpo').modal('show');
        });
    }

    // ==================== FUNZIONI AMBULATORI ====================

    function mostraFormAggiungiAmbulatorio() {
        $('#nomeAmbulatorio').val('');
        $('#modalAggiungiAmbulatorio').modal('show');

        // Focus automatico sul campo (come WinForms)
        $('#modalAggiungiAmbulatorio').on('shown.bs.modal', function () {
            $('#nomeAmbulatorio').focus();
        });
    }

    function salvaAmbulatorio() {
        const nome = $('#nomeAmbulatorio').val().trim();

        if (!nome) {
            mostraAdminMessageBox('Errore', 'Inserire il nome dell\'ambulatorio', 'error');
            $('#nomeAmbulatorio').focus();
            return;
        }

        // Validazione lunghezza (come MaxLength in WinForms)
        if (nome.length > 100) {
            mostraAdminMessageBox('Errore', 'Il nome non può superare i 100 caratteri', 'error');
            $('#nomeAmbulatorio').focus();
            return;
        }

        console.log('Salvando ambulatorio:', nome);
        mostraLoading();

        const data = { Nome: nome };

        $.ajax({
            url: '/Admin/AggiungiAmbulatorio',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                if (response.success) {
                    $('#modalAggiungiAmbulatorio').modal('hide');
                    mostraAdminMessageBox('Successo', response.message || 'Ambulatorio aggiunto correttamente', 'success');
                    ricaricaPagina();
                } else {
                    mostraAdminMessageBox('Errore', response.message || 'Errore durante il salvataggio', 'error');
                }
            },
            error: function (xhr) {
                console.error('Errore AJAX:', xhr);
                mostraAdminMessageBox('Errore', 'Errore di connessione durante il salvataggio', 'error');
            },
            complete: function () {
                nascondiLoading();
            }
        });
    }

    function eliminaAmbulatorioSelezionato() {
        if (!ambulatorioSelezionato) {
            mostraAdminMessageBox('Attenzione', 'Selezionare un ambulatorio da eliminare', 'warning');
            return;
        }

        // Conferma eliminazione (come MessageBox.Show in WinForms)
        const messaggio = `Eliminare l'ambulatorio "${ambulatorioSelezionato.nome}"?\n\nL'operazione non può essere annullata.`;

        if (!confirm(messaggio)) {
            return;
        }

        console.log('Eliminando ambulatorio:', ambulatorioSelezionato);
        mostraLoading();

        const data = { Id: ambulatorioSelezionato.id };

        $.ajax({
            url: '/Admin/EliminaAmbulatorio',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                if (response.success) {
                    mostraAdminMessageBox('Successo', response.message || 'Ambulatorio eliminato correttamente', 'success');
                    ambulatorioSelezionato = null;
                    ricaricaPagina();
                } else {
                    mostraAdminMessageBox('Errore', response.message || 'Errore durante l\'eliminazione', 'error');
                }
            },
            error: function (xhr) {
                console.error('Errore AJAX:', xhr);
                const errorMessage = xhr.status === 409 ?
                    'Impossibile eliminare: ambulatorio utilizzato da altri esami' :
                    'Errore di connessione durante l\'eliminazione';
                mostraAdminMessageBox('Errore', errorMessage, 'error');
            },
            complete: function () {
                nascondiLoading();
            }
        });
    }

    // ==================== FUNZIONI PARTI DEL CORPO ====================

    function mostraFormAggiungiParteCorpo() {
        $('#nomeParteCorpo').val('');
        $('#modalAggiungiParteCorpo').modal('show');

        $('#modalAggiungiParteCorpo').on('shown.bs.modal', function () {
            $('#nomeParteCorpo').focus();
        });
    }

    function salvaParteCorpo() {
        const nome = $('#nomeParteCorpo').val().trim();

        if (!nome) {
            mostraAdminMessageBox('Errore', 'Inserire il nome della parte del corpo', 'error');
            $('#nomeParteCorpo').focus();
            return;
        }

        if (nome.length > 100) {
            mostraAdminMessageBox('Errore', 'Il nome non può superare i 100 caratteri', 'error');
            $('#nomeParteCorpo').focus();
            return;
        }

        console.log('Salvando parte del corpo:', nome);
        mostraLoading();

        const data = { Nome: nome };

        $.ajax({
            url: '/Admin/AggiungiParteCorpo',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                if (response.success) {
                    $('#modalAggiungiParteCorpo').modal('hide');
                    mostraAdminMessageBox('Successo', response.message || 'Parte del corpo aggiunta correttamente', 'success');
                    ricaricaPagina();
                } else {
                    mostraAdminMessageBox('Errore', response.message || 'Errore durante il salvataggio', 'error');
                }
            },
            error: function (xhr) {
                console.error('Errore AJAX:', xhr);
                mostraAdminMessageBox('Errore', 'Errore di connessione durante il salvataggio', 'error');
            },
            complete: function () {
                nascondiLoading();
            }
        });
    }

    function eliminaParteCorpoSelezionata() {
        if (!parteCorpoSelezionata) {
            mostraAdminMessageBox('Attenzione', 'Selezionare una parte del corpo da eliminare', 'warning');
            return;
        }

        const messaggio = `Eliminare la parte del corpo "${parteCorpoSelezionata.nome}"?\n\nL'operazione non può essere annullata.`;

        if (!confirm(messaggio)) {
            return;
        }

        console.log('Eliminando parte del corpo:', parteCorpoSelezionata);
        mostraLoading();

        const data = { Id: parteCorpoSelezionata.id };

        $.ajax({
            url: '/Admin/EliminaParteCorpo',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                if (response.success) {
                    mostraAdminMessageBox('Successo', response.message || 'Parte del corpo eliminata correttamente', 'success');
                    parteCorpoSelezionata = null;
                    ricaricaPagina();
                } else {
                    mostraAdminMessageBox('Errore', response.message || 'Errore durante l\'eliminazione', 'error');
                }
            },
            error: function (xhr) {
                console.error('Errore AJAX:', xhr);
                const errorMessage = xhr.status === 409 ?
                    'Impossibile eliminare: parte del corpo utilizzata da altri esami' :
                    'Errore di connessione durante l\'eliminazione';
                mostraAdminMessageBox('Errore', errorMessage, 'error');
            },
            complete: function () {
                nascondiLoading();
            }
        });
    }

    // ==================== FUNZIONI ESAMI ====================

    function mostraFormAggiungiEsame() {
        resetFormEsame();
        $('#modalAggiungiEsame').modal('show');

        $('#modalAggiungiEsame').on('shown.bs.modal', function () {
            $('#NuovoEsame_CodiceMinisteriale').focus();
        });
    }

    function resetFormEsame() {
        $('#modalAggiungiEsame input[type="text"]').val('');
        $('#modalAggiungiEsame select').val('');
        $('#modalAggiungiEsame input[type="checkbox"]').prop('checked', false);
        $('#ambulatoriError').text('');
    }

    function eliminaEsameSelezionato() {
        if (!esameSelezionato) {
            mostraAdminMessageBox('Attenzione', 'Selezionare un esame da eliminare', 'warning');
            return;
        }

        if (!confirm('Eliminare l\'esame selezionato?\n\nL\'operazione non può essere annullata.')) {
            return;
        }

        console.log('Eliminando esame:', esameSelezionato);
        mostraLoading();

        const data = { Id: esameSelezionato.id };

        $.ajax({
            url: '/Admin/EliminaEsame',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                if (response.success) {
                    mostraAdminMessageBox('Successo', response.message || 'Esame eliminato correttamente', 'success');
                    esameSelezionato = null;
                    ricaricaPagina();
                } else {
                    mostraAdminMessageBox('Errore', response.message || 'Errore durante l\'eliminazione', 'error');
                }
            },
            error: function (xhr) {
                console.error('Errore AJAX:', xhr);
                mostraAdminMessageBox('Errore', 'Errore di connessione durante l\'eliminazione', 'error');
            },
            complete: function () {
                nascondiLoading();
            }
        });
    }

    // ==================== UTILITY E UI ====================

    function abilitaDisabilitaBottoniAdmin() {
        // Abilita/disabilita bottoni in base alle selezioni (come WinForms)
        $('#btnEliminaAmbulatorio').prop('disabled', !ambulatorioSelezionato);
        $('#btnEliminaParteCorpo').prop('disabled', !parteCorpoSelezionata);
        $('#btnEliminaEsame').prop('disabled', !esameSelezionato);
    }

    function ricaricaPagina() {
        // Ricarica la pagina per aggiornare i dati
        // In WinForms faresti il refresh delle DataGridView
        setTimeout(function () {
            location.reload();
        }, 1500);
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

    function mostraAdminMessageBox(titolo, messaggio, tipo = 'info') {
        // Simula MessageBox.Show di WinForms
        console.log(`${titolo}: ${messaggio}`);

        $('#adminMessageTitle').text(titolo);
        $('#adminMessageText').text(messaggio);

        // Icona in base al tipo
        const iconClass = tipo === 'error' ? 'bi-exclamation-triangle text-danger' :
            tipo === 'warning' ? 'bi-exclamation-triangle text-warning' :
                tipo === 'success' ? 'bi-check-circle text-success' :
                    'bi-info-circle text-primary';

        $('#adminMessageIcon').attr('class', `bi ${iconClass} me-2`);

        $('#adminMessageBox').modal('show');
    }

    // ==================== DEBUG ====================

    // Funzione debug per controllare lo stato
    window.debugAdminApp = function () {
        console.log('=== DEBUG ADMIN APP ===');
        console.log('Ambulatorio selezionato:', ambulatorioSelezionato);
        console.log('Parte corpo selezionata:', parteCorpoSelezionata);
        console.log('Esame selezionato:', esameSelezionato);
        console.log('========================');
    };

    console.log('Admin WinForms-like inizializzato correttamente');
});