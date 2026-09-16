package com.easyfinance.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.easyfinance.dtos.ReminderDto;
import com.easyfinance.dtos.ReminderSummaryDto;
import com.easyfinance.models.Bill;
import com.easyfinance.models.BillInstallment;
import com.easyfinance.models.Category;
import com.easyfinance.models.NotificationPreference;
import com.easyfinance.models.User;
import com.easyfinance.models.UserSession;
import com.easyfinance.repositories.BillInstallmentRepository;
import com.easyfinance.repositories.InstallmentNotificationRepository;
import com.easyfinance.repositories.NotificationPreferenceRepository;
import com.easyfinance.repositories.UserRepository;

@ExtendWith(MockitoExtension.class)
class ReminderServiceTest {
    @Mock private BillInstallmentRepository installmentRepository;
    @Mock private NotificationPreferenceRepository preferenceRepository;
    @Mock private InstallmentNotificationRepository notificationRepository;
    @Mock private UserRepository userRepository;
    @Mock private BillService billService;
    @InjectMocks private ReminderService reminderService;

    @AfterEach
    void clearSession() {
        UserSession.setId(null);
    }

    @Test
    void summarySeparatesOverdueTodayAndUpcomingInstallments() {
        User user = activeUser();
        LocalDate today = LocalDate.now();
        when(installmentRepository.findPendingByUserUntil(1, today.plusDays(7))).thenReturn(List.of(
                installment(1, "Aluguel", today.minusDays(1)),
                installment(2, "Internet", today),
                installment(3, "Luz", today.plusDays(3))));

        ReminderSummaryDto summary = reminderService.getSummary();

        assertEquals(3, summary.getPendingCount());
        assertEquals("Aluguel", summary.getOverdue().getFirst().getName());
        assertEquals("Internet", summary.getDueToday().getFirst().getName());
        assertEquals("Luz", summary.getUpcoming().getFirst().getName());
    }

    @Test
    void notificationsAreCreatedOnlyForConfiguredDueDates() {
        User user = activeUser();
        NotificationPreference preference = new NotificationPreference();
        preference.setUser(user);
        preference.setDaysBeforeDue("3");
        when(preferenceRepository.findByUserId(1)).thenReturn(Optional.of(preference));
        when(installmentRepository.findPendingByUserUntil(anyInt(), any())).thenReturn(List.of(
                installment(1, "Internet", LocalDate.now().plusDays(3)),
                installment(2, "Luz", LocalDate.now().plusDays(2))));
        when(notificationRepository.existsByInstallmentIdAndNotificationType(1, "DUE_3")).thenReturn(false);

        List<ReminderDto> reminders = reminderService.getNewNotifications();

        assertEquals(1, reminders.size());
        assertEquals("Internet", reminders.getFirst().getName());
        verify(notificationRepository).save(any());
    }

    private User activeUser() {
        UserSession.setId(1);
        User user = new User();
        user.setId(1);
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        return user;
    }

    private BillInstallment installment(int id, String name, LocalDate dueDate) {
        Category category = new Category();
        category.setName("Casa");
        Bill bill = new Bill();
        bill.setId(id);
        bill.setName(name);
        bill.setCategory(category);
        BillInstallment installment = new BillInstallment();
        installment.setId(id);
        installment.setBill(bill);
        installment.setDueDate(dueDate);
        installment.setValue(100);
        return installment;
    }
}
