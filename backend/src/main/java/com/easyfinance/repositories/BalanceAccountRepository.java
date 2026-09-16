package com.easyfinance.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.easyfinance.models.BalanceAccount;

public interface BalanceAccountRepository extends JpaRepository<BalanceAccount, Integer> {
    Optional<BalanceAccount> findByUserId(int userId);
}
