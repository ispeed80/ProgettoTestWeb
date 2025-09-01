// File: ProgettoTest/Config/ConfigLoader.cs
// Caricatore di configurazione da file INI con reflection dinamica

using System;
using System.Globalization;
using System.IO;
using System.Reflection;
using static System.Net.Mime.MediaTypeNames;

namespace ProgettoTest.ConfigPredefiniti
{
    public static class ConfigLoader
    {
        private const string CONFIG_FILE_NAME = "config.ini";

        public static void CaricaConfigurazione()
        {
            string configPath = Path.Combine(Application.StartupPath, CONFIG_FILE_NAME);

            if (!File.Exists(configPath))
            {
                // File non trovato, usa valori di default
                return;
            }

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
            string nomeClasse = $"ProgettoTest.ConfigPredefiniti.Predefiniti_{sezione}";
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