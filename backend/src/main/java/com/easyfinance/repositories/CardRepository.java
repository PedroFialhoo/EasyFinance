package com.easyfinance.repositories;

import com.easyfinance.models.Card;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardRepository extends JpaRepository<Card, Integer> {
    List<Optional<Card>> findByUserId(Integer userId);
    List<Optional<Card>> findByHolderId(Integer holderId);
    List<Optional<Card>> findByBankId(Integer bankId);
}
