package com.easyfinance.dtos;

import lombok.Data;

@Data
public class BalanceAdjustmentDto {
    private double balance;
    private String description;
}
