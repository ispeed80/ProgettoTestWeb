using ProgettoTestWeb.Services;

var builder = WebApplication.CreateBuilder(args);

// Configurazione della connection string
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? 
                      "Server=(localdb)\\MSSQLLocalDB;Database=EsamiDB;Trusted_Connection=true;";

// Aggiungi servizi al container
builder.Services.AddScoped<IEsameService>(_ => new EsameService(connectionString));

// Aggiungi servizi MVC
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline
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