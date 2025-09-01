using Microsoft.Data.SqlClient;
using ProgettoTestWeb.Models;
using System.Data;

namespace ProgettoTestWeb.Services
{
    public interface IEsameService
    {
        Task<List<Esame>> GetTuttiEsamiAsync();
        Task<List<string>> GetAmbulatoriAsync();
        Task<List<string>> GetPartiCorpoAsync();
        Task<List<string>> GetPartiCorpoPerAmbulatorioAsync(string ambulatorio);
        Task<List<Esame>> GetEsamiPerAmbulatorioEParteAsync(string ambulatorio, string parteCorpo);
        Task<List<Esame>> RicercaEsamiAsync(string filtro, string campo);
        Task<List<string>> GetAmbulatoriPerRicercaAsync(string filtro, string campo);
        Task<List<string>> GetPartiCorpoPerRicercaAsync(string filtro, string campo);

        // Admin functions
        Task<List<Ambulatorio>> GetAmbulatoriCompletiAsync();
        Task<List<ParteDelCorpo>> GetPartiCorpoCompleteAsync();
        Task<List<EsameCompleto>> GetEsamiCompletiAsync();
        Task AggiungiAmbulatorioAsync(string nome);
        Task AggiungiParteCorpoAsync(string nome);
        Task AggiungiEsameAsync(NuovoEsameDto esame);
        Task EliminaAmbulatorioAsync(int id);
        Task EliminaParteCorpoAsync(int id);
        Task EliminaEsameAsync(int id);
    }

    public class EsameService : IEsameService
    {
        private readonly string _connectionString;

        public EsameService(string connectionString)
        {
            _connectionString = connectionString;
        }

        // ==================== GET TUTTI GLI ESAMI ====================
        public async Task<List<Esame>> GetTuttiEsamiAsync()
        {
            var esami = new List<Esame>();
            const string query = @"
                SELECT 
                    e.Id,
                    e.CodiceMinisteriale, 
                    e.CodiceInterno, 
                    e.DescrizioneEsame, 
                    p.NomeParte AS ParteCorpo, 
                    a.NomeAmbulatorio AS Ambulatorio
                FROM Ambulatori a
                LEFT JOIN EsamiAmbulatori ea ON a.Id = ea.AmbulatorioId
                LEFT JOIN Esami e ON ea.EsameId = e.Id
                LEFT JOIN PartiDelCorpo p ON e.ParteDelCorpoId = p.Id
                WHERE e.Id IS NOT NULL
                ORDER BY a.NomeAmbulatorio, p.NomeParte, e.DescrizioneEsame";

            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var cmd = new SqlCommand(query, conn);
            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                esami.Add(new Esame
                {
                    Id = (int)reader["Id"],
                    CodiceMinisteriale = reader["CodiceMinisteriale"] as string ?? "",
                    CodiceInterno = reader["CodiceInterno"] as string ?? "",
                    DescrizioneEsame = reader["DescrizioneEsame"] as string ?? "",
                    ParteCorpo = reader["ParteCorpo"] as string ?? "",
                    Ambulatorio = reader["Ambulatorio"] as string ?? ""
                });
            }

            return esami;
        }

        // ==================== GET AMBULATORI ====================
        public async Task<List<string>> GetAmbulatoriAsync()
        {
            var ambulatori = new List<string>();
            const string query = "SELECT DISTINCT NomeAmbulatorio FROM Ambulatori ORDER BY NomeAmbulatorio";

            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var cmd = new SqlCommand(query, conn);
            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                ambulatori.Add(reader["NomeAmbulatorio"] as string ?? "");
            }

