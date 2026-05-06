namespace MasonryEstimation.Models;

public class MasonryProject
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Client { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Status { get; set; } = "Estimating";
    public DateOnly BidDueDate { get; set; }
    public decimal MarkupPercent { get; set; } = 12;
    public List<EstimateLine> EstimateLines { get; set; } = [];
}

public class EstimateLine
{
    public int Id { get; set; }
    public int MasonryProjectId { get; set; }
    public string Area { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Unit { get; set; } = "each";
    public decimal Quantity { get; set; }
    public decimal MaterialUnitCost { get; set; }
    public decimal LaborUnitCost { get; set; }
    public string BomCategory { get; set; } = "Masonry";

    public decimal MaterialTotal => Quantity * MaterialUnitCost;
    public decimal LaborTotal => Quantity * LaborUnitCost;
    public decimal Total => MaterialTotal + LaborTotal;
}

public class ProjectCreateRequest
{
    public string Name { get; set; } = string.Empty;
    public string Client { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DateOnly BidDueDate { get; set; } = DateOnly.FromDateTime(DateTime.Today.AddDays(14));
}

public class EstimateLineCreateRequest
{
    public string Area { get; set; } = "Base Bid";
    public string Description { get; set; } = string.Empty;
    public string Unit { get; set; } = "each";
    public decimal Quantity { get; set; }
    public decimal MaterialUnitCost { get; set; }
    public decimal LaborUnitCost { get; set; }
    public string BomCategory { get; set; } = "Masonry";
}
