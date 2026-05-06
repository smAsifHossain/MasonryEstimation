using MasonryEstimation.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace MasonryEstimation.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<MasonryProject> MasonryProjects => Set<MasonryProject>();
    public DbSet<EstimateLine> EstimateLines => Set<EstimateLine>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<MasonryProject>()
            .HasMany(project => project.EstimateLines)
            .WithOne()
            .HasForeignKey(line => line.MasonryProjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
