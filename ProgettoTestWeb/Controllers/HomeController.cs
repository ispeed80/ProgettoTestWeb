using Microsoft.AspNetCore.Mvc;
using ProgettoTestWeb.Models;
using ProgettoTestWeb.Services;
using ProgettoTestWeb.Configuration;

namespace ProgettoTestWeb.Controllers
{
    public class HomeController : Controller
    {
        private readonly IEsameService _esameService;

        public HomeController(IEsameService esameService)
        {
            _esameService = esameService;
        }

        public async Task<IActionResult> Index()
        {
            var viewModel = new MainViewModel
            {
                Ambulatori = await _esameService.GetAmbulatoriAsync()
            };

            // Applica configurazioni predefinite se presenti
            ApplicaConfigurazioniPredefinite(viewModel);

            return View(viewModel);
        }

        private void ApplicaConfigurazioniPredefinite(MainViewModel viewModel)
        {
            if (!string.IsNullOrEmpty(Predefiniti_Ricerca.TipoRicercaPredefinito))
            {
                if (viewModel.CampiRicercaDisponibili.Contains(Predefiniti_Ricerca.TipoRicercaPredefinito))
                {
                    viewModel.CampoRicerca = Predefiniti_Ricerca.TipoRicercaPredefinito;
                }
            }

            if (!string.IsNullOrEmpty(Predefiniti_Ricerca.RicercaPredefinita))
            {
                viewModel.TestoRicerca = Predefiniti_Ricerca.RicercaPredefinita;
                viewModel.InModalitaRicerca = true;
            }
        }

        // API endpoints per AJAX calls
        [HttpGet]
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

        [HttpGet]
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
        public async Task<JsonResult> RicercaEsami([FromBody] RicercaRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Filtro))
                {
                    return Json(new { success = false, message = "Inserire un testo di ricerca." });
                }

                var esami = await _esameService.RicercaEsamiAsync(request.Filtro, request.Campo);
                return Json(new { success = true, data = esami });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public JsonResult AggiungiEsameSelezionato([FromBody] EsameSelezionatoRequest request)
        {
            try
            {
                // In una vera applicazione, questo andrebbe salvato in sessione o database
                // Per ora restituiamo solo successo
                return Json(new { success = true, message = "Esame aggiunto alla selezione." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public JsonResult RimuoviEsameSelezionato([FromBody] RimuoviEsameRequest request)
        {
            try
            {
                // Logica per rimuovere dalla sessione/database
                return Json(new { success = true, message = "Esame rimosso dalla selezione." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public JsonResult SpostaEsame([FromBody] SpostaEsameRequest request)
        {
            try
            {
                // Logica per spostare su/giù nella lista
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
    }

    // DTOs per le richieste AJAX
    public class RicercaRequest
    {
        public string Filtro { get; set; } = string.Empty;
        public string Campo { get; set; } = string.Empty;
    }

    public class EsameSelezionatoRequest
    {
        public int EsameId { get; set; }
        public string Ambulatorio { get; set; } = string.Empty;
        public string ParteCorpo { get; set; } = string.Empty;
    }

    public class RimuoviEsameRequest
    {
        public int Index { get; set; }
    }

    public class SpostaEsameRequest
    {
        public int FromIndex { get; set; }
        public int ToIndex { get; set; }
    }
}