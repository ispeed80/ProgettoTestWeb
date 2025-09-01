using Microsoft.AspNetCore.Mvc;
using ProgettoTestWeb.Models;
using ProgettoTestWeb.Services;
using ProgettoTestWeb.Configuration;

namespace ProgettoTestWeb.Controllers
{
    public class HomeController : Controller
    {
        private readonly IEsameService _esameService;
        private readonly IConfiguration _configuration;

        public HomeController(IEsameService esameService, IConfiguration configuration)
        {
            _esameService = esameService;
            _configuration = configuration;
        }

        public async Task<IActionResult> Index()
        {
            try
            {
                // Carica configurazione predefinita
                ConfigLoader.CaricaConfigurazione(_configuration);

                var viewModel = new MainViewModel();
                await CaricaDatiIniziali(viewModel);

                // Applica configurazioni predefinite
                ApplicaConfigurazioniPredefinite(viewModel);

                return View(viewModel);
            }
            catch (Exception ex)
            {
                var viewModel = new MainViewModel
                {
                    MessaggioErrore = $"Errore durante il caricamento: {ex.Message}"
                };
                return View(viewModel);
            }
        }

        private async Task CaricaDatiIniziali(MainViewModel viewModel)
        {
            viewModel.Ambulatori = await _esameService.GetAmbulatoriAsync();

            // Se ci sono ambulatori, seleziona il primo e carica le parti del corpo
            if (viewModel.Ambulatori.Any())
            {
                viewModel.AmbulatorioSelezionato = viewModel.Ambulatori.First();
                viewModel.PartiCorpo = await _esameService.GetPartiCorpoPerAmbulatorioAsync(viewModel.AmbulatorioSelezionato);

                // Se ci sono parti del corpo, seleziona la prima e carica gli esami
                if (viewModel.PartiCorpo.Any())
                {
                    viewModel.ParteCorpoSelezionata = viewModel.PartiCorpo.First();
                    viewModel.Esami = await _esameService.GetEsamiPerAmbulatorioEParteAsync(
                        viewModel.AmbulatorioSelezionato,
                        viewModel.ParteCorpoSelezionata);
                }
            }
        }

        private void ApplicaConfigurazioniPredefinite(MainViewModel viewModel)
        {
            // Imposta il tipo di ricerca predefinito
            if (!string.IsNullOrEmpty(Predefiniti_Ricerca.TipoRicercaPredefinito))
            {
                viewModel.CampoRicerca = Predefiniti_Ricerca.TipoRicercaPredefinito;
            }

            // Imposta la ricerca predefinita
            if (!string.IsNullOrEmpty(Predefiniti_Ricerca.RicercaPredefinita))
            {
                viewModel.TestoRicerca = Predefiniti_Ricerca.RicercaPredefinita;
                viewModel.InModalitaRicerca = true;
            }
        }

        [HttpPost]
        public async Task<JsonResult> GetPartiCorpo(string ambulatorio)
        {
            try
            {
                var parti = await _esameService.GetPartiCorpoPerAmbulatorioAsync(ambulatorio);
                return Json(new { success = true, data = parti });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<JsonResult> GetEsami(string ambulatorio, string parteCorpo)
        {
            try
            {
                var esami = await _esameService.GetEsamiPerAmbulatorioEParteAsync(ambulatorio, parteCorpo);
                return Json(new { success = true, data = esami });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<JsonResult> RicercaEsami(string filtro, string campo)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(filtro))
                {
                    return Json(new { success = false, message = "Inserire un testo di ricerca" });
                }

                var esami = await _esameService.RicercaEsamiAsync(filtro, campo);
                return Json(new { success = true, data = esami });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<JsonResult> GetDatiCompleti()
        {
            try
            {
                var ambulatori = await _esameService.GetAmbulatoriAsync();
                var parti = new List<string>();
                var esami = new List<Esame>();

                if (ambulatori.Any())
                {
                    parti = await _esameService.GetPartiCorpoPerAmbulatorioAsync(ambulatori.First());

                    if (parti.Any())
                    {
                        esami = await _esameService.GetEsamiPerAmbulatorioEParteAsync(ambulatori.First(), parti.First());
                    }
                }

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        ambulatori = ambulatori,
                        parti = parti,
                        esami = esami
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
    }
}