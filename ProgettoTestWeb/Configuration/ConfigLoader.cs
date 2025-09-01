using Microsoft.Data.SqlClient;

namespace ProgettoTestWeb.Configuration
{
    public static class ConfigLoader
    {
        public static void CaricaConfigurazione(IConfiguration configuration)
        {
            // Carica configurazione Ricerca
            var ricercaConfig = new RicercaConfig();
            configuration.GetSection("Ricerca").Bind(ricercaConfig);

            Predefiniti_Ricerca.RicercaPredefinita = ricercaConfig.RicercaPredefinita;
            Predefiniti_Ricerca.TipoRicercaPredefinito = ricercaConfig.TipoRicercaPredefinito;

            // Carica configurazione Database
            var databaseConfig = new DatabaseConfig();
            configuration.GetSection("Database").Bind(databaseConfig);

            Predefiniti_Database.Server = databaseConfig.Server;
            Predefiniti_Database.DatabaseName = databaseConfig.DatabaseName;
            Predefiniti_Database.IntegratedSecurity = databaseConfig.IntegratedSecurity;
            Predefiniti_Database.UserId = databaseConfig.UserId;
            Predefiniti_Database.Password = databaseConfig.Password;
            Predefiniti_Database.TimeoutConnessione = databaseConfig.TimeoutConnessione;
        }

        public static string CreaConnectionString(IConfiguration configuration)
        {
            var databaseConfig = new DatabaseConfig();
            configuration.GetSection("Database").Bind(databaseConfig);

            var builder = new SqlConnectionStringBuilder
            {
                DataSource = databaseConfig.Server,
                InitialCatalog = databaseConfig.DatabaseName,
                ConnectTimeout = databaseConfig.TimeoutConnessione
            };

            if (databaseConfig.IntegratedSecurity)
            {
                builder.IntegratedSecurity = true;
            }
            else
            {
                builder.UserID = databaseConfig.UserId;
                builder.Password = databaseConfig.Password;
            }

            return builder.ConnectionString;
        }
    }
}
