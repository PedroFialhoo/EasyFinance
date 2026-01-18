package com.easyfinance.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class GetBillDto {
    private Integer month;
    private Integer year;
    private Integer categoryId;
}
