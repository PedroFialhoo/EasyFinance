package com.easyfinance.dtos;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class ReminderSummaryDto {
    private int pendingCount;
    private List<ReminderDto> overdue = new ArrayList<>();
    private List<ReminderDto> dueToday = new ArrayList<>();
    private List<ReminderDto> upcoming = new ArrayList<>();
}
