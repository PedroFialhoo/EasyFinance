package com.easyfinance.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyfinance.dtos.BankDto;
import com.easyfinance.models.Bank;
import com.easyfinance.repositories.BankRepository;

@Service
public class BankService {
    @Autowired
    private BankRepository bankRepository;

    public boolean create(BankDto dto){
        Bank bank = new Bank();
        bank.setName(dto.getName());

        bankRepository.save(bank);
        return true;
    }
}
