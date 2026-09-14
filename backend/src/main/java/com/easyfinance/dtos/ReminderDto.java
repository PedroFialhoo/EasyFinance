package com.easyfinance.dtos;

import java.time.LocalDate;

import lombok.Data;

@Data
public class ReminderDto {
    private int installmentId;
    private int billId;
    private String name;
    private String category;
    private double value;
    private LocalDate dueDate;
    private String status;
    private long daysUntilDue;
}
