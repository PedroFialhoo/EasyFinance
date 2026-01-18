package com.easyfinance.dtos;

import java.time.LocalDate;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class BillInstallmentDto {
    private int id;
    private LocalDate dueDate;
    private LocalDate paymenDate;
    private int installmentNumber;
    private Double value;

}
