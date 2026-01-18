package com.easyfinance.repositories;

import com.easyfinance.models.Holder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HolderRepository extends JpaRepository<Holder, Integer> {
    
}
