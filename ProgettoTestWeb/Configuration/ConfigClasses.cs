namespace ProgettoTestWeb.Configuration
{
    // Corrisponde alla sezione "Ricerca" in appsettings.json
    public static class Predefiniti_Ricerca
    {
        public static string RicercaPredefinita { get; set; } = "";
        public static string TipoRicercaPredefinito { get; set; } = "Descrizione Esame";
    }

    // Corrisponde alla sezione "Database" in appsettings.json
    public static class Predefiniti_Database
    {
        public static string Server { get; set; } = "";
        public static string DatabaseName { get; set; } = "";
        public static bool IntegratedSecurity { get; set; } = true;
        public static string UserId { get; set; } = "";
        public static string Password { get; set; } = "";
        public static int TimeoutConnessione { get; set; } = 15;
    }

    // Classi per binding dalla configurazione
    public class RicercaConfig
    {
        public string RicercaPredefinita { get; set; } = "";
        public string TipoRicercaPredefinito { get; set; } = "Descrizione Esame";
    }

    public class DatabaseConfig
    {
        public string Server { get; set; } = "";
        public string DatabaseName { get; set; } = "";
        public bool IntegratedSecurity { get; set; } = true;
        public string UserId { get; set; } = "";
        public string Password { get; set; } = "";
        public int TimeoutConnessione { get; set; } = 15;
    }
}