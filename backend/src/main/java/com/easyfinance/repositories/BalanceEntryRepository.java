package com.easyfinance.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.easyfinance.models.BalanceEntry;

public interface BalanceEntryRepository extends JpaRepository<BalanceEntry, Integer> {
    boolean existsByReferenceKey(String referenceKey);
    Optional<BalanceEntry> findByReferenceKey(String referenceKey);
    List<BalanceEntry> findByUserIdOrderByEntryDateDescIdDesc(int userId);
}
