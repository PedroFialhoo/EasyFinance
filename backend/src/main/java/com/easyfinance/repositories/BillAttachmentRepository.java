package com.easyfinance.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.easyfinance.models.BillAttachment;

@Repository
public interface BillAttachmentRepository extends JpaRepository<BillAttachment, Integer> {
    List<BillAttachment> findByBillIdOrderByCreatedAtDesc(int billId);

    Optional<BillAttachment> findByIdAndBillId(int id, int billId);
}
