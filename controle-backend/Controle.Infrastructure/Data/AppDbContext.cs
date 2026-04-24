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
    public DbSet<Mesa> Mesas { get; set; }
    public DbSet<TipoProduto> TiposProduto { get; set; }
    public DbSet<ProdutoImagem> ProdutoImagens { get; set; }
    public DbSet<VarianteAtributo> VarianteAtributos { get; set; }
    public DbSet<VarianteAtributoValor> VarianteAtributoValores { get; set; }
    public DbSet<ProdutoVariante> ProdutoVariantes { get; set; }
    public DbSet<ProdutoVarianteAtributo> ProdutoVarianteAtributos { get; set; }
    public DbSet<GrupoOpcao> GruposOpcao { get; set; }
    public DbSet<OpcaoItem> OpcaoItens { get; set; }
    public DbSet<PedidoItemOpcao> PedidoItemOpcoes { get; set; }
    public DbSet<ComboEtapa> ComboEtapas { get; set; }
    public DbSet<ComboEtapaOpcao> ComboEtapaOpcoes { get; set; }

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

        // Configuração PedidoItem Pai-Filho (Combos)
        modelBuilder.Entity<PedidoItem>()
            .HasOne(pi => pi.ParentPedidoItem)
            .WithMany(pi => pi.SubItens)
            .HasForeignKey(pi => pi.ParentPedidoItemId)
            .OnDelete(DeleteBehavior.Cascade); // Deletar combo deleta itens

        // Variantes de Varejo
        modelBuilder.Entity<ProdutoVarianteAtributo>()
            .HasKey(pva => new { pva.ProdutoVarianteId, pva.VarianteAtributoValorId });

        modelBuilder.Entity<ProdutoVarianteAtributo>()
            .HasOne(pva => pva.ProdutoVariante)
            .WithMany(pv => pv.Atributos)
            .HasForeignKey(pva => pva.ProdutoVarianteId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProdutoVarianteAtributo>()
            .HasOne(pva => pva.VarianteAtributoValor)
            .WithMany()
            .HasForeignKey(pva => pva.VarianteAtributoValorId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProdutoVariante>()
            .HasOne(pv => pv.ProdutoLoja)
            .WithMany(pl => pl.Variantes)
            .HasForeignKey(pv => pv.ProdutoLojaId)
            .OnDelete(DeleteBehavior.Cascade);

        // Produto Configurável - Grupos de Opção
        modelBuilder.Entity<GrupoOpcao>()
            .HasOne(g => g.ProdutoLoja)
            .WithMany(pl => pl.GruposOpcao)
            .HasForeignKey(g => g.ProdutoLojaId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OpcaoItem>()
            .HasOne(o => o.GrupoOpcao)
            .WithMany(g => g.Itens)
            .HasForeignKey(o => o.GrupoOpcaoId)
            .OnDelete(DeleteBehavior.Cascade);

        // PedidoItemOpcao
        modelBuilder.Entity<PedidoItemOpcao>()
            .HasOne(pio => pio.PedidoItem)
            .WithMany(pi => pi.Opcoes)
            .HasForeignKey(pio => pio.PedidoItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PedidoItemOpcao>()
            .HasOne(pio => pio.OpcaoItem)
            .WithMany()
            .HasForeignKey(pio => pio.OpcaoItemId)
            .OnDelete(DeleteBehavior.Restrict);

        // Combos em Etapas
        modelBuilder.Entity<ComboEtapa>()
            .HasOne(e => e.Combo)
            .WithMany(c => c.Etapas)
            .HasForeignKey(e => e.ComboId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ComboEtapaOpcao>()
            .HasOne(o => o.Etapa)
            .WithMany(e => e.Opcoes)
            .HasForeignKey(o => o.ComboEtapaId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ComboEtapaOpcao>()
            .HasOne(o => o.ProdutoLoja)
            .WithMany()
            .HasForeignKey(o => o.ProdutoLojaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
