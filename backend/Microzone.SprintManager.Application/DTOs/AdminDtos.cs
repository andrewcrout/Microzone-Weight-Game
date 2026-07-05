namespace Microzone.SprintManager.Application.DTOs;

public sealed record SaveWeightCardRequest(int? Id, int WeightValue, int TimeScore, string TimeLabel, string EstimatedTime, string Element, string Line);
public sealed record WeightCardDto(int Id, int WeightValue, int TimeScore, string TimeLabel, string EstimatedTime, string Element, string Line);

public sealed record SaveSystemDefinitionRequest(int? Id, string Name);
public sealed record SystemDefinitionDto(int Id, string Name);
