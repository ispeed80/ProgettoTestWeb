$(document).ready(() => {
    // Variabili globali
    let esamiSelezionati: any[] = [];
    let inModalitaRicerca = false;

    // Inizializzazione
    inizializza();

    function inizializza() {
        const selectAmbulatori = $('#selectAmbulatori');
        const selectPartiCorpo = $('#selectPartiCorpo');
        const selectEsami = $('#selectEsami');

        // Seleziona il primo ambulatorio se presente
        if (selectAmbulatori.length && selectAmbulatori.find('option').length > 0) {
            selectAmbulatori.find('option:first').prop('selected', true);
            caricaPartiCorpo();
        }

        // Applica configurazioni predefinite se presenti
        applicaConfigurazioniPredefinite();

        // Event listeners
        if (selectAmbulatori.length) selectAmbulatori.change(onAmbulatorioChange);
        if (selectPartiCorpo.length) selectPartiCorpo.change(onParteCorpoChange);
        if (selectEsami.length) selectEsami.change(onEsameChange);

        const btnCerca = $('#btnCerca');
        const btnVediTutti = $('#btnVediTutti');
        const testoRicerca = $('#testoRicerca');
        const btnConfermaEsame = $('#btnConfermaEsame');
        const btnSpostaSu = $('#btnSpostaSu');
        const btnSpostaGiu = $('#btnSpostaGiu');
        const btnEliminaRiga = $('#btnEliminaRiga');

        if (btnCerca.length) btnCerca.click(eseguiRicerca);
        if (btnVediTutti.length) btnVediTutti.click(resetRicerca);
        if (testoRicerca.length) testoRicerca.keypress(onRicercaKeyPress);
        if (btnConfermaEsame.length) btnConfermaEsame.click(confermaEsame);
        if (btnSpostaSu.length) btnSpostaSu.click(() => spostaEsame('su'));
        if (btnSpostaGiu.length) btnSpostaGiu.click(() => spostaEsame('giu'));
        if (btnEliminaRiga.length) btnEliminaRiga.click(eliminaRiga);

        // Doppio click sulla tabella per eliminare
        const tabella = $('#tabellaEsamiSelezionati tbody');
        if (tabella.length) {
            tabella.on('dblclick', 'tr', function () {
                const index = $(this).index();
                eliminaEsame(index);
            });
        }
    }

    function applicaConfigurazioniPredefinite() {
        const ricercaPredefinita = $('#testoRicerca').val() as string;
        if (ricercaPredefinita && ricercaPredefinita.trim() !== '') {
            eseguiRicerca();
        }
    }

    function onAmbulatorioChange() {
        if (inModalitaRicerca) resetRicerca();
        caricaPartiCorpo();
    }

    function onParteCorpoChange() {
        if (inModalitaRicerca) resetRicerca();
        caricaEsami();
    }

    function onEsameChange() {
        if (!inModalitaRicerca) return;
        const esameSelezionato = $('#selectEsami option:selected');
        if (!esameSelezionato.length) return;

        const ambulatorio = esameSelezionato.data('ambulatorio');
        const parteCorpo = esameSelezionato.data('partecorpo');

        if (ambulatorio && parteCorpo) {
            aggiornaPanelliPerRicerca(ambulatorio, parteCorpo);
        }
    }

    function onRicercaKeyPress(e: JQuery.KeyPressEvent) {
        if (e.which === 13) {
            e.preventDefault();
            eseguiRicerca();
        }
    }

    // Funzioni di caricamento dati
    function caricaPartiCorpo() {
        const ambulatorio = $('#selectAmbulatori').val() as string;
        if (!ambulatorio) return;

        $.get('/Home/GetPartiCorpo', { ambulatorio })
            .done((response: any) => {
                if (response.success) {
                    aggiornaSelect('#selectPartiCorpo', response.data);
                    caricaEsami();
                } else {
                    mostraMessaggio('Errore', response.message, 'danger');
                }
            })
            .fail(() => mostraMessaggio('Errore', 'Errore di comunicazione con il server', 'danger'));
    }

    function caricaEsami() {
        const ambulatorio = $('#selectAmbulatori').val() as string;
        const parteCorpo = $('#selectPartiCorpo').val() as string;

        if (!ambulatorio || !parteCorpo) {
            $('#selectEsami').empty();
            return;
        }

        $.get('/Home/GetEsami', { ambulatorio, parteCorpo })
            .done((response: any) => {
                if (response.success) {
                    aggiornaSelectEsami(response.data);
                } else {
                    mostraMessaggio('Errore', response.message, 'danger');
                }
            })
            .fail(() => mostraMessaggio('Errore', 'Errore di comunicazione con il server', 'danger'));
    }

    // … il resto delle funzioni rimane invariato, usando sempre il check su .length
});
