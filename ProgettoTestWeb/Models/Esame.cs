using System.ComponentModel.DataAnnotations;

namespace ProgettoTestWeb.Models
{
    public class Esame
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(10)]
        [Display(Name = "Codice Ministeriale")]
        public string CodiceMinisteriale { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        [Display(Name = "Codice Interno")]
        public string CodiceInterno { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Display(Name = "Descrizione Esame")]
        public string DescrizioneEsame { get; set; } = string.Empty;

        [Display(Name = "Parte del Corpo")]
        public string ParteCorpo { get; set; } = string.Empty;

        [Display(Name = "Ambulatorio")]
        public string Ambulatorio { get; set; } = string.Empty;

        // Per visualizzazione nelle ListBox/Select - come nel WinForms
        public override string ToString()
        {
            return DescrizioneEsame; // Serve per far apparire il nome nell'elenco, come nel WinForms
        }
    }

    public class Ambulatorio
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        [Display(Name = "Nome Ambulatorio")]
        public string NomeAmbulatorio { get; set; } = string.Empty;

        public override string ToString() => NomeAmbulatorio;
    }

    public class ParteDelCorpo
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        [Display(Name = "Nome Parte")]
        public string NomeParte { get; set; } = string.Empty;

        public override string ToString() => NomeParte;
    }

    // ==================== VIEW MODELS ====================

    public class MainViewModel
    {
        public List<string> Ambulatori { get; set; } = new();
        public List<string> PartiCorpo { get; set; } = new();
        public List<Esame> Esami { get; set; } = new();
        public List<Esame> EsamiSelezionati { get; set; } = new();

        // Parametri di ricerca
        public string TestoRicerca { get; set; } = string.Empty;
        public string CampoRicerca { get; set; } = "Descrizione Esame";
        public List<string> CampiRicercaDisponibili { get; set; } = new()
        {
            "Codice Ministeriale",
            "Codice Interno",
            "Descrizione Esame"
        };

        // Selezioni correnti
        public string? AmbulatorioSelezionato { get; set; }
        public string? ParteCorpoSelezionata { get; set; }
        public int? EsameSelezionatoId { get; set; }

        // Stati
        public bool InModalitaRicerca { get; set; }
        public string? MessaggioErrore { get; set; }
        public string? MessaggioSuccesso { get; set; }
    }

    public class AdminViewModel
    {
        public List<Ambulatorio> Ambulatori { get; set; } = new();
        public List<ParteDelCorpo> PartiDelCorpo { get; set; } = new();
        public List<EsameCompleto> Esami { get; set; } = new();

        // Per nuovo esame
        public NuovoEsameDto NuovoEsame { get; set; } = new();

        public string? MessaggioErrore { get; set; }
        public string? MessaggioSuccesso { get; set; }
    }

    public class EsameCompleto : Esame
    {
        public List<string> AmbulatoriAssociati { get; set; } = new();
        public string AmbulatoriString => string.Join(", ", AmbulatoriAssociati);
    }

    public class NuovoEsameDto
    {
        [Required(ErrorMessage = "Il codice ministeriale è richiesto")]
        [MaxLength(10, ErrorMessage = "Il codice ministeriale non può superare i 10 caratteri")]
        [Display(Name = "Codice Ministeriale")]
        public string CodiceMinisteriale { get; set; } = string.Empty;

        [Required(ErrorMessage = "Il codice interno è richiesto")]
        [MaxLength(10, ErrorMessage = "Il codice interno non può superare i 10 caratteri")]
        [Display(Name = "Codice Interno")]
        public string CodiceInterno { get; set; } = string.Empty;

        [Required(ErrorMessage = "La descrizione è richiesta")]
        [MaxLength(100, ErrorMessage = "La descrizione non può superare i 100 caratteri")]
        [Display(Name = "Descrizione Esame")]
        public string DescrizioneEsame { get; set; } = string.Empty;

        [Required(ErrorMessage = "Selezionare una parte del corpo")]
        [Display(Name = "Parte del Corpo")]
        public string ParteCorpo { get; set; } = string.Empty;

        [Required(ErrorMessage = "Selezionare almeno un ambulatorio")]
        public List<string> AmbulatoriSelezionati { get; set; } = new();

        // Liste per le dropdown
        public List<string> PartiCorpoDisponibili { get; set; } = new();
        public List<string> AmbulatoriDisponibili { get; set; } = new();
    }

    // ==================== DTOs per AJAX ====================

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