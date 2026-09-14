package com.easyfinance.dtos;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DashboardDto {
    private List<MonthlySummaryDto> monthlySummary = new ArrayList<>();
    private List<CategoryExpenseDto> expensesByCategory = new ArrayList<>();
}
