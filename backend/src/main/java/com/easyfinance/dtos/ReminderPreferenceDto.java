package com.easyfinance.dtos;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class ReminderPreferenceDto {
    private boolean enabled = true;
    private List<Integer> daysBeforeDue = new ArrayList<>(List.of(7, 3, 1, 0));
}
