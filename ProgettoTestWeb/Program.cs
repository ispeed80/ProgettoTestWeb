using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ProgettoTestWeb.Services;

var builder = WebApplication.CreateBuilder(args);

// Legge la sezione Database dal JSON
var dbConfig = builder.Configuration.GetSection("Database");
string connectionString;

if (dbConfig.GetValue<bool>("IntegratedSecurity"))
{
    connectionString = $"Server={dbConfig["Server"]};Database={dbConfig["DatabaseName"]};Trusted_Connection=True;Connect Timeout={dbConfig["TimeoutConnessione"]};";
}
else
{
    connectionString = $"Server={dbConfig["Server"]};Database={dbConfig["DatabaseName"]};User Id={dbConfig["UserId"]};Password={dbConfig["Password"]};Connect Timeout={dbConfig["TimeoutConnessione"]};";
}

// Registrazione del servizio EsameService con la connection string
builder.Services.AddScoped<IEsameService>(_ => new EsameService(connectionString));

// Aggiungi servizi MVC
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Middleware
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