            return ambulatori;
        }

        // ==================== GET PARTI DEL CORPO ====================
        public async Task<List<string>> GetPartiCorpoAsync()
        {
            var parti = new List<string>();
            const string query = "SELECT DISTINCT NomeParte FROM PartiDelCorpo ORDER BY NomeParte";

            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var cmd = new SqlCommand(query, conn);
            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                parti.Add(reader["NomeParte"] as string ?? "");
            }

            return parti;
        }

        public async Task<List<string>> GetPartiCorpoPerAmbulatorioAsync(string ambulatorio)
        {
            var parti = new List<string>();
            const string query = @"
                SELECT DISTINCT p.NomeParte 
                FROM PartiDelCorpo p
                INNER JOIN Esami e ON p.Id = e.ParteDelCorpoId
                INNER JOIN EsamiAmbulatori ea ON e.Id = ea.EsameId
                INNER JOIN Ambulatori a ON ea.AmbulatorioId = a.Id
                WHERE a.NomeAmbulatorio = @ambulatorio
                ORDER BY p.NomeParte";

            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@ambulatorio", ambulatorio);
            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                parti.Add(reader["NomeParte"] as string ?? "");
            }

            return parti;
        }

        // ==================== GET ESAMI PER AMBULATORIO E PARTE ====================
        public async Task<List<Esame>> GetEsamiPerAmbulatorioEParteAsync(string ambulatorio, string parteCorpo)
        {
            var esami = new List<Esame>();
            const string query = @"
                SELECT 
                    e.Id,
                    e.CodiceMinisteriale, 
                    e.CodiceInterno, 
                    e.DescrizioneEsame, 
                    p.NomeParte AS ParteCorpo, 
                    a.NomeAmbulatorio AS Ambulatorio
                FROM Esami e
                INNER JOIN PartiDelCorpo p ON e.ParteDelCorpoId = p.Id
                INNER JOIN EsamiAmbulatori ea ON e.Id = ea.EsameId
                INNER JOIN Ambulatori a ON ea.AmbulatorioId = a.Id
                WHERE a.NomeAmbulatorio = @ambulatorio AND p.NomeParte = @parteCorpo
                ORDER BY e.DescrizioneEsame";

            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@ambulatorio", ambulatorio);
            cmd.Parameters.AddWithValue("@parteCorpo", parteCorpo);
            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                esami.Add(new Esame
                {
                    Id = (int)reader["Id"],
                    CodiceMinisteriale = reader["CodiceMinisteriale"] as string ?? "",
                    CodiceInterno = reader["CodiceInterno"] as string ?? "",
                    DescrizioneEsame = reader["DescrizioneEsame"] as string ?? "",
                    ParteCorpo = reader["ParteCorpo"] as string ?? "",
                    Ambulatorio = reader["Ambulatorio"] as string ?? ""
                });
            }

            return esami;
        }

        // ==================== RICERCA ESAMI ====================
        public async Task<List<Esame>> RicercaEsamiAsync(string filtro, string campo)
        {
            var esami = new List<Esame>();
            string colonnaDaCercare = campo switch
            {
                "Codice Ministeriale" => "e.CodiceMinisteriale",
                "Codice Interno" => "e.CodiceInterno",
                "Descrizione Esame" => "e.DescrizioneEsame",
                _ => "e.DescrizioneEsame"
            };

            string query = $@"
                SELECT DISTINCT
                    e.Id,
                    e.CodiceMinisteriale, 
                    e.CodiceInterno, 
                    e.DescrizioneEsame, 
                    p.NomeParte AS ParteCorpo, 
                    a.NomeAmbulatorio AS Ambulatorio
                FROM Esami e
                INNER JOIN PartiDelCorpo p ON e.ParteDelCorpoId = p.Id
                INNER JOIN EsamiAmbulatori ea ON e.Id = ea.EsameId
                INNER JOIN Ambulatori a ON ea.AmbulatorioId = a.Id
                WHERE {colonnaDaCercare} LIKE @filtro COLLATE SQL_Latin1_General_CP1_CI_AI
                ORDER BY e.DescrizioneEsame";

            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@filtro", $"%{filtro}%");
            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                esami.Add(new Esame
                {
                    Id = (int)reader["Id"],
                    CodiceMinisteriale = reader["CodiceMinisteriale"] as string ?? "",
                    CodiceInterno = reader["CodiceInterno"] as string ?? "",
                    DescrizioneEsame = reader["DescrizioneEsame"] as string ?? "",
                    ParteCorpo = reader["ParteCorpo"] as string ?? "",
                    Ambulatorio = reader["Ambulatorio"] as string ?? ""
                });
            }

            return esami;
        }

        // ==================== METODI PER RICERCA FILTRATA ====================
        public async Task<List<string>> GetAmbulatoriPerRicercaAsync(string filtro, string campo)
        {
            var ambulatori = new List<string>();
            string colonnaDaCercare = campo switch
            {
                "Codice Ministeriale" => "e.CodiceMinisteriale",
                "Codice Interno" => "e.CodiceInterno",
                "Descrizione Esame" => "e.DescrizioneEsame",
                _ => "e.DescrizioneEsame"
            };

            string query = $@"
                SELECT DISTINCT a.NomeAmbulatorio
                FROM Ambulatori a
                INNER JOIN EsamiAmbulatori ea ON a.Id = ea.AmbulatorioId
                INNER JOIN Esami e ON ea.EsameId = e.Id
                WHERE {colonnaDaCercare} LIKE @filtro COLLATE SQL_Latin1_General_CP1_CI_AI
                ORDER BY a.NomeAmbulatorio";

            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@filtro", $"%{filtro}%");
            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                ambulatori.Add(reader["NomeAmbulatorio"] as string ?? "");
            }

            return ambulatori;
        }

        public async Task<List<string>> GetPartiCorpoPerRicercaAsync(string filtro, string campo)
        {
            var parti = new List<string>();
            string colonnaDaCercare = campo switch
            {
                "Codice Ministeriale" => "e.CodiceMinisteriale",
                "Codice Interno" => "e.CodiceInterno",
                "Descrizione Esame" => "e.DescrizioneEsame",
                _ => "e.DescrizioneEsame"
            };

            string query = $@"
                SELECT DISTINCT p.NomeParte
                FROM PartiDelCorpo p
                INNER JOIN Esami e ON p.Id = e.ParteDelCorpoId
                WHERE {colonnaDaCercare} LIKE @filtro COLLATE SQL_Latin1_General_CP1_CI_AI
                ORDER BY p.NomeParte";

            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@filtro", $"%{filtro}%");
            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                parti.Add(reader["NomeParte"] as string ?? "");
            }

            return parti;
        }

        // ==================== ADMIN METHODS ====================
        public async Task<List<Ambulatorio>> GetAmbulatoriCompletiAsync()
        {
            var ambulatori = new List<Ambulatorio>();
            const string query = "SELECT Id, NomeAmbulatorio FROM Ambulatori ORDER BY NomeAmbulatorio";

            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var cmd = new SqlCommand(query, conn);
            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                ambulatori.Add(new Ambulatorio
                {
                    Id = (int)reader["Id"],
                    NomeAmbulatorio = reader["NomeAmbulatorio"] as string ?? ""
                });
            }

            return ambulatori;
        }

        public async Task<List<ParteDelCorpo>> GetPartiCorpoCompleteAsync()
        {
            var parti = new List<ParteDelCorpo>();
            const string query = "SELECT Id, NomeParte FROM PartiDelCorpo ORDER BY NomeParte";

            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var cmd = new SqlCommand(query, conn);
            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                parti.Add(new ParteDelCorpo
                {
                    Id = (int)reader["Id"],
                    NomeParte = reader["NomeParte"] as string ?? ""
                });
            }

            return parti;
        }

        public async Task<List<EsameCompleto>> GetEsamiCompletiAsync()
        {
            var esami = new List<EsameCompleto>();
            const string query = @"
                SELECT e.Id AS Id,
                       e.CodiceMinisteriale,
                       e.CodiceInterno,
                       e.DescrizioneEsame,
                       p.NomeParte AS ParteCorpo,
                       ISNULL(STUFF(
                           (SELECT ', ' + a.NomeAmbulatorio
                            FROM EsamiAmbulatori ea
                            JOIN Ambulatori a ON ea.AmbulatorioId = a.Id
                            WHERE ea.EsameId = e.Id
                            FOR XML PATH('')), 1, 2, ''), '') AS Ambulatori
                FROM Esami e
                JOIN PartiDelCorpo p ON e.ParteDelCorpoId = p.Id
                ORDER BY e.DescrizioneEsame";

            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var cmd = new SqlCommand(query, conn);
            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                var ambulatoriString = reader["Ambulatori"] as string ?? "";
                esami.Add(new EsameCompleto
                {
                    Id = (int)reader["Id"],
                    CodiceMinisteriale = reader["CodiceMinisteriale"] as string ?? "",
                    CodiceInterno = reader["CodiceInterno"] as string ?? "",
                    DescrizioneEsame = reader["DescrizioneEsame"] as string ?? "",
                    ParteCorpo = reader["ParteCorpo"] as string ?? "",
                    AmbulatoriAssociati = string.IsNullOrEmpty(ambulatoriString)
                        ? new List<string>()
                        : ambulatoriString.Split(", ").ToList()
                });
            }

            return esami;
        }

        public async Task AggiungiAmbulatorioAsync(string nome)
        {
            const string query = "INSERT INTO Ambulatori (NomeAmbulatorio) VALUES (@nome)";
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@nome", nome);
            await cmd.ExecuteNonQueryAsync();
        }

        public async Task AggiungiParteCorpoAsync(string nome)
        {
            const string query = "INSERT INTO PartiDelCorpo (NomeParte) VALUES (@nome)";
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@nome", nome);
            await cmd.ExecuteNonQueryAsync();
        }

        public async Task AggiungiEsameAsync(NuovoEsameDto esame)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var transaction = conn.BeginTransaction();

            try
            {
                // Inserisci l'esame
                const string insertEsameQuery = @"
                    INSERT INTO Esami (CodiceMinisteriale, CodiceInterno, DescrizioneEsame, ParteDelCorpoId)
                    OUTPUT INSERTED.Id
                    VALUES (@codMin, @codInt, @descr, (SELECT Id FROM PartiDelCorpo WHERE NomeParte = @parte))";

                int esameId;
                using (var cmd = new SqlCommand(insertEsameQuery, conn, transaction))
                {
                    cmd.Parameters.AddWithValue("@codMin", esame.CodiceMinisteriale);
                    cmd.Parameters.AddWithValue("@codInt", esame.CodiceInterno);
                    cmd.Parameters.AddWithValue("@descr", esame.DescrizioneEsame);
                    cmd.Parameters.AddWithValue("@parte", esame.ParteCorpo);

                    esameId = (int)await cmd.ExecuteScalarAsync();
                }

                // Collega agli ambulatori
                const string insertAmbQuery = @"
                    INSERT INTO EsamiAmbulatori (EsameId, AmbulatorioId)
                    VALUES (@esameId, (SELECT Id FROM Ambulatori WHERE NomeAmbulatorio = @amb))";

                foreach (string ambulatorio in esame.AmbulatoriSelezionati)
                {
                    using var cmd = new SqlCommand(insertAmbQuery, conn, transaction);
                    cmd.Parameters.AddWithValue("@esameId", esameId);
                    cmd.Parameters.AddWithValue("@amb", ambulatorio);
                    await cmd.ExecuteNonQueryAsync();
                }

                transaction.Commit();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task EliminaAmbulatorioAsync(int id)
        {
            const string query = "DELETE FROM Ambulatori WHERE Id = @id";
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@id", id);
            await cmd.ExecuteNonQueryAsync();
        }

        public async Task EliminaParteCorpoAsync(int id)
        {
            const string query = "DELETE FROM PartiDelCorpo WHERE Id = @id";
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@id", id);
            await cmd.ExecuteNonQueryAsync();
        }

        public async Task EliminaEsameAsync(int id)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var transaction = conn.BeginTransaction();

            try
            {
                // Prima elimina le relazioni
                const string deleteRelazioni = "DELETE FROM EsamiAmbulatori WHERE EsameId = @id";
                using (var cmd = new SqlCommand(deleteRelazioni, conn, transaction))
                {
                    cmd.Parameters.AddWithValue("@id", id);
                    await cmd.ExecuteNonQueryAsync();
                }

                // Poi elimina l'esame
                const string deleteEsame = "DELETE FROM Esami WHERE Id = @id";
                using (var cmd = new SqlCommand(deleteEsame, conn, transaction))
                {
                    cmd.Parameters.AddWithValue("@id", id);
                    await cmd.ExecuteNonQueryAsync();
                }

                transaction.Commit();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}