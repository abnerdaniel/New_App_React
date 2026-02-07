using Controle.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Controle.Infrastructure.Data;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Bloqueios> Bloqueios { get; set; }
    public DbSet<Cargo> Cargos { get; set; }
    public DbSet<Funcionario> Funcionarios { get; set; }
    public DbSet<ClienteFinal> CientesFinais { get; set; }
    public DbSet<Endereco> Enderecos { get; set; }
    public DbSet<Loja> Lojas { get; set; }
    public DbSet<Pedido> Pedidos { get; set; }
    public DbSet<ProdutoLoja> ProdutosLojas { get; set; }
    public DbSet<Produto> Produtos { get; set; }
    public DbSet<PedidoItem> PedidoItems { get; set; }
    public DbSet<Cardapio> Cardapios { get; set; }
    public DbSet<Categoria> Categorias { get; set; }
    public DbSet<Combo> Combos { get; set; }
    public DbSet<ComboItem> ComboItems { get; set; }
    public DbSet<ProdutoCategoria> ProdutoCategorias { get; set; }
    public DbSet<ProdutoAdicional> ProdutoAdicionais { get; set; }
    public DbSet<PedidoItemAdicional> PedidoItemAdicionais { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        modelBuilder.Entity<Loja>()
            .Property(l => l.Id)
            .ValueGeneratedNever();

        modelBuilder.Entity<Usuario>()
            .Property(u => u.Id)
            .ValueGeneratedNever();

        modelBuilder.Entity<ProdutoCategoria>()
            .HasKey(pc => new { pc.ProdutoLojaId, pc.CategoriaId });

        modelBuilder.Entity<ProdutoCategoria>()
            .HasOne(pc => pc.ProdutoLoja)
            .WithMany(p => p.ProdutoCategorias)
            .HasForeignKey(pc => pc.ProdutoLojaId);

        modelBuilder.Entity<ProdutoCategoria>()
            .HasOne(pc => pc.Categoria)
            .WithMany(c => c.ProdutoCategorias)
            .HasForeignKey(pc => pc.CategoriaId);

        // Configuração ProdutoAdicional (Many-to-Many Self Referencing)
        modelBuilder.Entity<ProdutoAdicional>()
            .HasKey(pa => new { pa.ProdutoPaiId, pa.ProdutoFilhoId });

        modelBuilder.Entity<ProdutoAdicional>()
            .HasOne(pa => pa.ProdutoPai)
            .WithMany(p => p.Adicionais)
            .HasForeignKey(pa => pa.ProdutoPaiId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProdutoAdicional>()
            .HasOne(pa => pa.ProdutoFilho)
            .WithMany()
            .HasForeignKey(pa => pa.ProdutoFilhoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
