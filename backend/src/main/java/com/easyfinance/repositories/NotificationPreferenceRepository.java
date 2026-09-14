package com.easyfinance.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.easyfinance.models.NotificationPreference;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Integer> {
    Optional<NotificationPreference> findByUserId(int userId);
}
