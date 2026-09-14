package com.easyfinance.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryExpenseDto {
    private String category;
    private Double value;
}
