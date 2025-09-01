using Microsoft.AspNetCore.Mvc;
using ProgettoTestWeb.Models;
using ProgettoTestWeb.Services;

namespace ProgettoTestWeb.Controllers
{
    public class AdminController : Controller
    {
        private readonly IEsameService _esameService;

        public AdminController(IEsameService esameService)
        {
            _esameService = esameService;
        }

        public async Task<IActionResult> Index()
        {
            var viewModel = new AdminViewModel();
            await CaricaDatiAdmin(viewModel);
            return View(viewModel);
        }

        private async Task CaricaDatiAdmin(AdminViewModel viewModel)
        {
            viewModel.Ambulatori = await _esameService.GetAmbulatoriCompletiAsync();
            viewModel.PartiDelCorpo = await _esameService.GetPartiCorpoCompleteAsync();
            viewModel.Esami = await _esameService.GetEsamiCompletiAsync();

            // Popola le liste per il nuovo esame
            viewModel.NuovoEsame.AmbulatoriDisponibili = viewModel.Ambulatori.Select(a => a.NomeAmbulatorio).ToList();
            viewModel.NuovoEsame.PartiCorpoDisponibili = viewModel.PartiDelCorpo.Select(p => p.NomeParte).ToList();
        }

        [HttpPost]
        public async Task<JsonResult> AggiungiAmbulatorio([FromBody] AggiungiAmbulatorioRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Nome))
                {
                    return Json(new { success = false, message = "Il nome dell'ambulatorio è richiesto." });
                }

                await _esameService.AggiungiAmbulatorioAsync(request.Nome.Trim());
                return Json(new { success = true, message = "Ambulatorio aggiunto con successo." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Errore durante l'aggiunta: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<JsonResult> AggiungiParteCorpo([FromBody] AggiungiParteCorpoRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Nome))
                {
                    return Json(new { success = false, message = "Il nome della parte del corpo è richiesto." });
                }

                await _esameService.AggiungiParteCorpoAsync(request.Nome.Trim());
                return Json(new { success = true, message = "Parte del corpo aggiunta con successo." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Errore durante l'aggiunta: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> AggiungiEsame(NuovoEsameDto nuovoEsame)
        {
            var viewModel = new AdminViewModel { NuovoEsame = nuovoEsame };

            try
            {
                if (!ModelState.IsValid)
                {
                    viewModel.MessaggioErrore = "Compila tutti i campi richiesti.";
                    await CaricaDatiAdmin(viewModel);
                    return View("Index", viewModel);
                }

                if (nuovoEsame.AmbulatoriSelezionati == null || !nuovoEsame.AmbulatoriSelezionati.Any())
                {
                    viewModel.MessaggioErrore = "Seleziona almeno un ambulatorio.";
                    await CaricaDatiAdmin(viewModel);
                    return View("Index", viewModel);
                }

                await _esameService.AggiungiEsameAsync(nuovoEsame);

                TempData["SuccessMessage"] = "Esame aggiunto con successo!";
                return RedirectToAction("Index");
            }
            catch (Exception ex)
            {
                viewModel.MessaggioErrore = $"Errore durante l'aggiunta dell'esame: {ex.Message}";
                await CaricaDatiAdmin(viewModel);
                return View("Index", viewModel);
            }
        }

        [HttpPost]
        public async Task<JsonResult> EliminaAmbulatorio([FromBody] EliminaRequest request)
        {
            try
            {
                await _esameService.EliminaAmbulatorioAsync(request.Id);
                return Json(new { success = true, message = "Ambulatorio eliminato con successo." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Errore durante l'eliminazione: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<JsonResult> EliminaParteCorpo([FromBody] EliminaRequest request)
        {
            try
            {
                await _esameService.EliminaParteCorpoAsync(request.Id);
                return Json(new { success = true, message = "Parte del corpo eliminata con successo." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Errore durante l'eliminazione: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<JsonResult> EliminaEsame([FromBody] EliminaRequest request)
        {
            try
            {
                await _esameService.EliminaEsameAsync(request.Id);
                return Json(new { success = true, message = "Esame eliminato con successo." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Errore durante l'eliminazione: {ex.Message}" });
            }
        }

        [HttpGet]
        public async Task<JsonResult> CaricaDati()
        {
            try
            {
                var data = new
                {
                    ambulatori = await _esameService.GetAmbulatoriCompletiAsync(),
                    partiCorpo = await _esameService.GetPartiCorpoCompleteAsync(),
                    esami = await _esameService.GetEsamiCompletiAsync()
                };

                return Json(new { success = true, data = data });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
    }

    // DTOs per le richieste AJAX Admin
    public class AggiungiAmbulatorioRequest
    {
        public string Nome { get; set; } = string.Empty;
    }

    public class AggiungiParteCorpoRequest
    {
        public string Nome { get; set; } = string.Empty;
    }

    public class EliminaRequest
    {
        public int Id { get; set; }
    }
}