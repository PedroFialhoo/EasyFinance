package com.easyfinance.dtos;

import java.time.LocalDate;

import com.easyfinance.models.TypePayment;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class BillInstallmentDto {
    private int id;
    private LocalDate dueDate;
    private LocalDate paymentDate;
    private int installmentNumber;
    private Double value;
    private TypePayment typePayment;
    private CardDto cardDto;

}
