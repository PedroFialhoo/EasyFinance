package com.easyfinance.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.easyfinance.models.BillInstallment;

@Repository
public interface BillInstallmentRepository extends JpaRepository<BillInstallment, Integer> {
}
