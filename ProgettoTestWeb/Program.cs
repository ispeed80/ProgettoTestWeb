using ProgettoTestWeb.Services;
using ProgettoTestWeb.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Configurazione della connection string
string connectionString = ConfigLoader.CreaConnectionString(builder.Configuration);
builder.Services.AddSingleton<IEsameService>(provider => new EsameService(connectionString));

// Configurazione sessioni se necessario
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();

// Carica configurazioni predefinite all'avvio
ConfigLoader.CaricaConfigurazione(app.Configuration);

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseSession(); // Se utilizzi le sessioni
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
