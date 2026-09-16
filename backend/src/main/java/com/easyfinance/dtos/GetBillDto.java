package com.easyfinance.dtos;

import java.time.LocalDate;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class GetBillDto {
    private Integer month;
    private Integer year;
    private Integer categoryId;
    private LocalDate startDate;
    private LocalDate endDate;
}
