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

        // Per visualizzazione nelle ListBox/Select
        public override string ToString()
        {
            return $"{CodiceMinisteriale} - {DescrizioneEsame}";
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

    // ViewModels per le viste
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
        [Required]
        [MaxLength(10)]
        public string CodiceMinisteriale { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string CodiceInterno { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string DescrizioneEsame { get; set; } = string.Empty;

        [Required]
        public string ParteCorpo { get; set; } = string.Empty;

        [Required]
        public List<string> AmbulatoriSelezionati { get; set; } = new();

        // Liste per le dropdown
        public List<string> PartiCorpoDisponibili { get; set; } = new();
        public List<string> AmbulatoriDisponibili { get; set; } = new();
    }
}