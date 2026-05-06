using System.Security.Claims;
using System.Text;
using MasonryEstimation.Data;
using MasonryEstimation.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MasonryEstimation.Controllers;

[Authorize]
[ApiController]
[Route("api/projects")]
public class ProjectsApiController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;

    public ProjectsApiController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetProjects()
    {
        var userId = GetUserId();
        var projects = await _dbContext.MasonryProjects
            .Where(project => project.UserId == userId)
            .Include(project => project.EstimateLines)
            .OrderByDescending(project => project.Id)
            .ToListAsync();

        return Ok(projects.Select(ToProjectDto));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<object>> GetProject(int id)
    {
        var project = await FindProject(id);
        return project is null ? NotFound() : Ok(ToProjectDto(project));
    }

    [HttpPost]
    public async Task<ActionResult<object>> CreateProject(ProjectCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Client))
        {
            return BadRequest("Project name and client are required.");
        }

        var project = new MasonryProject
        {
            UserId = GetUserId(),
            Name = request.Name.Trim(),
            Client = request.Client.Trim(),
            Location = request.Location.Trim(),
            BidDueDate = request.BidDueDate,
            MarkupPercent = 12
        };

        _dbContext.MasonryProjects.Add(project);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, ToProjectDto(project));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var project = await FindProject(id);

        if (project is null)
        {
            return NotFound();
        }

        _dbContext.MasonryProjects.Remove(project);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{projectId:int}/items")]
    public async Task<ActionResult<object>> CreateEstimateLine(int projectId, EstimateLineCreateRequest request)
    {
        var project = await FindProject(projectId);

        if (project is null)
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(request.Description) || request.Quantity <= 0)
        {
            return BadRequest("Description and quantity are required.");
        }

        project.EstimateLines.Add(new EstimateLine
        {
            Area = request.Area.Trim(),
            Description = request.Description.Trim(),
            Unit = request.Unit.Trim(),
            Quantity = request.Quantity,
            MaterialUnitCost = request.MaterialUnitCost,
            LaborUnitCost = request.LaborUnitCost,
            BomCategory = request.BomCategory.Trim()
        });

        await _dbContext.SaveChangesAsync();
        return Ok(ToProjectDto(project));
    }

    [HttpDelete("{projectId:int}/items/{itemId:int}")]
    public async Task<ActionResult<object>> DeleteEstimateLine(int projectId, int itemId)
    {
        var project = await FindProject(projectId);
        var line = project?.EstimateLines.FirstOrDefault(item => item.Id == itemId);

        if (project is null || line is null)
        {
            return NotFound();
        }

        _dbContext.EstimateLines.Remove(line);
        project.EstimateLines.Remove(line);
        await _dbContext.SaveChangesAsync();

        return Ok(ToProjectDto(project));
    }

    [HttpGet("{id:int}/materials.csv")]
    public async Task<IActionResult> ExportMaterials(int id)
    {
        var project = await FindProject(id);

        if (project is null)
        {
            return NotFound();
        }

        var csv = new StringBuilder();
        csv.AppendLine("Category,Quantity,Material Cost");

        foreach (var item in ToMaterialSummary(project))
        {
            csv.AppendLine($"{Escape(item.Category)},{item.Quantity},{item.Cost}");
        }

        return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", $"{project.Name}-materials.csv");
    }

    private async Task<MasonryProject?> FindProject(int id)
    {
        return await _dbContext.MasonryProjects
            .Include(project => project.EstimateLines)
            .FirstOrDefaultAsync(project => project.Id == id && project.UserId == GetUserId());
    }

    private string GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
    }

    private static object ToProjectDto(MasonryProject project)
    {
        var subtotal = project.EstimateLines.Sum(line => line.Total);
        var markup = subtotal * (project.MarkupPercent / 100);
        var total = subtotal + markup;

        return new
        {
            project.Id,
            project.Name,
            project.Client,
            project.Location,
            project.Status,
            BidDueDate = project.BidDueDate.ToString("yyyy-MM-dd"),
            project.MarkupPercent,
            Summary = new
            {
                MaterialTotal = project.EstimateLines.Sum(line => line.MaterialTotal),
                LaborTotal = project.EstimateLines.Sum(line => line.LaborTotal),
                Subtotal = subtotal,
                Markup = markup,
                Total = total
            },
            project.EstimateLines,
            BillOfMaterials = ToMaterialSummary(project)
        };
    }

    private static IEnumerable<MaterialSummaryDto> ToMaterialSummary(MasonryProject project)
    {
        return project.EstimateLines
            .GroupBy(line => line.BomCategory)
            .Select(group => new MaterialSummaryDto
            {
                Category = group.Key,
                Quantity = group.Sum(line => line.Quantity),
                Cost = group.Sum(line => line.MaterialTotal)
            })
            .OrderBy(item => item.Category);
    }

    private static string Escape(string value)
    {
        return value.Contains(',') ? $"\"{value}\"" : value;
    }

    private sealed class MaterialSummaryDto
    {
        public string Category { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal Cost { get; set; }
    }
}
