package com.easyfinance.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.easyfinance.models.Bill;

@Repository
public interface BillRepository extends JpaRepository<Bill, Integer> {
    Optional<List<Bill>> findByUserId(Integer userId);

    Optional<List<Bill>> findByCardId(Integer cardId);

    List<Bill> findByCategoryId(Integer categoryId);

    @Query("""
        SELECT DISTINCT b
        FROM Bill b
        JOIN b.billInstallments bi
        WHERE b.user.id = :userId
        AND bi.dueDate BETWEEN :start AND :end
        AND (:categoryId IS NULL OR b.category.id = :categoryId)
    """)
    List<Bill> findByFilters(
        @Param("userId") int userId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end,
        @Param("categoryId") Integer categoryId
    );
}
