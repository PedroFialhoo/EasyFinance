package com.easyfinance.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.easyfinance.models.Bank;

@Repository
public interface BankRepository extends JpaRepository<Bank, Integer> {
    
}
