package com.easyfinance.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.easyfinance.models.BillInstallment;

import jakarta.transaction.Transactional;

@Repository
public interface BillInstallmentRepository extends JpaRepository<BillInstallment, Integer> {
    List<BillInstallment> findByDueDateBetween(LocalDate inicio,LocalDate fim);

    @Query("""
        SELECT bi
        FROM BillInstallment bi
        WHERE bi.bill.user.id = :userId
        AND bi.dueDate >= :start
        AND bi.dueDate < :end
    """)
    List<BillInstallment> findByUserAndDueDateRange(
        @Param("userId") int userId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );

    List<BillInstallment> findByBillId(int billId);
    
    @Modifying
    @Transactional
    void deleteAllByBillId(int billId);

    BillInstallment findByBillIdAndInstallmentNumber(int billId, int installmentNumber);

}
