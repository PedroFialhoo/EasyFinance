package com.easyfinance.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.easyfinance.models.BillInstallment;

@Repository
public interface BillInstallmentRepository extends JpaRepository<BillInstallment, Integer> {
    List<BillInstallment> findByDueDateBetween(LocalDate inicio,LocalDate fim);
    List<BillInstallment> findByBillId(int billId);

}
