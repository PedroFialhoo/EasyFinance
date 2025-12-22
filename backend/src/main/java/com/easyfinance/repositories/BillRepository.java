package com.easyfinance.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.easyfinance.models.Bill;

@Repository
public interface BillRepository extends JpaRepository<Bill, Integer> {
    
}
