package com.easyfinance.dtos;

import java.time.LocalDate;

import com.easyfinance.models.BalanceEntryType;

import lombok.Data;

@Data
public class BalanceEntryDto {
    private Integer id;
    private BalanceEntryType type;
    private double amount;
    private double balanceAfter;
    private String description;
    private LocalDate entryDate;
}
