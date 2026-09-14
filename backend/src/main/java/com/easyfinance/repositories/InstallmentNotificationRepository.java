package com.easyfinance.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.easyfinance.models.InstallmentNotification;

public interface InstallmentNotificationRepository extends JpaRepository<InstallmentNotification, Integer> {
    boolean existsByInstallmentIdAndNotificationType(int installmentId, String notificationType);
}
