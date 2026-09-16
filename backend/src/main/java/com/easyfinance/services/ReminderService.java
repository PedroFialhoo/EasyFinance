package com.easyfinance.services;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.easyfinance.dtos.ReminderDto;
import com.easyfinance.dtos.ReminderPreferenceDto;
import com.easyfinance.dtos.ReminderSummaryDto;
import com.easyfinance.models.BillInstallment;
import com.easyfinance.models.InstallmentNotification;
import com.easyfinance.models.NotificationPreference;
import com.easyfinance.models.User;
import com.easyfinance.models.UserSession;
import com.easyfinance.repositories.BillInstallmentRepository;
import com.easyfinance.repositories.InstallmentNotificationRepository;
import com.easyfinance.repositories.NotificationPreferenceRepository;
import com.easyfinance.repositories.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class ReminderService {
    private final BillInstallmentRepository installmentRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final InstallmentNotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final BillService billService;

    public ReminderService(BillInstallmentRepository installmentRepository,
            NotificationPreferenceRepository preferenceRepository,
            InstallmentNotificationRepository notificationRepository,
            UserRepository userRepository,
            BillService billService) {
        this.installmentRepository = installmentRepository;
        this.preferenceRepository = preferenceRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.billService = billService;
    }

    public ReminderSummaryDto getSummary() {
        User user = getActiveUser();
        LocalDate today = LocalDate.now();
        billService.ensureRecurringOccurrencesThrough(user.getId(), today.plusDays(30));
        List<BillInstallment> installments = installmentRepository.findPendingByUserUntil(user.getId(), today.plusDays(7));
        ReminderSummaryDto summary = new ReminderSummaryDto();

        for (BillInstallment installment : installments) {
            ReminderDto reminder = toDto(installment, today);
            if (reminder.getDaysUntilDue() < 0) {
                summary.getOverdue().add(reminder);
            } else if (reminder.getDaysUntilDue() == 0) {
                summary.getDueToday().add(reminder);
            } else {
                summary.getUpcoming().add(reminder);
            }
        }
        summary.setPendingCount(summary.getOverdue().size() + summary.getDueToday().size() + summary.getUpcoming().size());
        return summary;
    }

    public List<ReminderDto> getCalendar(int year, int month) {
        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("Mes invalido");
        }
        User user = getActiveUser();
        YearMonth selectedMonth = YearMonth.of(year, month);
        LocalDate today = LocalDate.now();
        billService.ensureRecurringOccurrencesThrough(user.getId(), selectedMonth.atEndOfMonth());
        return installmentRepository.findPendingByUserAndDueDateRange(user.getId(), selectedMonth.atDay(1), selectedMonth.plusMonths(1).atDay(1))
                .stream()
                .map(installment -> toDto(installment, today))
                .toList();
    }

    public ReminderPreferenceDto getPreferences() {
        return toPreferenceDto(getOrCreatePreference(getActiveUser()));
    }

    @Transactional
    public ReminderPreferenceDto updatePreferences(ReminderPreferenceDto dto) {
        if (dto == null || dto.getDaysBeforeDue() == null || dto.getDaysBeforeDue().isEmpty()) {
            throw new IllegalArgumentException("Selecione pelo menos um dia de aviso");
        }
        if (dto.getDaysBeforeDue().stream().anyMatch(day -> day == null || day < 0 || day > 30)) {
            throw new IllegalArgumentException("Os dias de aviso devem estar entre 0 e 30");
        }
        List<Integer> days = dto.getDaysBeforeDue().stream().distinct().sorted(Comparator.reverseOrder()).toList();
        NotificationPreference preference = getOrCreatePreference(getActiveUser());
        preference.setEnabled(dto.isEnabled());
        preference.setDaysBeforeDue(days.stream().map(String::valueOf).reduce((first, second) -> first + "," + second).orElse("0"));
        preferenceRepository.save(preference);
        return toPreferenceDto(preference);
    }

    @Transactional
    public List<ReminderDto> getNewNotifications() {
        User user = getActiveUser();
        NotificationPreference preference = getOrCreatePreference(user);
        if (!preference.isEnabled()) {
            return List.of();
        }
        LocalDate today = LocalDate.now();
        billService.ensureRecurringOccurrencesThrough(user.getId(), today.plusDays(30));
        List<Integer> configuredDays = parseDays(preference.getDaysBeforeDue());
        List<ReminderDto> notifications = new ArrayList<>();
        for (BillInstallment installment : installmentRepository.findPendingByUserUntil(user.getId(), today.plusDays(30))) {
            long daysUntilDue = ChronoUnit.DAYS.between(today, installment.getDueDate());
            String type = daysUntilDue < 0 ? "OVERDUE" : "DUE_" + daysUntilDue;
            if ((daysUntilDue >= 0 && !configuredDays.contains((int) daysUntilDue))
                    || notificationRepository.existsByInstallmentIdAndNotificationType(installment.getId(), type)) {
                continue;
            }
            InstallmentNotification notification = new InstallmentNotification();
            notification.setInstallment(installment);
            notification.setNotificationType(type);
            notification.setSentDate(today);
            notificationRepository.save(notification);
            notifications.add(toDto(installment, today));
        }
        return notifications;
    }

    private ReminderDto toDto(BillInstallment installment, LocalDate today) {
        ReminderDto dto = new ReminderDto();
        dto.setInstallmentId(installment.getId());
        dto.setBillId(installment.getBill().getId());
        dto.setName(installment.getBill().getName());
        dto.setCategory(installment.getBill().getCategory().getName());
        dto.setValue(installment.getValue());
        dto.setDueDate(installment.getDueDate());
        long daysUntilDue = ChronoUnit.DAYS.between(today, installment.getDueDate());
        dto.setDaysUntilDue(daysUntilDue);
        dto.setStatus(daysUntilDue < 0 ? "OVERDUE" : daysUntilDue == 0 ? "TODAY" : "UPCOMING");
        return dto;
    }

    private NotificationPreference getOrCreatePreference(User user) {
        return preferenceRepository.findByUserId(user.getId()).orElseGet(() -> {
            NotificationPreference preference = new NotificationPreference();
            preference.setUser(user);
            return preferenceRepository.save(preference);
        });
    }

    private ReminderPreferenceDto toPreferenceDto(NotificationPreference preference) {
        ReminderPreferenceDto dto = new ReminderPreferenceDto();
        dto.setEnabled(preference.isEnabled());
        dto.setDaysBeforeDue(parseDays(preference.getDaysBeforeDue()));
        return dto;
    }

    private List<Integer> parseDays(String value) {
        return Arrays.stream(value.split(",")).map(Integer::valueOf).sorted(Comparator.reverseOrder()).toList();
    }

    private User getActiveUser() {
        Integer userId = UserSession.getId();
        if (userId == null) {
            throw new IllegalArgumentException("Nenhuma conta ativa");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Conta ativa nao encontrada"));
    }
}
