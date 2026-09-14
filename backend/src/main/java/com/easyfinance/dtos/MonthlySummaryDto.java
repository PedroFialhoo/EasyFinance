package com.easyfinance.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MonthlySummaryDto {
    private String month;
    private Double revenue;
    private Double expenses;
}
