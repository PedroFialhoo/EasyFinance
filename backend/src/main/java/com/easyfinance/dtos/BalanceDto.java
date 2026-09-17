package com.easyfinance.dtos;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class BalanceDto {
    private boolean initialized;
    private double balance;
    private String lastRevenueMonth;
    private Double monthlyRevenue;
    private Integer revenuePaymentDay;
    private List<BalanceEntryDto> entries = new ArrayList<>();
}
