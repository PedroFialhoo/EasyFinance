package com.easyfinance.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.easyfinance.dtos.ReminderDto;
import com.easyfinance.dtos.ReminderPreferenceDto;
import com.easyfinance.dtos.ReminderSummaryDto;
import com.easyfinance.services.ReminderService;

@RestController
@RequestMapping("/reminders")
public class ReminderController {
    private final ReminderService reminderService;

    public ReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @GetMapping("/summary")
    public ReminderSummaryDto getSummary() {
        return reminderService.getSummary();
    }

    @GetMapping("/calendar")
    public List<ReminderDto> getCalendar(@RequestParam int year, @RequestParam int month) {
        return reminderService.getCalendar(year, month);
    }

    @GetMapping("/notifications")
    public List<ReminderDto> getNotifications() {
        return reminderService.getNewNotifications();
    }

    @GetMapping("/preferences")
    public ReminderPreferenceDto getPreferences() {
        return reminderService.getPreferences();
    }

    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(@RequestBody ReminderPreferenceDto dto) {
        try {
            return ResponseEntity.ok(reminderService.updatePreferences(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
