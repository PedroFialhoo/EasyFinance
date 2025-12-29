package com.easyfinance.dtos;

import java.time.LocalDate;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class BillDto {
    private Integer id;
    private String name;
    private CategoryDto category;
    private String typePayment;
    private CardDto card;
    private UserDto user;
    private int numberInstallments;    
    private double totalValue;
    
    private LocalDate firstDueDate; 
    //pro caso de contas com uma parcela
    private LocalDate paymentDate;
}
