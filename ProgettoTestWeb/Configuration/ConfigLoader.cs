// File: ProgettoTestWeb/Configuration/ConfigLoader.cs
// Caricatore di configurazione da file INI con reflection dinamica

using System;
using System.Globalization;
using System.IO;
using System.Reflection;
using Microsoft.Extensions.Configuration;

namespace ProgettoTestWeb.Configuration
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

    public static class ConfigLoader
    {
        private const string CONFIG_FILE_NAME = "config.ini";

        public static void CaricaConfigurazione(IConfiguration configuration)
        {
            // Carica dalle configurazioni di ASP.NET Core prima
            CaricaDaConfiguration(configuration);

            // Poi prova a caricare dal file INI se esiste
            string configPath = Path.Combine(Directory.GetCurrentDirectory(), CONFIG_FILE_NAME);
            if (File.Exists(configPath))
            {
                try
                {
                    CaricaConfigurazioneINI(configPath);
                }
                catch (Exception ex)
                {
                    // Log errore ma continua con valori di default
                    System.Diagnostics.Debug.WriteLine($"Errore caricamento configurazione: {ex.Message}");
                }
            }
        }

        private static void CaricaDaConfiguration(IConfiguration configuration)
        {
            try
            {
                // Carica configurazioni Database
                var dbSection = configuration.GetSection("Database");
                if (dbSection.Exists())
                {
                    Predefiniti_Database.Server = dbSection["Server"] ?? Predefiniti_Database.Server;
                    Predefiniti_Database.DatabaseName = dbSection["DatabaseName"] ?? Predefiniti_Database.DatabaseName;
                    if (bool.TryParse(dbSection["IntegratedSecurity"], out bool intSec))
                        Predefiniti_Database.IntegratedSecurity = intSec;
                    Predefiniti_Database.UserId = dbSection["UserId"] ?? Predefiniti_Database.UserId;
                    Predefiniti_Database.Password = dbSection["Password"] ?? Predefiniti_Database.Password;
                    if (int.TryParse(dbSection["TimeoutConnessione"], out int timeout))
                        Predefiniti_Database.TimeoutConnessione = timeout;
                }

                // Carica configurazioni Ricerca
                var ricercaSection = configuration.GetSection("Ricerca");
                if (ricercaSection.Exists())
                {
                    Predefiniti_Ricerca.RicercaPredefinita = ricercaSection["RicercaPredefinita"] ?? Predefiniti_Ricerca.RicercaPredefinita;
                    Predefiniti_Ricerca.TipoRicercaPredefinito = ricercaSection["TipoRicercaPredefinito"] ?? Predefiniti_Ricerca.TipoRicercaPredefinito;
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Errore caricamento da appsettings: {ex.Message}");
            }
        }

        private static void CaricaConfigurazioneINI(string filePath)
        {
            var lines = File.ReadAllLines(filePath);
            string sezioneCorrente = "";

            foreach (string line in lines)
            {
                string linePulita = line.Trim();

                // Ignora righe vuote e commenti
                if (string.IsNullOrEmpty(linePulita) || linePulita.StartsWith("#"))
                    continue;

                // Gestione sezioni [NomeSezione]
                if (linePulita.StartsWith("[") && linePulita.EndsWith("]"))
                {
                    sezioneCorrente = linePulita.Substring(1, linePulita.Length - 2);
                    continue;
                }

                // Gestione proprietà: nome = valore
                if (linePulita.Contains("="))
                {
                    ProcessaProprietaConfigurazione(sezioneCorrente, linePulita);
                }
            }
        }

        private static void ProcessaProprietaConfigurazione(string sezione, string linea)
        {
            var parti = linea.Split(new[] { '=' }, 2);
            if (parti.Length != 2) return;

            string nomeProprietà = parti[0].Trim();
            string valoreStringa = parti[1].Trim();

            // Rimuovi virgolette dalle stringhe
            if (valoreStringa.StartsWith("\"") && valoreStringa.EndsWith("\"") && valoreStringa.Length > 1)
            {
                valoreStringa = valoreStringa.Substring(1, valoreStringa.Length - 2);
            }

            // Cerca la classe statica corrispondente
            string nomeClasse = $"ProgettoTestWeb.Configuration.Predefiniti_{sezione}";
            Type? classeConfig = Type.GetType(nomeClasse);

            if (classeConfig == null) return;

            // Cerca la proprietà corrispondente
            PropertyInfo? proprietà = classeConfig.GetProperty(nomeProprietà,
                BindingFlags.Public | BindingFlags.Static);

            if (proprietà == null || !proprietà.CanWrite) return;

            try
            {
                // Converti il valore al tipo appropriato
                object? valore = ConvertiValore(valoreStringa, proprietà.PropertyType);
                if (valore != null)
                {
                    proprietà.SetValue(null, valore);
                }
            }
            catch (Exception ex)
            {
                // Log errore di conversione ma continua
                System.Diagnostics.Debug.WriteLine(
                    $"Errore conversione {nomeClasse}.{nomeProprietà} = '{valoreStringa}': {ex.Message}");
            }
        }

        private static object? ConvertiValore(string valoreStringa, Type tipoDestinazione)
        {
            if (string.IsNullOrEmpty(valoreStringa))
                return GetDefaultValue(tipoDestinazione);

            // Gestione tipi specifici
            if (tipoDestinazione == typeof(string))
                return valoreStringa;

            if (tipoDestinazione == typeof(int))
                return int.Parse(valoreStringa, CultureInfo.InvariantCulture);

            if (tipoDestinazione == typeof(bool))
            {
                // Accetta 1/0, true/false, yes/no
                string valoreLower = valoreStringa.ToLowerInvariant();
                return valoreLower == "1" || valoreLower == "true" || valoreLower == "yes";
            }

            if (tipoDestinazione == typeof(double))
                return double.Parse(valoreStringa, CultureInfo.InvariantCulture);

            if (tipoDestinazione == typeof(float))
                return float.Parse(valoreStringa, CultureInfo.InvariantCulture);

            if (tipoDestinazione == typeof(decimal))
                return decimal.Parse(valoreStringa, CultureInfo.InvariantCulture);

            // Prova conversione generica
            return Convert.ChangeType(valoreStringa, tipoDestinazione, CultureInfo.InvariantCulture);
        }

        private static object? GetDefaultValue(Type tipo)
        {
            if (tipo.IsValueType)
                return Activator.CreateInstance(tipo);

            return null;
        }
    }
}