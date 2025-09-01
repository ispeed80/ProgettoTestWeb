// File: ProgettoTest/Config/ConfigClasses.cs
// Classi di configurazione statiche per il caricamento dal file INI

namespace ProgettoTest.ConfigPredefiniti
{
    // Sezione [Database] del file INI
    public static class Predefiniti_Database
    {
        public static string Server { get; set; } = "(localdb)\\MSSQLLocalDB";
        public static string DatabaseName { get; set; } = "EsamiDB";
        public static bool IntegratedSecurity { get; set; } = true;
        public static string UserId { get; set; } = "";
        public static string Password { get; set; } = "";
        public static int TimeoutConnessione { get; set; } = 30;
    }

    // Sezione [Ricerca] del file INI
    public static class Predefiniti_Ricerca
    {
        public static string RicercaPredefinita { get; set; } = "";
        public static string TipoRicercaPredefinito { get; set; } = "Descrizione Esame";
    }

    // Sezione [StampaServer] del file INI - esempio delle specifiche
    public static class Predefiniti_StampaServer
    {
        public static int StampaServerEnabled { get; set; } = 0;
        public static int UpdateInterval { get; set; } = 3;
    }

    // Sezione [Archivio] del file INI - esempio delle specifiche
    public static class Predefiniti_Archivio
    {
        public static string ArchivioPath { get; set; } = "";
        public static string CatalogName { get; set; } = "";
        public static int MaxStorageDaysCheckInterval { get; set; } = 10;
    }

    // Sezione [Dicom] del file INI - esempio delle specifiche
    public static class Predefiniti_Dicom
    {
        public static string DCMColPrintProcessServerAdditionalOptions { get; set; } = "";
        public static string DCMBNPrintProcessServerAdditionalOptions { get; set; } = "";
    }
}